import React from "react";
import { getPojectsList } from "../lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { X, Plus, Search, Users, Calendar, User, Mail } from "lucide-react";
import CreateProjectModal from "../componets/createProjects";
import { useThemeStore } from "../store/useTheme";

const ProjectsPage = () => {
    const { theme } = useThemeStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: projectsData, isLoading: loadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: getPojectsList,
  });

  const projects = projectsData?.data || [];

  return (
    <div className="min-h-screen" data-theme={theme}>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Projects
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Create Project</span>
          </button>
        </div>

        {loadingProjects ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-lg border border-slate-200 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No projects yet</h3>
            <p className="text-slate-500 mb-6">Get started by creating your first project</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className=" p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold  group-hover:text-blue-600 transition-colors line-clamp-2">
                    {project.title}
                  </h3>
                </div>
                
                <p className=" text-sm mb-4 line-clamp-3">
                  {project.description}
                </p>

                <div className="space-y-3 pt-4 border-t ">
                 <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className=" font-medium">Owner:</span>
                    <span className=" truncate">{project.owner.fullName}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className=" font-medium">Email:</span>
                    <span className=" truncate">{project.owner.email}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className=" font-medium">Members:</span>
                    <span className="">{project.members.length}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="">
                      {new Date(project?.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {project?.members?.length > 0 && (
                    <div className="flex items-center gap-2 pt-2">
                      <div className="flex -space-x-2">
                        {project?.members.slice(0, 3).map((member, idx) => (
                          <div
                            key={member._id}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-white shadow-sm"
                            title={member?.email}
                          >
                            {member?.fullName.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {project?.members?.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-semibold border-2 border-white shadow-sm">
                            +{project?.members?.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <CreateProjectModal
          onClose={() => setIsModalOpen(false)}
          queryClient={queryClient}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
