import express from "express";
import { authenticateToken } from "../middleware/jwtverify.js";
import { createComment, deleteComment, getCommentsByTask } from "../controller/comment.controller.js";

const router = express.Router();

router.post("/create-comment", authenticateToken, createComment);
router.post("/get-comment", authenticateToken, getCommentsByTask);
router.post("/delete-comment", authenticateToken, deleteComment);

export default router