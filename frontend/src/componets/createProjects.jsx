import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createProjets, getUsers } from "../lib/api";
import { X, Search } from "lucide-react";
import { useThemeStore } from "../store/useTheme";

const CreateProjectModal = ({ onClose, queryClient }) => {
  const { theme } = useThemeStore();
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    members: [],
  });
  const [userSearch, setUserSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const { mutate: addProjects, isPending } = useMutation({
    mutationFn: createProjets,
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
      onClose();
    },
  });

  const { mutate: searchUsers, isPending: searchingUsers } = useMutation({
    mutationFn: getUsers,
    onSuccess: (data) => {
      setSearchResults(data?.data || []);
    },
  });

  // Debounce search with 900ms delay
  useEffect(() => {
    if (userSearch.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchUsers({ keyword: userSearch });
    }, 900);

    return () => clearTimeout(timer);
  }, [userSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formState.title.trim() || !formState.description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    if (formState.members.length === 0) {
      alert("Please add at least one member");
      return;
    }

    addProjects(formState);
  };

  const handleAddMember = (user, role = "member") => {
    if (!selectedUsers.find((u) => u._id === user._id)) {
      const updatedUsers = [...selectedUsers, { ...user, role }];
      setSelectedUsers(updatedUsers);
      setFormState({
        ...formState,
        members: updatedUsers.map((u) => ({ user: u._id, role: u.role })),
      });
      setUserSearch("");
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleRemoveMember = (userId) => {
    const updatedUsers = selectedUsers.filter((u) => u._id !== userId);
    setSelectedUsers(updatedUsers);
    setFormState({
      ...formState,
      members: updatedUsers.map((u) => ({ user: u._id, role: u.role })),
    });
  };

  const handleRoleChange = (userId, newRole) => {
    const updatedUsers = selectedUsers.map((u) =>
      u._id === userId ? { ...u, role: newRole } : u
    );
    setSelectedUsers(updatedUsers);
    setFormState({
      ...formState,
      members: updatedUsers.map((u) => ({ user: u._id, role: u.role })),
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      data-theme={theme}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}

        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 z-10">
          <h2 className="text-2xl font-bold text-slate-900">Create Project</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Project Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formState.title}
              onChange={(e) =>
                setFormState({ ...formState, title: e.target.value })
              }
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-950"
              placeholder="Enter project title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formState.description}
              onChange={(e) =>
                setFormState({ ...formState, description: e.target.value })
              }
              rows="4"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none text-slate-950"
              placeholder="Describe your project"
            />
          </div>

          {/* Members Search */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Add Members <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-950"
                  placeholder="Search users by email..."
                />
              </div>

              {/* Search Results Dropdown */}
              {showDropdown && userSearch.length >= 2 && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {searchingUsers ? (
                    <div className="p-4 text-center text-slate-500">
                      Searching...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-slate-500">
                      No users found
                    </div>
                  ) : (
                    searchResults.map((user) => {
                      const isAdded = selectedUsers.find(
                        (u) => u._id === user._id
                      );
                      return (
                        <div
                          key={user._id}
                          className="w-full flex items-center gap-3 p-3 border-b border-slate-100 last:border-b-0"
                        >
                          <img
                            src={user.profilePic}
                            alt={user.fullName}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 truncate">
                              {user.fullName}
                            </p>
                            <p className="text-sm text-slate-500 truncate">
                              {user.email}
                            </p>
                          </div>
                          {isAdded ? (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              Added
                            </span>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleAddMember(user, "project_manager")
                                }
                                className="text-xs px-3 py-1.5 rounded-lg transition-colors font-medium border border-slate-300 hover:bg-slate-100 text-slate-950"
                              >
                                Project Manager
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddMember(user, "member")}
                                className="text-xs px-3 py-1.5 rounded-lg transition-colors font-medium border border-slate-300 hover:bg-slate-100 text-slate-950"
                              >
                                Member
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Selected Members List */}
            {selectedUsers.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-slate-700">
                  Selected Members ({selectedUsers.length})
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedUsers.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img
                          src={user.profilePic}
                          alt={user.fullName}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user._id, e.target.value)
                          }
                          className="text-xs border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-slate-950"
                        >
                          <option value="project_manager">
                            {" "}
                            Project Manager
                          </option>
                          <option value="member">Member</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(user._id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors ml-2"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Creating..." : "Create Project"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
