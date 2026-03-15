const fs = require("fs");
const path = require("path");
const { pool } = require("./db");

async function seed() {
  const file = path.join(__dirname, "..", "migrations", "001_translations.sql");
  const sql = fs.readFileSync(file, "utf8");
  await pool.query(sql);
}

module.exports = { seed };
