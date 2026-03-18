const express = require("express");
const { pool } = require("../lib/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const pageRaw = req.query.page ?? "1";
    const limitRaw = req.query.limit ?? "20";

    const page = Math.max(1, parseInt(String(pageRaw), 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(String(limitRaw), 10) || 20),
    );
    const offset = (page - 1) * limit;

    const countRes = await pool.query(
      "SELECT COUNT(*)::int AS total FROM products",
    );
    const total = countRes.rows[0]?.total ?? 0;

    const itemsRes = await pool.query(
      `SELECT id, article_no, product_service, in_price, price, unit, in_stock, description, created_at
       FROM products
       ORDER BY article_no
       LIMIT ${limit} OFFSET ${offset}`,
    );

    res.json({
      data: {
        items: itemsRes.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
    });
  } catch (e) {
    next(e);
  }
});

const ALLOWED_KEYS = [
  "article_no",
  "product_service",
  "in_price",
  "price",
  "unit",
  "in_stock",
  "description",
];

router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const { key, value } = req.body;
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Invalid id" });
    }
    if (!key || !ALLOWED_KEYS.includes(key)) {
      return res.status(400).json({
        error: "Invalid key. Allowed: " + ALLOWED_KEYS.join(", "),
      });
    }
    const numKeys = ["in_price", "price", "in_stock"];
    let val = value;
    if (numKeys.includes(key)) {
      if (key === "in_stock") {
        val = value === null || value === "" ? null : parseInt(String(value), 10);
        if (key === "in_stock" && val !== null && (Number.isNaN(val) || val < 0)) {
          return res.status(400).json({ error: "in_stock must be null or a non-negative integer" });
        }
      } else {
        val = parseFloat(String(value));
        if (Number.isNaN(val) || val < 0) {
          return res.status(400).json({ error: `${key} must be a non-negative number` });
        }
      }
    } else {
      val = value == null ? "" : String(value);
    }
    const col = key;
    const { rows } = await pool.query(
      `UPDATE products SET ${col} = $1 WHERE id = $2 RETURNING id, article_no, product_service, in_price, price, unit, in_stock, description, created_at`,
      [val, id]
    );
    if (!rows[0]) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ data: { product: rows[0] } });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
