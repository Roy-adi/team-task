import mongoose from "mongoose";
import { Project } from "../models/projets.model.js";
import { User } from "../models/user.model.js";


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

    // Validate members array
    let validMembers = [];
    if (members && Array.isArray(members)) {
      // Filter out duplicates and ensure all members exist in DB
      const users = await User.find({ _id: { $in: members } });
      validMembers = users.map((u) => u._id);
    }

    // Include owner in members
    if (!validMembers.includes(ownerId)) validMembers.push(ownerId);

    // --- CREATE PROJECT ---
    const project = await Project.create({
      title: title.trim(),
      description: description?.trim() || "",
      owner: ownerId,
      members: validMembers,
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    console.error(" Error in createProject:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while creating project" });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, members } = req.body;
    const userId = req.user.id;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Only owner can update
    if (project.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this project",
      });
    }

    // --- VALIDATION ---
    if (title && title.trim() === "") {
      return res.status(400).json({ success: false, message: "Title cannot be empty" });
    }

    let validatedMembers = project.members; // default: existing members
    if (Array.isArray(members)) {
      //  Check all members exist in User collection
      const existingUsers = await User.find({ _id: { $in: members } }).select("_id");
      const existingUserIds = existingUsers.map((u) => u._id.toString());

      if (existingUserIds.length !== members.length) {
        return res.status(400).json({
          success: false,
          message: "One or more provided member IDs are invalid",
        });
      }

      // Always ensure owner is included in members
      if (!existingUserIds.includes(userId)) existingUserIds.push(userId);

      validatedMembers = existingUserIds;
    }

    // --- APPLY UPDATES ---
    if (title) project.title = title.trim();
    if (description) project.description = description.trim();
    project.members = validatedMembers;

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
      return res.status(404).json({ success: false, message: "Project not found" });
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
    res.status(500).json({ success: false, message: "Server error while deleting project" });
  }
};


export const getUserProjects = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: User not found" });
    }

    // Fetch projects where the user is owner OR member
    const projects = await Project.find({
      $or: [{ owner: userId }, { members: userId }],
    })
      .populate({
        path: "owner",
        select: "_id fullName email",
      })
      .populate({
        path: "members",
        select: "_id fullName email",
      })
      .sort({ updatedAt: -1 }) 
      .lean(); 

    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error. Unable to fetch projects.",
    });
  }
};


export const getProjectMembers = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ success: false, message: "Invalid project ID" });
    }

    const project = await Project.findById(projectId)
      .populate({
        path: "members",
        select: "fullName email profilePic", 
      })
      .lean();

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    return res.status(200).json({
      success: true,
      projectId: project._id,
      title: project.title,
      totalMembers: project.members.length,
      members: project.members,
    });
  } catch (error) {
    console.error("Error fetching project members:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching project members",
    });
  }
};

