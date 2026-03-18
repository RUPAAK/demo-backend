const { pool } = require("./db");

const LOCALES = ["en", "sv"];
const SECTIONS = ["nav", "auth", "footer", "dashboard", "sidebar"];

function normalizeLocale(locale) {
  if (!locale || typeof locale !== "string") return "en";
  const s = locale.toLowerCase();
  if (s === "en" || s === "english") return "en";
  if (s === "sv" || s === "svenska" || s === "swedish") return "sv";
  return LOCALES.includes(s) ? s : "en";
}

function bySection(rows) {
  const out = {};
  for (const r of rows) {
    if (!out[r.section]) out[r.section] = {};
    out[r.section][r.key] = r.value;
  }
  return out;
}

async function getTranslations(locale, section = null) {
  locale = normalizeLocale(locale);
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

async function getKeys(locale, section = null) {
  locale = normalizeLocale(locale);
  let query = "SELECT section, key, value FROM translations WHERE locale = $1";
  const params = [locale];
  if (section && SECTIONS.includes(section)) {
    query += " AND section = $2";
    params.push(section);
  }
  query += " ORDER BY section, key";
  const { rows } = await pool.query(query, params);
  const flat = {};
  for (const r of rows) {
    const k = section ? r.key : `${r.section}.${r.key}`;
    flat[k] = r.value;
  }
  return flat;
}

module.exports = { getTranslations, getKeys, normalizeLocale, LOCALES, SECTIONS };
