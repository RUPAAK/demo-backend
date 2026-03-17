const express = require("express");
const { pool } = require("../lib/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const pageRaw = req.query.page ?? "1";
    const limitRaw = req.query.limit ?? "20";
    const queryRaw = req.query.query ?? "";

    const page = Math.max(1, parseInt(String(pageRaw), 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(String(limitRaw), 10) || 20),
    );
    const offset = (page - 1) * limit;

    const q = String(queryRaw).trim();
    const where = q
      ? "WHERE article_no ILIKE $1 OR product_service ILIKE $1 OR description ILIKE $1"
      : "";
    const params = q ? [`%${q}%`] : [];

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS total FROM products ${where}`,
      params,
    );
    const total = countRes.rows[0]?.total ?? 0;

    const itemsRes = await pool.query(
      `SELECT id, article_no, product_service, in_price, price, unit, in_stock, description, created_at
       FROM products
       ${where}
       ORDER BY article_no
       LIMIT ${limit} OFFSET ${offset}`,
      params,
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

module.exports = router;
