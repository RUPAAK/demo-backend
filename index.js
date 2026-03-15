require("dotenv").config();
const express = require("express");
const { pool } = require("./lib/db");
const translationsRouter = require("./routes/translations");

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/translations", translationsRouter);

const port = process.env.PORT || 3000;
const { seed } = require("./lib/seed");

async function start() {
  await pool.query("SELECT 1");
  console.log("Connected");
  await seed();
  console.log("Translations seeded");
  app.listen(port, () => {
    console.log(`Listening on ${port}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});

module.exports = { app, pool };
