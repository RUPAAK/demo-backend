const { pool } = require("./db");

const LOCALES = ["en", "sv"];
const SECTIONS = ["nav", "auth", "footer", "dashboard"];

function bySection(rows) {
  const out = {};
  for (const r of rows) {
    if (!out[r.section]) out[r.section] = {};
    out[r.section][r.key] = r.value;
  }
  return out;
}

async function getTranslations(locale, section = null) {
  if (!LOCALES.includes(locale)) locale = "en";
  let query =
    "SELECT section, key, value FROM translations WHERE locale = $1";
  const params = [locale];
  if (section && SECTIONS.includes(section)) {
    query += " AND section = $2";
    params.push(section);
  }
  query += " ORDER BY section, key";
  const { rows } = await pool.query(query, params);
  return bySection(rows);
}

async function getKeys(locale) {
  if (!LOCALES.includes(locale)) locale = "en";
  const { rows } = await pool.query(
    "SELECT section, key, value FROM translations WHERE locale = $1 ORDER BY section, key",
    [locale]
  );
  const flat = {};
  for (const r of rows) {
    flat[`${r.section}.${r.key}`] = r.value;
  }
  return flat;
}

module.exports = { getTranslations, getKeys, LOCALES, SECTIONS };
