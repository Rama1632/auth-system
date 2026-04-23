const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { hashPassword, verifyPassword } = require("../utils/passwords");

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

const ADMIN_USER = {
  id: "admin-root-account",
  name: "System Administrator",
  username: "admin",
  email: "admin@example.com",
  role: "admin",
  isProtected: true
};

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(USERS_FILE);
  } catch (error) {
    await fs.writeFile(USERS_FILE, "[]", "utf8");
  }
}

async function readUsers() {
  await ensureDataFile();
  const content = await fs.readFile(USERS_FILE, "utf8");

  if (!content.trim()) {
    return [];
  }

  return JSON.parse(content);
}

async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

async function ensureAdminUser() {
  const users = await readUsers();
  const existingAdmin = users.find((user) => user.email === ADMIN_USER.email);

  if (existingAdmin) {
    const normalizedAdmin = {
      ...existingAdmin,
      id: ADMIN_USER.id,
      name: ADMIN_USER.name,
      username: ADMIN_USER.username,
      email: ADMIN_USER.email,
      role: "admin",
      isProtected: true,
      updatedAt: new Date().toISOString()
    };

    const updatedUsers = users.map((user) =>
      user.email === ADMIN_USER.email ? normalizedAdmin : user
    );
    await writeUsers(updatedUsers);
    return normalizedAdmin;
  }

  const adminRecord = {
    ...ADMIN_USER,
    passwordHash: hashPassword("password"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await writeUsers([adminRecord, ...users]);
  return adminRecord;
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    isProtected: Boolean(user.isProtected),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function normalizeIdentity(value) {
  return value.trim().toLowerCase();
}

function validateSignupPayload({ name, username, email, password, confirmPassword }) {
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push("Full name must be at least 2 characters long.");
  }

  if (!username || username.trim().length < 3) {
    errors.push("Username must be at least 3 characters long.");
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username || "")) {
    errors.push("Username can only contain letters, numbers, and underscores.");
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push("Please provide a valid email address.");
  }

  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters long.");
  }

  if (password !== confirmPassword) {
    errors.push("Password and confirm password must match.");
  }

  return errors;
}

async function createUser({ name, username, email, password, confirmPassword }) {
  const errors = validateSignupPayload({ name, username, email, password, confirmPassword });

  if (errors.length > 0) {
    return { errors };
  }

  const users = await readUsers();
  const normalizedEmail = normalizeIdentity(email);
  const normalizedUsername = normalizeIdentity(username);

  if (users.some((user) => normalizeIdentity(user.email) === normalizedEmail)) {
    return { errors: ["That email is already registered."] };
  }

  if (users.some((user) => normalizeIdentity(user.username) === normalizedUsername)) {
    return { errors: ["That username is already taken."] };
  }

  const newUser = {
    id: crypto.randomUUID(),
    name: name.trim(),
    username: username.trim(),
    email: normalizedEmail,
    role: "user",
    passwordHash: hashPassword(password),
    isProtected: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.push(newUser);
  await writeUsers(users);

  return { user: sanitizeUser(newUser) };
}

async function authenticateUser(identity, password) {
  const users = await readUsers();
  const normalizedIdentity = normalizeIdentity(identity);
  const user = users.find((entry) => {
    return (
      normalizeIdentity(entry.email) === normalizedIdentity ||
      normalizeIdentity(entry.username) === normalizedIdentity
    );
  });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return null;
  }

  return sanitizeUser(user);
}

async function listUsers() {
  const users = await readUsers();
  return users
    .map(sanitizeUser)
    .sort((left, right) => {
      if (left.role !== right.role) {
        return left.role === "admin" ? -1 : 1;
      }
      return left.name.localeCompare(right.name);
    });
}

async function getUserById(id) {
  const users = await readUsers();
  return sanitizeUser(users.find((user) => user.id === id));
}

async function updateUserProfile(id, { name, username, email }) {
  const users = await readUsers();
  const targetIndex = users.findIndex((user) => user.id === id);

  if (targetIndex === -1) {
    return { errors: ["User not found."] };
  }

  const targetUser = users[targetIndex];
  const nextName = (name || "").trim();
  const nextUsername = (username || "").trim();
  const nextEmail = normalizeIdentity(email || "");

  const errors = [];

  if (nextName.length < 2) {
    errors.push("Full name must be at least 2 characters long.");
  }

  if (nextUsername.length < 3 || !/^[a-zA-Z0-9_]+$/.test(nextUsername)) {
    errors.push("Username must be at least 3 characters and only contain letters, numbers, and underscores.");
  }

  if (!/^\S+@\S+\.\S+$/.test(nextEmail)) {
    errors.push("Please provide a valid email address.");
  }

  if (
    users.some(
      (user) =>
        user.id !== id && normalizeIdentity(user.email) === nextEmail
    )
  ) {
    errors.push("Another user is already using that email address.");
  }

  if (
    users.some(
      (user) =>
        user.id !== id && normalizeIdentity(user.username) === normalizeIdentity(nextUsername)
    )
  ) {
    errors.push("Another user is already using that username.");
  }

  if (targetUser.role === "admin") {
    if (nextEmail !== ADMIN_USER.email || nextUsername !== ADMIN_USER.username) {
      errors.push("The predefined admin email and username cannot be changed.");
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  const updatedUser = {
    ...targetUser,
    name: nextName,
    username: targetUser.role === "admin" ? ADMIN_USER.username : nextUsername,
    email: targetUser.role === "admin" ? ADMIN_USER.email : nextEmail,
    updatedAt: new Date().toISOString()
  };

  users[targetIndex] = updatedUser;
  await writeUsers(users);

  return { user: sanitizeUser(updatedUser) };
}

async function deleteUser(id) {
  const users = await readUsers();
  const target = users.find((user) => user.id === id);

  if (!target) {
    return { errors: ["User not found."] };
  }

  if (target.role === "admin" || target.isProtected) {
    return { errors: ["The predefined admin account cannot be deleted."] };
  }

  const nextUsers = users.filter((user) => user.id !== id);
  await writeUsers(nextUsers);

  return { success: true };
}

module.exports = {
  ADMIN_USER,
  ensureDataFile,
  ensureAdminUser,
  createUser,
  authenticateUser,
  listUsers,
  getUserById,
  updateUserProfile,
  deleteUser
};
