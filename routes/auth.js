const express = require("express");
const {
  hashPassword,
  comparePassword,
  signToken,
  verifyToken,
  findUserByEmail,
  findUserByUsername,
  findUserById,
  createUser,
} = require("../lib/auth");

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ error: "Email, username and password required" });
    }
    if (await findUserByEmail(email)) {
      return res.status(409).json({ error: "Email already registered" });
    }
    if (await findUserByUsername(username)) {
      return res.status(409).json({ error: "Username already taken" });
    }
    const passwordHash = await hashPassword(password);
    const user = await createUser(email, username, passwordHash);
    const token = signToken({ sub: user.id });
    res.status(201).json({
      user: { id: user.id, email: user.email, username: user.username },
      token,
    });
  } catch (e) {
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const ok = await comparePassword(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = signToken({ sub: user.id });
    res.json({
      user: { id: user.id, email: user.email, username: user.username },
      token,
    });
  } catch (e) {
    next(e);
  }
});

router.get("/me", async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    const token = auth && auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: "Token required" });
    }
    const payload = verifyToken(token);
    const user = await findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (e) {
    if (e.name === "JsonWebTokenError" || e.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    next(e);
  }
});

module.exports = router;
