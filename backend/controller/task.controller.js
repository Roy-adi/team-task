import mongoose from "mongoose";
import { Project } from "../models/projets.model.js";
import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";

export const createTask = async (req, res) => {
  try {
    const { projectId, title, description, priority, assigneeId, dueDate } =
      req.body;
    const creatorId = req.user.id;

    // --- BASIC VALIDATION ---
    if (!projectId || !title) {
      return res.status(400).json({
        success: false,
        message: "Project ID and task title are required",
      });
    }

    // --- FETCH PROJECT ---
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    // --- CHECK IF CREATOR IS MEMBER + ROLE VALIDATION ---
    const creatorMembership = project.members.find(
      (m) => m.user.toString() === creatorId.toString()
    );

    if (!creatorMembership) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this project",
      });
    }

    // Only admin or project_manager can create tasks
    if (!["admin", "project_manager"].includes(creatorMembership.role)) {
      return res.status(403).json({
        success: false,
        message:
          "Only admin or project manager can create tasks in this project",
      });
    }

    // --- VALIDATE ASSIGNEE ---
    let validAssignee = null;
    if (assigneeId) {
      const user = await User.findById(assigneeId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Assignee user not found",
        });
      }

      // Assignee must be project member
      const isAssigneeMember = project.members.some(
        (m) => m.user.toString() === user._id.toString()
      );
      if (!isAssigneeMember) {
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
    console.error("Error in createTask:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating task",
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assigneeId, dueDate } =
      req.body;
    const userId = req.user.id;

    // --- FETCH TASK & PROJECT ---
    const task = await Task.findById(id).populate("project");
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const project = task.project;
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Associated project not found",
      });
    }

    // --- CHECK IF USER IS MEMBER + ROLE VALIDATION ---
    const userMembership = project.members.find(
      (m) => m.user.toString() === userId.toString()
    );

    if (!userMembership) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this project",
      });
    }

    if (!["admin", "project_manager"].includes(userMembership.role)) {
      return res.status(403).json({
        success: false,
        message:
          "Only admin or project manager can update tasks in this project",
      });
    }

    // --- VALIDATION ---
    if (title && title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Task title cannot be empty",
      });
    }

    if (status && !["Todo", "In Progress", "Done"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    if (priority && !["Low", "Medium", "High"].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority value",
      });
    }

    // --- VALIDATE ASSIGNEE ---
    if (assigneeId) {
      const assignedUser = await User.findById(assigneeId);
      if (!assignedUser) {
        return res.status(404).json({
          success: false,
          message: "Assignee not found",
        });
      }

      const isAssigneeMember = project.members.some(
        (m) => m.user.toString() === assignedUser._id.toString()
      );
      if (!isAssigneeMember) {
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

    return res.status(200).json({
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
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
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
    res
      .status(500)
      .json({ success: false, message: "Server error while deleting task" });
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
    const { taskId, status } = req.body;
    const userId = req.user?._id;

    //  Validate ObjectId and input
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid task ID" });
    }

    if (!status || !["Todo", "In Progress", "Done"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or missing status. Allowed values: Todo, In Progress, Done",
      });
    }

    // Fetch task
    const task = await Task.findById(taskId).select(
      "createdBy assignee status title"
    );
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
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

export const getTaskDetails = async (req, res) => {
  try {
    const { taskId } = req.body;
    const userId = req.user?._id;

    // Validate taskId
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Task ID." });
    }

    //  Fetch Task and populate related data
    const task = await Task.findById(taskId)
      .populate({
        path: "project",
        select: "title members description owner",
        populate: {
          path: "owner",
          model: "User",
          select: "fullName email profilePic",
        },
      })
      .populate("assignee", "fullName email profilePic")
      .populate("createdBy", "fullName email profilePic");

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found." });
    }

    const project = task.project;
    const isAuthorized =
      project.members.some((member) => member.equals(userId)) ||
      task.createdBy._id.equals(userId);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this task.",
      });
    }

    //  Send successful response
    res.status(200).json({
      success: true,
      message: "Task details fetched successfully.",
      data: {
        _id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        assignee: task.assignee,
        project: {
          _id: project._id,
          name: project.title,
          desc: project.description,
          project_owner: project.owner,
        },
        createdBy: task.createdBy,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error in getTaskDetails:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching task details.",
    });
  }
};

// dashboard

