const express = require("express");
const {
  getTranslations,
  getKeys,
  LOCALES,
  SECTIONS,
} = require("../lib/translations");

const router = express.Router();

router.get("/meta/locales", (req, res) => {
  res.json(LOCALES);
});
router.get("/meta/sections", (req, res) => {
  res.json(SECTIONS);
});

router.get("/", async (req, res, next) => {
  try {
    const locale = req.query.locale || "en";
    const data = await getTranslations(locale, null);
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

router.get("/:locale", async (req, res, next) => {
  try {
    const { locale } = req.params;
    const { section } = req.query;
    const data = await getTranslations(locale, section || null);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/:locale/sections/:section", async (req, res, next) => {
  try {
    const { locale, section } = req.params;
    const data = await getTranslations(locale, section);
    if (Object.keys(data).length === 0) {
      return res.status(404).json({ error: "Section not found" });
    }
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/:locale/flat", async (req, res, next) => {
  try {
    const { locale } = req.params;
    const data = await getKeys(locale);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
