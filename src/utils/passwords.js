const crypto = require("crypto");

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

function hashPassword(password) {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(":")) {
    return false;
  }

  const [salt, originalHash] = storedHash.split(":");
  const derivedHash = crypto.scryptSync(password, salt, KEY_LENGTH);
  const storedBuffer = Buffer.from(originalHash, "hex");

  if (storedBuffer.length !== derivedHash.length) {
    return false;
  }

  return crypto.timingSafeEqual(storedBuffer, derivedHash);
}

module.exports = {
  hashPassword,
  verifyPassword
};
