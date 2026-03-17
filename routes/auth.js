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
      data: {
        user: { id: user.id, email: user.email, username: user.username },
        token,
      },
    });
  } catch (e) {
    next(e);
  }
});

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

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
    res.cookie("access_token", token, COOKIE_OPTIONS);
    res.json({
      data: {
        user: { id: user.id, email: user.email, username: user.username },
        token,
      },
    });
  } catch (e) {
    next(e);
  }
});

function getToken(req) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) return auth.slice(7);
  return req.cookies?.access_token ?? null;
}

async function profileHandler(req, res, next) {
  try {
    const token = getToken(req);
    if (!token) {
      return res.status(401).json({ error: "Token required" });
    }
    const payload = verifyToken(token);
    const user = await findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    res.json({ data: { user } });
  } catch (e) {
    if (e.name === "JsonWebTokenError" || e.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    next(e);
  }
}

router.get("/me", profileHandler);
router.get("/profile", profileHandler);

module.exports = router;