export const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found",
      });
    }

    // STEP 1: Categorize projects based on user’s role
    const userProjects = await Project.find({
      $or: [{ owner: userId }, { members: { $elemMatch: { user: userId } } }],
    })
      .select("owner members title")
      .lean();

    if (userProjects.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No projects found for this user",
        data: getEmptyAnalytics(),
      });
    }

    // Determine if user is an owner/manager in any project
    const isManagerial = await Project.exists({
      $or: [
        { owner: userId },
        { members: { $elemMatch: { user: userId, role: "project_manager" } } },
      ],
    });

    console.log(isManagerial,'isManagerial')

    // If user is owner or project_manager => Full analytics
    if (isManagerial) {
      const projectIds = userProjects.map((p) => p._id);
      const projectFilter = { project: { $in: projectIds } };
      console.log(projectIds,'projectIds')

      const data = await getFullAnalytics(projectFilter, projectIds);
      return res.status(200).json({
        success: true,
        role: "manager_or_owner",
        data,
      });
    }

    // Else => Personal stats (for normal members)
    const memberProjectIds = userProjects.map((p) => p._id);
    console.log(memberProjectIds,'memberProjectIds')
    const personalFilter = {
      project: { $in: memberProjectIds },
      assignee: userId,
    };

    const data = await getPersonalAnalytics(personalFilter, memberProjectIds);
    return res.status(200).json({
      success: true,
      role: "member",
      data,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load analytics dashboard.",
      error: error.message,
    });
  }
};

// 🔹 Helper for Empty Analytics
function getEmptyAnalytics() {
  return {
    tasksWithDueDate: [],
    topUsersByTasksCompleted: [],
    taskStatusCounts: [],
    taskPriorityCounts: [],
    recentTasks: [],
    summary: {
      totalProjects: 0,
      totalTasks: 0,
      avgTasksPerProject: 0,
    },
  };
}

//  Helper for Full Project Analytics
async function getFullAnalytics(projectFilter, projectIds) {
  const tasksWithDueDate = await Task.find({
    ...projectFilter,
    dueDate: { $ne: null },
  })
    .sort({ dueDate: 1 })
    .populate("assignee", "fullName email")
    .populate({
      path: "project",
      select: "title members description owner",
      populate: {
        path: "owner",
        select: "fullName email profilePic",
      },
    })
    .lean();

  const topUsersByTasksCompleted = await Task.aggregate([
    { $match: { ...projectFilter, status: "Done" } },
    {
      $group: {
        _id: "$assignee",
        completedTasks: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 0,
        userId: "$user._id",
        fullName: "$user.fullName",
        email: "$user.email",
        completedTasks: 1,
      },
    },
    { $sort: { completedTasks: -1 } },
    { $limit: 5 },
  ]);

  const taskStatusCounts = await Task.aggregate([
    { $match: projectFilter },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const taskPriorityCounts = await Task.aggregate([
    { $match: projectFilter },
    { $group: { _id: "$priority", count: { $sum: 1 } } },
  ]);

  const recentTasks = await Task.find(projectFilter)
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("assignee", "fullName email")
    .populate("project", "title")
    .lean();

  const totalProjects = projectIds.length;
  const totalTasks = await Task.countDocuments(projectFilter);
  const avgTasksPerProject =
    totalProjects === 0 ? 0 : (totalTasks / totalProjects).toFixed(2);

  return {
    tasksWithDueDate,
    topUsersByTasksCompleted,
    taskStatusCounts,
    taskPriorityCounts,
    recentTasks,
    summary: {
      totalProjects,
      totalTasks,
      avgTasksPerProject,
    },
  };
}

//  Helper for Member-Only Personal Stats
async function getPersonalAnalytics(personalFilter, memberProjectIds) {
  const assignedTasks = await Task.find(personalFilter)
    .sort({ dueDate: 1 })
    .populate("project", "title")
    .lean();

  const tasksWithDueDate = await Task.find({
    ...personalFilter,
    dueDate: { $ne: null },
  })
    .sort({ dueDate: 1 })
    .populate("project", "title")
    .lean();

  const taskStatusCounts = await Task.aggregate([
    { $match: personalFilter },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const taskPriorityCounts = await Task.aggregate([
    { $match: personalFilter },
    { $group: { _id: "$priority", count: { $sum: 1 } } },
  ]);

  const totalTasks = assignedTasks.length;
  const totalProjects = memberProjectIds.length;

  return {
    assignedTasks,
    taskStatusCounts,
    taskPriorityCounts,
    tasksWithDueDate,
    summary: {
      totalProjects,
      totalTasks,
    },
  };
}
