require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { pool } = require("./lib/db");
const translationsRouter = require("./routes/translations");

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ data: { ok: "Hello from server!" } });
});
app.get("/health", (req, res) => {
  res.json({ data: { ok: true } });
});

app.use("/api/translations", translationsRouter);
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));

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
