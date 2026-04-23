# Auth Portal Assignment

A full stack authentication website built with Node.js, Express, EJS, and Tailwind CSS. It uses file-based JSON storage instead of a database, which makes deployment simpler for internship assignment submissions.

## Features

- User signup and login
- Session-based authentication
- One predefined admin account
- Admin-only user management
- File-based persistent storage in `data/users.json`
- Clean, modern, minimal UI with Tailwind CSS

## Predefined Admin Credentials

- Email: `admin@example.com`
- Username: `admin`
- Password: `password`

## Tech Stack

- Node.js
- Express
- EJS templates
- Tailwind CSS
- Native Node.js `crypto` for password hashing

## Run Locally

```bash
npm install
npm run build:css
npm start
```

Open [http://localhost:3000](http://localhost:3000)

You can also copy `.env.example` to `.env` and set a strong `SESSION_SECRET`.

## Project Structure

```text
.
├── data/
├── public/
├── src/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── styles/
│   ├── utils/
│   └── views/
├── package.json
├── server.js
└── tailwind.config.js
```

## Deployment Notes

- This project does not require a database service.
- Make sure `data/users.json` is writable in your hosting environment.
- Set a strong `SESSION_SECRET` environment variable before deploying.

## Suggested Platforms

- Render
- Railway
- Cyclic
- Any Node.js hosting service that supports file writes
