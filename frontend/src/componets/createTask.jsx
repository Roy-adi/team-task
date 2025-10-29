import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, ChevronDown, AlertCircle, Loader, Plus } from "lucide-react";
import {
  getPojectsList,
  getProjetcsMember,
  createTask,
  updateTask,
  getUserProjects,
} from "../lib/api";
import { toast } from "react-toastify";
import { useThemeStore } from "../store/useTheme";

const CreateTaskModal = ({ isOpen, onClose, taskToEdit = null }) => {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(taskToEdit);
  const { theme } = useThemeStore();
  console.log(taskToEdit, "edit data");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    projectId: "",
    assigneeId: "",
  });

  const [projectMembers, setProjectMembers] = useState([]);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedAssignee, setSelectedAssignee] = useState(null);

  useEffect(() => {
    if (taskToEdit) {
      // Set form data
      setFormData({
        title: taskToEdit?.title,
        description: taskToEdit?.description,
        priority: taskToEdit?.priority,
        dueDate: taskToEdit?.dueDate.split("T")[0],
        projectId: taskToEdit?.project._id,
        assigneeId: taskToEdit?.assignee?._id,
      });

      // Set selected project
      setSelectedProject({
        _id: taskToEdit.project?._id,
        title: taskToEdit.project?.title,
        owner: taskToEdit.project?.owner,
      });

      // Set selected assignee
      setSelectedAssignee({
        _id: taskToEdit.assignee?._id,
        fullName: taskToEdit.assignee?.fullName,
        email: taskToEdit.assignee?.email,
        profilePic: taskToEdit.assignee?.profilePic,
      });

      // Fetch project members for the selected project
      getMember({ projectId: taskToEdit?.project._id });
    } else {
      // Reset form when creating new task
      setFormData({
        title: "",
        description: "",
        priority: "Medium",
        dueDate: "",
        projectId: "",
        assigneeId: "",
      });
      setSelectedProject(null);
      setSelectedAssignee(null);
      setProjectMembers([]);
    }
  }, [taskToEdit, isOpen]);

  console.log(selectedAssignee,'selectedAssignee data')

  // Fetch Projects
  const { data: projectsData, isLoading: loadingProjects } = useQuery({
    queryKey: ["User_Projects"],
    queryFn: getUserProjects,
    enabled: isOpen,
  });

  const projects = projectsData?.data || [];

  // Get Members for selected project
  const { mutate: getMember, isPending: loadingMembers } = useMutation({
    mutationFn: getProjetcsMember,
    onSuccess: (data) => {
      setProjectMembers(data.members || []);
    },
    onError: () => {
      toast.error("Failed to load project members");
      setProjectMembers([]);
    },
  });

  // Create Task Mutation
  const { mutate: createTaskMutation, isPending: isCreating } = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully!");
      handleReset();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create task");
    },
  });

  // edit task Mutation
  const { mutate: updateTaskMutation, isPending: isUpdating } = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task Edited successfully!");
      handleReset();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to edit task");
    },
  });

  // Handle project selection
  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setFormData((prev) => ({
      ...prev,
      projectId: project._id,
      assigneeId: "",
    }));
    setSelectedAssignee(null);
    setProjectMembers([]);
    setShowProjectDropdown(false);

    // Fetch members for selected project
    getMember({ projectId: project._id });
  };

  // Handle assignee selection
  const handleAssigneeSelect = (member) => {
    setSelectedAssignee(member);
    setFormData((prev) => ({
      ...prev,
      assigneeId: member?._id,
    }));
    setShowAssigneeDropdown(false);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate and submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditMode) {
      const dataToSend = {
        taskId: taskToEdit._id,
        data: formData,
      };
      updateTaskMutation(dataToSend);
    } else {
      createTaskMutation(formData);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      projectId: "",
      title: "",
      description: "",
      priority: "Medium",
      assigneeId: "", // Changed from 'assignee' to 'assigneeId'
      dueDate: "",
    });
    setSelectedProject(null);
    setSelectedAssignee(null);
    setProjectMembers([]);
    setShowProjectDropdown(false);
    setShowAssigneeDropdown(false);
  };

  // Close modal and reset
  const handleClose = () => {
    handleReset();
    onClose();
  };

  const isPending = isCreating || isUpdating;
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      data-theme={theme}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}

        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 z-10">
          <h2 className="text-2xl font-bold text-slate-900">
            {isEditMode ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Project Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Project <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                className="w-full flex items-center justify-between px-4 py-3 border border-slate-300 rounded-lg bg-white hover:border-blue-400 transition-colors text-left"
              >
                <span
                  className={
                    selectedProject
                      ? "text-slate-900 font-medium"
                      : "text-slate-500"
                  }
                >
                  {selectedProject?.title || "Select a project"}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-600 transition-transform ${
                    showProjectDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showProjectDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {loadingProjects ? (
                    <div className="p-4 text-center text-slate-600">
                      <Loader className="w-5 h-5 animate-spin mx-auto" />
                    </div>
                  ) : projects.length > 0 ? (
                    projects.map((project) => (
                      <button
                        key={project._id}
                        type="button"
                        onClick={() => handleProjectSelect(project)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-slate-100 last:border-b-0 transition-colors"
                      >
                        <p className="font-medium text-black">
                          {project.title}
                        </p>
                        <p className="text-sm text-slate-600">
                          {project.owner?.fullName}
                        </p>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-600">
                      No projects available
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter task title"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter task description"
              rows="4"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-black"
            />
          </div>

          {/* Priority and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white cursor-pointer text-black"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
              />
            </div>
          </div>

          {/* Assignee Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Assign To <span className="text-red-500">*</span>
            </label>
            {!selectedProject ? (
              <div className="w-full flex items-center gap-2 px-4 py-3 border border-slate-300 rounded-lg bg-slate-50">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span className="text-sm text-slate-600">
                  Please select a project first
                </span>
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                  disabled={projectMembers.length === 0}
                  className="w-full flex items-center justify-between px-4 py-3 border border-slate-300 rounded-lg bg-white hover:border-blue-400 disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors text-left"
                >
                  <span
                    className={
                      selectedAssignee
                        ? "text-slate-900 font-medium"
                        : "text-slate-500"
                    }
                  >
                    {selectedAssignee
                      ? selectedAssignee.fullName
                      : loadingMembers
                      ? "Loading members..."
                      : "Select a member"} 
                   
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-600 transition-transform ${
                      showAssigneeDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showAssigneeDropdown && projectMembers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {projectMembers.map((member) => (
                      <button
                        key={member._id}
                        type="button"
                        onClick={() => handleAssigneeSelect(member)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-slate-100 last:border-b-0 transition-colors flex items-center justify-between gap-3"
                      >
                        {/* Left section - profile + name + email */}
                        <div className="flex items-center gap-3">
                          {member.profilePic ? (
                            <img
                              src={member?.profilePic}
                              alt={member?.fullName}
                              className="w-8 h-8 rounded-full border border-slate-300"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 border border-slate-300" />
                          )}
                          <div>
                            <p className="font-medium text-slate-900">
                              {member?.fullName}
                            </p>
                            <p className="text-sm text-slate-600">
                              {member?.email}
                            </p>
                          </div>
                        </div>

                        {/* Right section - role */}
                        <p className="text-sm text-slate-600 whitespace-nowrap">
                          {member?.role}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-900 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isCreating}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              {isEditMode ? "Update Task" : "Create Task"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;
