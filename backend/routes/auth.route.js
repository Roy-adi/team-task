import express from "express";
import { login, logout, searchUsersByEmail, signup } from "../controller/auth.controller.js";
import { authenticateToken } from "../middleware/jwtverify.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/user-list",authenticateToken, searchUsersByEmail);

// check if user is logged in
router.get("/me", authenticateToken, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router