import express from "express";
import { authenticateToken } from "../middleware/jwtverify.js";
import { createTask, deleteTask, getUserTasks, updateTask, updateTaskStatus } from "../controller/task.controller.js";

const router = express.Router();

router.post("/create-task", authenticateToken, createTask);
router.post("/update-task/:id", authenticateToken, updateTask);
router.delete("/delete-task/:id", authenticateToken, deleteTask);

router.get("/get-tasks", authenticateToken, getUserTasks);
router.patch("/update-tasks/status", authenticateToken, updateTaskStatus);

export default router;