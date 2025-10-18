import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Calendar,
  AlertCircle,
  User,
  Folder,
  CheckCircle2,
  Circle,
  ChevronDown,
  Loader,
  ChartNoAxesCombined,
} from "lucide-react";
import { getTaskList, updateTaskStatus } from "../lib/api";
import CreateTaskModal from "../componets/createTask";
import { useThemeStore } from "../store/useTheme";
import { toast } from "react-toastify";
import useAuthUser from "../hooks/useAuthUser";

const TaskPage = () => {
  const { authUser } = useAuthUser();

  const { theme } = useThemeStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openStatusDropdown, setOpenStatusDropdown] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: getTaskList,
  });

  const { mutate: changeTaskStatus, isPending: isUpdating } = useMutation({
    mutationFn: updateTaskStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task status updated successfully!");
      setOpenStatusDropdown(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update task status");
    },
  });

  const tasks = data?.data || [];
  const statusOptions = ["Todo", "In Progress", "Done"];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Low":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "todo":
        return "text-gray-500";
      case "in progress":
        return "text-blue-500";
      case "done":
        return "text-green-800";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "done":
        return <CheckCircle2 className="w-5 h-5" />;
      default:
        return <Circle className="w-5 h-5" />;
    }
  };

  const getStatusBgColor = (status) => {
    switch (status?.toLowerCase()) {
      case "todo":
        return "bg-gray-100 hover:bg-gray-200";
      case "in progress":
        return "bg-blue-100 hover:bg-blue-200";
      case "done":
        return "bg-green-100 hover:bg-green-200";
      default:
        return "bg-gray-100 hover:bg-gray-200";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleStatusChange = (taskId, newStatus) => {
    changeTaskStatus({ taskId, status: newStatus });
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="min-h-screen" data-theme={theme}>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">All Tasks</h2>
            <p className="">
              Manage and track all your project tasks in one place
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            Create Task
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className=" rounded-xl shadow-md p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className=" font-medium">Loading tasks...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className=" border border-red-200 rounded-xl shadow-md p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6  flex-shrink-0 mt-0.5" />
            <div>
              <h3 className=" font-semibold">Error loading tasks</h3>
              <p className=" text-sm">{error.message}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && tasks.length === 0 && (
          <div className=" rounded-xl shadow-md p-12 text-center">
            <Circle className="w-16 h-16  mx-auto mb-4" />
            <h3 className="text-xl font-semibold  mb-2">No tasks yet</h3>
            <p className=" mb-6">Create your first task to get started</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Task
            </button>
          </div>
        )}

        {/* Tasks Grid */}
        {!isLoading && !error && tasks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <div
                key={task?._id}
                className={`rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-slate-200 hover:border-blue-300 ${getStatusBgColor(
                  task.status
                )}`}
              >
                {/* Card Header */}
                <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 truncate mb-1">
                        {task?.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Folder className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{task?.project?.title}</span>
                      </div>
                    </div>
                    {/* Status Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenStatusDropdown(
                            openStatusDropdown === task?._id ? null : task._id
                          )
                        }
                        disabled={isUpdating}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-300 transition-all ${getStatusColor(
                          task.status
                        )} disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-400`}
                      >
                        {getStatusIcon(task.status)}
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {openStatusDropdown === task?._id && (
                        <div className="absolute top-full right-0 mt-2 bg-white border border-slate-300 rounded-lg shadow-lg z-20 min-w-[140px] text-slate-900">
                          {statusOptions.map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() =>
                                handleStatusChange(task?._id, status)
                              }
                              disabled={isUpdating}
                              className={`w-full text-left px-4 py-2 hover:bg-slate-100 border-b border-slate-100 last:border-b-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                                task?.status === status
                                  ? "bg-blue-50 font-semibold"
                                  : ""
                              }`}
                            >
                              {isUpdating && task?.status !== status ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                <span className={getStatusColor(status)}>
                                  {status === "Done" ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : (
                                    <Circle className="w-4 h-4" />
                                  )}
                                </span>
                              )}
                              <span>{status}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  {/* Description */}
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {task?.description}
                  </p>

                  {/* Priority Badge */}
                  <div className="mb-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                        task?.priority
                      )}`}
                    >
                      Task priority : {task?.priority}
                    </span>
                  </div>

                  {/* Due Date */}
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>DL : {formatDate(task?.dueDate)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                    <ChartNoAxesCombined className="w-4 h-4 flex-shrink-0" />
                    <span>Status : {task?.status}</span>
                  </div>

                  {/* Assignee */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    {task.assignee?.profilePic ? (
                      <img
                        src={task.assignee?.profilePic}
                        alt={task.assignee?.fullName}
                        className="w-8 h-8 rounded-full border border-slate-300"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border border-slate-300">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {task.assignee?.fullName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {task?.assignee?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between gap-3 px-5 py-3 bg-slate-50 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    Created by {task.createdBy?.email}
                  </div>
                  {task.createdBy?.email === authUser?.email && (
                    <button
                      onClick={() => handleEditTask(task)}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all text-xs"
                    >
                      <Plus className="w-4 h-4" />
                      Edit Task
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        taskToEdit={selectedTask}
      />
    </div>
  );
};

export default TaskPage;
