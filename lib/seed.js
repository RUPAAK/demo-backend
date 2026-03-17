const fs = require("fs");
const path = require("path");
const { pool } = require("./db");
const { findUserByEmail, createUser, hashPassword } = require("./auth");

const migrationsDir = path.join(__dirname, "..", "migrations");

const SEED_USER = {
  username: "rupaak",
  email: "rupakt525@gmail.com",
  password: "kathmandu",
};

const SEED_PRODUCTS = [
  {
    article_no: "1000000000",
    product_service: "test Row for data, just checking",
    in_price: 434356,
    price: 132334,
    unit: "meter/Seconds",
    in_stock: 2500600,
    description: "this is the description and that is a description",
  },
  {
    article_no: "1000000001",
    product_service: "Premium subscription (Monthly)",
    in_price: 0,
    price: 199,
    unit: "month",
    in_stock: 34,
    description: "Access to all features for one Month",
  },
  {
    article_no: "1000000002",
    product_service: "consulting (hourly)",
    in_price: 0,
    price: 1250,
    unit: "hour",
    in_stock: 76,
    description: "Remote consulting billed per hour.",
  },
  {
    article_no: "2000000042",
    product_service: "Office Chair, ergonomic",
    in_price: 950,
    price: 1499,
    unit: "pcs",
    in_stock: 18,
    description: "Adjustable lumbar support and armrest",
  },
  {
    article_no: "3000123400",
    product_service: "Shipping & Handling",
    in_price: 0,
    price: 89,
    unit: "order",
    in_stock: 3,
    description: "Standard delivery within 3-5 business days",
  },
  {
    article_no: "4000077777",
    product_service: "stainless steel Water bottle 1L",
    in_price: 65,
    price: 129,
    unit: "pcs",
    in_stock: 240,
    description: "Keeps drinks cold for upto 24 hours",
  },
  {
    article_no: "5000000001",
    product_service: "Notebook A5, Ruled",
    in_price: 12,
    price: 29,
    unit: "pcs",
    in_stock: 320,
    description: "A5 ruled notebook, 80 pages ",
  },
  {
    article_no: "5000000002",
    product_service: "Ballpoint pen (Blue)",
    in_price: 2,
    price: 9,
    unit: "pcs",
    in_stock: 1200,
    description: "Smooth writting blue ink pen",
  },
  {
    article_no: "5000000003",
    product_service: "ballpoint pen (black)",
    in_price: 2,
    price: 9,
    unit: "pcs",
    in_stock: 1100,
    description: "Smooth writing black ink pen",
  },
  {
    article_no: "5000000004",
    product_service: "Desk Lamp, led",
    in_price: 89,
    price: 179,
    unit: "pcs",
    in_stock: 65,
    description: "Adjustable LED lamp with warm Light",
  },
  {
    article_no: "5000000005",
    product_service: "USB-C cable 1m",
    in_price: 18,
    price: 49,
    unit: "pcs",
    in_stock: 540,
    description: "Durable usb-c to USB-C cable",
  },
  {
    article_no: "5000000006",
    product_service: "Wireless Mouse",
    in_price: 99,
    price: 199,
    unit: "pcs",
    in_stock: 140,
    description: "2.4G wireless mouse with reciever",
  },
  {
    article_no: "5000000007",
    product_service: "keyboard, compact",
    in_price: 149,
    price: 299,
    unit: "pcs",
    in_stock: 90,
    description: "Compact keyboard with silent keys ",
  },
  {
    article_no: "5000000008",
    product_service: "Monitor Stand",
    in_price: 75,
    price: 149,
    unit: "pcs",
    in_stock: 110,
    description: "Raises monitor height for ergonomics",
  },
  {
    article_no: "5000000009",
    product_service: "Phone charger 20w",
    in_price: 45,
    price: 99,
    unit: "pcs",
    in_stock: 260,
    description: "Fast charging wall Adapter",
  },
  {
    article_no: "5000000010",
    product_service: "HDMI Cable 2m",
    in_price: 25,
    price: 59,
    unit: "pcs",
    in_stock: 410,
    description: "High speed HDMI cable 2 meters",
  },
  {
    article_no: "5000000011",
    product_service: "Headphones, wired ",
    in_price: 79,
    price: 149,
    unit: "pcs",
    in_stock: 190,
    description: "Over-ear wired headphones",
  },
  {
    article_no: "5000000012",
    product_service: "Microphone, Usb",
    in_price: 199,
    price: 349,
    unit: "pcs",
    in_stock: 55,
    description: "USB desktop mic for calls",
  },
  {
    article_no: "5000000013",
    product_service: "Laptop stand, Aluminium",
    in_price: 129,
    price: 249,
    unit: "pcs",
    in_stock: 85,
    description: "Aluminium stand for 11-16 inch laptops",
  },
  {
    article_no: "5000000014",
    product_service: "Backpack 20L",
    in_price: 179,
    price: 299,
    unit: "pcs",
    in_stock: 70,
    description: "Lightweight backpack for daily use",
  },
];

async function seed() {
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    await pool.query(sql);
  }

  const existing = await findUserByEmail(SEED_USER.email);
  if (!existing) {
    const passwordHash = await hashPassword(SEED_USER.password);
    await createUser(SEED_USER.email, SEED_USER.username, passwordHash);
  }

  const { rows } = await pool.query(
    "SELECT COUNT(*)::int AS count FROM products",
  );
  if (rows[0]?.count === 0) {
    for (const p of SEED_PRODUCTS) {
      await pool.query(
        "INSERT INTO products (article_no, product_service, in_price, price, unit, in_stock, description) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [
          p.article_no,
          p.product_service,
          p.in_price,
          p.price,
          p.unit,
          p.in_stock,
          p.description,
        ],
      );
    }
  }
}

module.exports = { seed };
