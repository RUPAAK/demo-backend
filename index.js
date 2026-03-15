require("dotenv").config();
const express = require("express");
const { pool } = require("./lib/db");

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const port = process.env.PORT || 3000;

async function start() {
  await pool.query("SELECT 1");
  console.log("Connected");
  app.listen(port, () => {
    console.log(`Listening on ${port}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});

module.exports = { app, pool };
