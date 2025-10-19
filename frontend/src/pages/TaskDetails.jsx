import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { createComment, deleteComment, getCommentList, getTaskDetails } from "../lib/api";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { MessageSquare, Trash2, Send, Calendar, User, AlertCircle, FolderOpen, Clock } from "lucide-react";
import { toast } from "react-toastify";

const TaskDetails = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [commentText, setCommentText] = useState("");
  const [taskData, setTaskData] = useState(null);
  const [comments, setComments] = useState([]);

  const { mutate: postComment, isPending: isCreating } = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comment"] });
      toast.success("Comment created successfully!");
      setCommentText("");
      fetchComments();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create comment");
    },
  });

  const { mutate: fetchCommentList, isPending: loadingComments } = useMutation({
    mutationFn: getCommentList,
    onSuccess: (response) => {
      setComments(response?.data || []);
    },
  });

  const { mutate: fetchTaskDetails, isPending: loadingTask } = useMutation({
    mutationFn: getTaskDetails,
    onSuccess: (response) => {
      setTaskData(response.data);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to load task details");
    },
  });

  const { mutate: deleteCommentData, isPending: loadingDelete } = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comment"] });
      toast.success("Comment deleted successfully!");
      fetchComments();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete comment");
    },
  });

  const fetchComments = () => {
    if (id) {
      fetchCommentList({ taskId: id });
    }
  };

  useEffect(() => {
    if (id) {
      fetchTaskDetails({ taskId: id });
      fetchComments();
    }
  }, [id]);

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast.error("Please enter a comment");
      return;
    }
    postComment({ taskId: id, text: commentText });
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteCommentData({ commentId });
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "badge-error";
      case "medium":
        return "badge-warning";
      case "low":
        return "badge-success";
      default:
        return "badge-ghost";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "todo":
        return "badge-ghost";
      case "in progress":
        return "badge-info";
      case "completed":
        return "badge-success";
      default:
        return "badge-ghost";
    }
  };

  if (loadingTask) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Task Details Card */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-3">
               Task : {taskData?.title || "Task Details"}
              </h1>
              <div className="flex gap-2 flex-wrap">
                <div className={`badge badge-lg ${getStatusColor(taskData?.status)}`}>
                 Task Status : {taskData?.status}
                </div>
                <div className={`badge badge-lg ${getPriorityColor(taskData?.priority)}`}>
                 Task Priority : {taskData?.priority} 
                </div>
              </div>
            </div>
          </div>

          <div className="divider my-2"></div>

          {/* Description */}
          {taskData?.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold opacity-60 mb-2">Description</h3>
              <p className="text-base leading-relaxed">{taskData.description}</p>
            </div>
          )}

          {/* Key Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Due Date */}
            {taskData?.dueDate && (
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Calendar className="w-5 h-5 opacity-60" />
                </div>
                <div>
                  <p className="text-xs opacity-60 mb-1">Due Date</p>
                  <p className="font-semibold">{formatDate(taskData.dueDate)}</p>
                </div>
              </div>
            )}

            {/* Assignee */}
            {taskData?.assignee && (
              <div className="flex items-start gap-3">
                <div className="avatar">
                  <div className="w-10 h-10 rounded-full">
                    <img src={taskData.assignee.profilePic} alt={taskData.assignee.fullName} />
                  </div>
                </div>
                <div>
                  <p className="text-xs opacity-60 mb-1">Assigned To</p>
                  <p className="font-semibold">{taskData.assignee.fullName}</p>
                  <p className="text-xs opacity-50">{taskData.assignee.email}</p>
                </div>
              </div>
            )}

            {/* Created By */}
            {taskData?.createdBy && (
              <div className="flex items-start gap-3">
                <div className="avatar">
                  <div className="w-10 h-10 rounded-full">
                    <img src={taskData.createdBy.profilePic} alt={taskData.createdBy.fullName} />
                  </div>
                </div>
                <div>
                  <p className="text-xs opacity-60 mb-1">Created By</p>
                  <p className="font-semibold">{taskData.createdBy.fullName}</p>
                  <p className="text-xs opacity-50">{taskData.createdBy.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Project Information */}
          {taskData?.project && (
            <>
              <div className="divider my-2"></div>
              <div className="bg-base-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FolderOpen className="w-5 h-5 opacity-60 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs opacity-60 mb-1">Project</p>
                    <p className="font-bold text-lg mb-1">{taskData.project.name}</p>
                    <p className="text-sm opacity-70 mb-3">{taskData.project.desc}</p>
                    
                    {taskData.project.project_owner && (
                      <div className="flex items-center gap-2">
                        <div className="avatar">
                          <div className="w-8 h-8 rounded-full">
                            <img 
                              src={taskData.project.project_owner.profilePic} 
                              alt={taskData.project.project_owner.fullName} 
                            />
                          </div>
                        </div>
                        <div>
                          <p className="text-xs opacity-60">Project Owner</p>
                          <p className="text-sm font-semibold">{taskData.project.project_owner.fullName}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Timestamps */}
          <div className="flex gap-6 mt-4 flex-wrap text-xs opacity-60">
            {taskData?.createdAt && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Created: {formatDateTime(taskData.createdAt)}</span>
              </div>
            )}
            {taskData?.updatedAt && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Updated: {formatDateTime(taskData.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-6 h-6" />
            <h2 className="text-2xl font-bold">
              Comments ({comments?.length || 0})
            </h2>
          </div>

          {/* Comment Input */}
          <div className="mb-6">
            <div className="flex gap-3">
              <textarea
                className="textarea textarea-bordered flex-1 min-h-[100px] resize-none"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={isCreating}
              ></textarea>
            </div>
            <div className="flex justify-end mt-3">
              <button
                onClick={handlePostComment}
                className={`btn btn-primary ${isCreating ? "loading" : ""}`}
                disabled={isCreating || !commentText.trim()}
              >
                {!isCreating && <Send className="w-4 h-4" />}
                {isCreating ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </div>

          <div className="divider"></div>

          {/* Comments List */}
          {loadingComments ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id || comment._id}
                  className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="card-body p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="avatar">
                            <div className="w-10 h-10 rounded-full">
                              {comment.author?.profilePic ? (
                                <img src={comment.author.profilePic} alt={comment.author.fullName || comment.author.name} />
                              ) : (
                                <div className="bg-neutral text-neutral-content rounded-full w-10 flex items-center justify-center">
                                  <span className="text-sm">
                                    {(comment.author?.fullName || comment.author?.name)?.[0]?.toUpperCase() || "U"}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold">
                              {comment.author?.fullName || comment.author?.name || "Unknown User"}
                            </p>
                            <p className="text-xs opacity-60">
                              {formatDateTime(comment.createdAt)}
                            </p>
                          </div>
                        </div>
                        <p className="ml-13 leading-relaxed">{comment.text}</p>
                      </div>

                      {(authUser?.id === comment.author?.id ||
                        authUser?._id === comment.author?._id ||
                        authUser?.id === comment.author?._id ||
                        authUser?._id === comment.author?.id) && (
                        <button
                          className="btn btn-ghost btn-sm btn-square"
                          onClick={() => handleDeleteComment(comment.id || comment._id)}
                          disabled={loadingDelete}
                          title="Delete comment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto opacity-30 mb-4" />
              <p className="text-lg opacity-60">No comments yet</p>
              <p className="text-sm opacity-40">Be the first to comment!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;