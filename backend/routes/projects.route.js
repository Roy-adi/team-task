import express from "express";
import { authenticateToken } from "../middleware/jwtverify.js";
import { createProject, deleteAllProjects, deleteAllTasks, deleteProject, getManagedProjects, getProjectMembers, getProjectsList, updateProject } from "../controller/projects.controller.js";

const router = express.Router();

router.post("/create-project", authenticateToken, createProject);
router.patch("/update-project/:id", authenticateToken, updateProject);
router.delete("/delete-project/:id", authenticateToken, deleteProject);

router.get("/get-projects", authenticateToken, getProjectsList);
router.get("/get-user-projects", authenticateToken, getManagedProjects);
router.post("/projects/members", authenticateToken, getProjectMembers);

router.delete("/delete-all-projects" , deleteAllProjects)
router.delete("/delete-all-tasks" , deleteAllTasks)

export default router;