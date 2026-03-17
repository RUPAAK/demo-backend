const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("./db");

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";

async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

async function findUserByEmail(email) {
  const { rows } = await pool.query(
    "SELECT id, email, username, password_hash FROM users WHERE email = $1",
    [email],
  );
  return rows[0] || null;
}

async function findUserByUsername(username) {
  const { rows } = await pool.query(
    "SELECT id, email, username, password_hash FROM users WHERE username = $1",
    [username],
  );
  return rows[0] || null;
}

async function createUser(email, username, passwordHash) {
  const { rows } = await pool.query(
    "INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username, created_at",
    [email, username, passwordHash],
  );
  return rows[0];
}

async function findUserById(id) {
  const { rows } = await pool.query(
    "SELECT id, email, username, created_at FROM users WHERE id = $1",
    [id],
  );
  return rows[0] || null;
}

module.exports = {
  hashPassword,
  comparePassword,
  signToken,
  verifyToken,
  findUserByEmail,
  findUserByUsername,
  findUserById,
  createUser,
};
