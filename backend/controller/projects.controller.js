import mongoose from "mongoose";
import { Project } from "../models/projets.model.js";
import { User } from "../models/user.model.js";
import { Task } from "../models/task.model.js";

export const createProject = async (req, res) => {
  try {
    const { title, description, members } = req.body;
    const ownerId = req.user.id;

    // --- VALIDATION ---
    if (!title || title.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Project title is required" });
    }

    // --- VALIDATE MEMBERS ---
    let memberList = [];

    if (Array.isArray(members) && members.length > 0) {
      // Ensure valid structure: [{ user, role }]
      const invalid = members.some(
        (m) =>
          !m.user || !["admin", "project_manager", "member"].includes(m.role)
      );
      if (invalid) {
        return res.status(400).json({
          success: false,
          message: "Invalid members format or role",
        });
      }

      // Validate that all users exist
      const userIds = members.map((m) => m.user);
      const existingUsers = await User.find({ _id: { $in: userIds } }).select(
        "_id"
      );
      const existingUserIds = existingUsers.map((u) => u._id.toString());

      memberList = members.filter((m) =>
        existingUserIds.includes(m.user.toString())
      );
    }

    // --- ADD OWNER AS ADMIN ---
    // Ensure only one admin
    memberList = memberList.filter((m) => m.role !== "admin");
    memberList.push({ user: ownerId, role: "admin" });

    // --- CREATE PROJECT ---
    const project = await Project.create({
      title: title.trim(),
      description: description?.trim() || "",
      owner: ownerId,
      members: memberList,
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    console.error("Error in createProject:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating project",
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, members } = req.body;
    const userId = req.user.id;

    const project = await Project.findById(id);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    // --- CHECK PERMISSIONS ---
    const requester = project.members.find(
      (m) => m.user.toString() === userId.toString()
    );
    if (!requester || requester.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only project admin can update this project",
      });
    }

    // --- VALIDATION ---
    if (title && title.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Title cannot be empty" });
    }

    // --- HANDLE MEMBERS UPDATE ---
    if (Array.isArray(members)) {
      // Validate structure
      const invalid = members.some(
        (m) => !m.user || !["project_manager", "member"].includes(m.role)
      );
      if (invalid) {
        return res.status(400).json({
          success: false,
          message: "Invalid members format or role (cannot set admin)",
        });
      }

      // Validate users exist
      const userIds = members.map((m) => m.user);
      const existingUsers = await User.find({ _id: { $in: userIds } }).select(
        "_id"
      );
      const existingUserIds = existingUsers.map((u) => u._id.toString());

      const validMembers = members.filter((m) =>
        existingUserIds.includes(m.user.toString())
      );

      // Preserve admin (owner)
      const admin = project.members.find((m) => m.role === "admin");
      project.members = [admin, ...validMembers];
    }

    // --- APPLY OTHER UPDATES ---
    if (title) project.title = title.trim();
    if (description) project.description = description.trim();

    await project.save();

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    console.error("Error in updateProject:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating project",
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await Project.findById(id);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    if (project.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this project",
      });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteProject:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while deleting project" });
  }
};

export const getProjectsList = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: User not found" });
    }

    // --- FETCH PROJECTS OWNED BY USER ---
    const ownedProjects = await Project.find({ owner: userId })
      .populate({
        path: "owner",
        select: "_id fullName email profilePic",
      })
      .populate({
        path: "members.user",
        select: "_id fullName email profilePic",
      })
      .sort({ updatedAt: -1 })
      .lean();

    // --- FETCH PROJECTS WHERE USER IS A MEMBER ---
    const memberProjects = await Project.find({
      "members.user": userId,
      owner: { $ne: userId }, // exclude ones already owned by user
    })
      .populate({
        path: "owner",
        select: "_id fullName email profilePic",
      })
      .populate({
        path: "members.user",
        select: "_id fullName email profilePic",
      })
      .sort({ updatedAt: -1 })
      .lean();

    // --- FORMAT BOTH LISTS ---
    const formatProjects = (projects) =>
      projects.map((p) => ({
        _id: p._id,
        title: p.title,
        description: p.description,
        owner: p.owner,
        members: p.members.map((m) => ({
          user: m.user,
          role: m.role,
        })),
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));

    const ownedList = formatProjects(ownedProjects);
    const memberList = formatProjects(memberProjects);

    return res.status(200).json({
      success: true,
      ownedCount: ownedList.length,
      memberCount: memberList.length,
      ownedProjects: ownedList,
      memberProjects: memberList,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching projects",
    });
  }
};

export const getManagedProjects = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: User not found" });
    }

    // --- FETCH PROJECTS WHERE USER IS OWNER OR PROJECT_MANAGER ---
    const projects = await Project.find({
      $or: [
        { owner: userId },
        { "members": { $elemMatch: { user: userId, role: "project_manager" } } },
      ],
    })
      .populate("owner", "name email")
      .populate("members.user", "name email")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching projects",
      error: error.message,
    });
  }
};

export const getProjectMembers = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid project ID" });
    }

    const project = await Project.findById(projectId)
      .populate({
        path: "members.user",
        select: "fullName email profilePic",
      })
      .lean();

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    const members = project.members.map((member) => ({
      _id: member.user?._id,
      fullName: member.user?.fullName,
      email: member.user?.email,
      profilePic: member.user?.profilePic,
      role: member.role,
    }));

    return res.status(200).json({
     success: true,
      projectId: project._id,
      title: project.title,
      totalMembers: members.length,
      members,
    });
  } catch (error) {
    console.error("Error fetching project members:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching project members",
    });
  }
};

export const deleteAllProjects = async (req, res) => {
  try {
    const deleteAll = await Project.deleteMany({});
    return res.status(200).json({
      success: true,
      message: "All projects deleted successfully",
      data: deleteAll,
    });
  } catch (error) {
    console.error("Error deleting all projects:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting all projects",
    });
  }
};

export const deleteAllTasks = async (req, res) => {
  try {
    const deleteAll = await Task.deleteMany({});
    return res.status(200).json({
      success: true,
      message: "All tasks deleted successfully",
      data: deleteAll,
    });
  } catch (error) {
    console.error("Error deleting all tasks:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting all tasks",
    });
  }
};
