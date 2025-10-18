import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

function getTokenFromRequest(req) {
  // 1) Authorization header
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];
  if (authHeader) {
    // Support both "Bearer <token>" and plain "<token>"
    const maybeBearer = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    const cleaned = maybeBearer.replace(/^"(.*)"$/, "$1"); // remove wrapping quotes if any
    if (cleaned) return cleaned;
  }

  // 2) Cookie named "tokens"
  const rawCookie = req.cookies?.tokens;

  if (!rawCookie) return null;

  // If it's an object (some cookie parsers may do that)
  if (typeof rawCookie === "object" && rawCookie !== null) {
    return rawCookie.accessToken || rawCookie.token || null;
  }

  // If it's a string, it might be either the raw JWT or a JSON string
  if (typeof rawCookie === "string") {
    try {
      const parsed = JSON.parse(rawCookie);
      return parsed.accessToken || parsed.token || null;
    } catch {
      // Not JSON, assume it's the token itself
      return rawCookie.replace(/^"(.*)"$/, "$1");
    }
  }

  return null;
}

export const authenticateToken = async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ error: "Token is missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
    if (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token has expired" });
      }
      return res.status(403).json({ error: "Invalid token" });
    }

    try {
      
      const user = await User.findById(decoded.id).select("-password");
      req.tokenSource = req.headers["authorization"] ? "header" : "cookie"; // optional: for debugging

      if (!user) {
        return res
          .status(401)
          .json({ message: "Unauthorized - User not found" });
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });
};
