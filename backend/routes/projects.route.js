import express from "express";
import { authenticateToken } from "../middleware/jwtverify.js";
import { createProject, deleteProject, getProjectMembers, getUserProjects, updateProject } from "../controller/projects.controller.js";

const router = express.Router();

router.post("/create-project", authenticateToken, createProject);
router.patch("/update-project/:id", authenticateToken, updateProject);
router.delete("/delete-project/:id", authenticateToken, deleteProject);

router.get("/get-projects", authenticateToken, getUserProjects);
router.post("/projects/members", authenticateToken, getProjectMembers);

export default router;