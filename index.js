require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { pool } = require("./lib/db");
const translationsRouter = require("./routes/translations");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/translations", translationsRouter);
app.use("/api/auth", require("./routes/auth"));

const port = process.env.PORT || 3000;
const { seed } = require("./lib/seed");

async function start() {
  await pool.query("SELECT 1");
  console.log("Connected");
  await seed();
  app.listen(port, () => {
    console.log(`Listening on ${port}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});

module.exports = { app, pool };
