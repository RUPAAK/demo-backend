const { verifyToken, findUserById } = require("../lib/auth");

function getToken(req) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) return auth.slice(7);
  return req.cookies?.access_token ?? null;
}

async function requireAuth(req, res, next) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: "Token required" });
  try {
    const payload = verifyToken(token);
    const user = await findUserById(payload.sub);
    if (!user) return res.status(401).json({ error: "User not found" });
    req.tokenPayload = payload;
    req.user = user;
    next();
  } catch (e) {
    if (e.name === "JsonWebTokenError" || e.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    next(e);
  }
}

module.exports = { requireAuth };
