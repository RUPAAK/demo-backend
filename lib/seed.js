const fs = require("fs");
const path = require("path");
const { pool } = require("./db");
const { findUserByEmail, createUser, hashPassword } = require("./auth");

const migrationsDir = path.join(__dirname, "..", "migrations");

const SEED_USER = {
  username: "rupaak",
  email: "rupakt525@gmail.com",
  password: "kathmandu",
};

async function seed() {
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    await pool.query(sql);
  }

  const existing = await findUserByEmail(SEED_USER.email);
  if (!existing) {
    const passwordHash = await hashPassword(SEED_USER.password);
    await createUser(SEED_USER.email, SEED_USER.username, passwordHash);
  }
}

module.exports = { seed };
