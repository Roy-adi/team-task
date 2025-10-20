import { Task } from "../models/task.model.js";
import {Comment} from '../models/comment.model.js'
import mongoose from "mongoose";


export const createComment = async (req, res) => {
  try {
    const { taskId, text } = req.body;
    const userId = req.user?._id;

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ success: false, message: "Invalid task ID." });
    }
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Comment text is required." });
    }

    // Find the task
    const task = await Task.findById(taskId).select("createdBy assignee");
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    //  only task assignee or creator can comment
    const isAuthorized =
      task.assignee?.equals(userId) || task.createdBy.equals(userId);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to comment on this task.",
      });
    }

    //  Create the comment
    const newComment = await Comment.create({
      task: taskId,
      author: userId,
      text: text.trim(),
    });

    // Populate for response
    await newComment.populate("author", "fullName email profilePic");

    res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      data: newComment,
    });
  } catch (error) {
    console.error("Error in createComment:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating comment.",
    });
  }
};


export const getCommentsByTask = async (req, res) => {
  try {
    const { taskId } = req.body;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ success: false, message: "Invalid task ID." });
    }

    // Check task existence & permissions
    const task = await Task.findById(taskId).select("createdBy assignee");
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    const isAuthorized =
      task.assignee?.equals(userId) || task.createdBy.equals(userId);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view comments for this task.",
      });
    }

    // Fetch comments
    const comments = await Comment.find({ task: taskId })
      .populate("author", "fullName email profilePic")
      .sort({ createdAt: 1 }); // oldest first for readability

    res.status(200).json({
      success: true,
      message: "Comments fetched successfully.",
      data: comments,
    });
  } catch (error) {
    console.error("Error in getCommentsByTask:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching comments.",
    });
  }
};


export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.body;
    const userId = req.user?._id;

    // Validate comment ID
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ success: false, message: "Invalid comment ID." });
    }

    // Find the comment with task 
    const comment = await Comment.findById(commentId).populate({
      path: "task",
      select: "createdBy assignee",
    });

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found." });
    }

    //  comment author, task creator, or assignee can delete
    const task = comment.task;
    const isAuthorized =
      comment.author.equals(userId) ||
      task.assignee?.equals(userId) ||
      task.createdBy.equals(userId);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this comment.",
      });
    }

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleteComment:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting comment.",
    });
  }
};