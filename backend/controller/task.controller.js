import mongoose from "mongoose";
import { Project } from "../models/projets.model.js";
import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";



export const createTask = async (req, res) => {
  try {
    const { projectId, title, description, priority, assigneeId, dueDate } = req.body;
    const creatorId = req.user.id;

    // --- VALIDATION ---
    if (!projectId || !title) {
      return res
        .status(400)
        .json({ success: false, message: "Project ID and title are required" });
    }

    // Ensure project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    // Ensure creator is part of the project
    if (!project.members.includes(creatorId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create tasks in this project",
      });
    }

    // Validate assignee 
    let validAssignee = null;
    if (assigneeId) {
      const user = await User.findById(assigneeId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Assignee user not found" });
      }

      // Ensure assignee is a project member
      if (!project.members.includes(user._id)) {
        return res.status(400).json({
          success: false,
          message: "Assignee must be a member of this project",
        });
      }

      validAssignee = user._id;
    }

    // --- CREATE TASK ---
    const task = await Task.create({
      project: projectId,
      title: title.trim(),
      description: description?.trim() || "",
      priority: priority || "Medium",
      assignee: validAssignee,
      dueDate,
      createdBy: creatorId,
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    console.error(" Error in createTask:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while creating task" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assigneeId, dueDate } = req.body;
    const userId = req.user.id;

    const task = await Task.findById(id).populate("project");
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const project = task.project;

    // --- Authorization ---
    if (!project.members.map(String).includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this task",
      });
    }

    // --- VALIDATION ---
    if (title && title.trim() === "") {
      return res.status(400).json({ success: false, message: "Title cannot be empty" });
    }
    if (status && !["Todo", "In Progress", "Done"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }
    if (priority && !["Low", "Medium", "High"].includes(priority)) {
      return res.status(400).json({ success: false, message: "Invalid priority value" });
    }

    // --- Validate Assignee ---
    if (assigneeId) {
      const assignedUser = await User.findById(assigneeId);
      if (!assignedUser) {
        return res.status(404).json({ success: false, message: "Assignee not found" });
      }

      // Assignee must be a member of the same project
      if (!project.members.map(String).includes(assignedUser._id.toString())) {
        return res.status(400).json({
          success: false,
          message: "Assignee must be a member of this project",
        });
      }

      task.assignee = assignedUser._id;
    }

    // --- APPLY UPDATES ---
    if (title) task.title = title.trim();
    if (description) task.description = description.trim();
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;

    await task.save();

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    console.error("Error in updateTask:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating task",
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await Task.findById(id).populate("project");
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const project = task.project;
    if (!project.members.map(String).includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this task",
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteTask:", error);
    res.status(500).json({ success: false, message: "Server error while deleting task" });
  }
};

export const getUserTasks = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: User not found" });
    }

    // Fetch tasks where user is either the creator or the assignee
    const tasks = await Task.find({
      $or: [{ createdBy: userId }, { assignee: userId }],
    })
      .populate({
        path: "project",
        select: "_id title owner",
        populate: {
          path: "owner",
          select: "_id fullName email",
        },
      })
      .populate({
        path: "assignee",
        select: "_id fullName email",
      })
      .populate({
        path: "createdBy",
        select: "_id fullName email",
      })
      .sort({ updatedAt: -1 }) 
      .lean(); 

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error. Unable to fetch tasks.",
    });
  }
};


export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId,status } = req.body;
    const userId = req.user?._id; 

    //  Validate ObjectId and input
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ success: false, message: "Invalid task ID" });
    }

    if (!status || !["Todo", "In Progress", "Done"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing status. Allowed values: Todo, In Progress, Done",
      });
    }

    // Fetch task
    const task = await Task.findById(taskId).select("createdBy assignee status title");
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    //  Authorization check — only assignee or creator can update
    const isAuthorized =
      task.createdBy?.toString() === userId?.toString() ||
      task.assignee?.toString() === userId?.toString();

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this task status",
      });
    }


    task.status = status;
    await task.save();

    return res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      data: {
        taskId: task._id,
        title: task.title,
        updatedStatus: task.status,
        updatedBy: userId,
      },
    });
  } catch (error) {
    console.error("Error updating task status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating task status",
    });
  }
};