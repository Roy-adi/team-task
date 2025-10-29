import React from "react";
import { getPojectsList } from "../lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { X, Plus, Search, Users, Calendar, User, Mail } from "lucide-react";
import CreateProjectModal from "../componets/createProjects";
import { useThemeStore } from "../store/useTheme";
import ProjectCard from "../componets/projectCard";
import LoadingCards from "../componets/loadingCards";

const ProjectsPage = () => {
  const { theme } = useThemeStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ownedProjectsToShow, setOwnedProjectsToShow] = useState(8);
  const [memberProjectsToShow, setMemberProjectsToShow] = useState(8);
  const queryClient = useQueryClient();

  const { data: projectsData, isLoading: loadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: getPojectsList,
  });

  const projects = projectsData?.data || [];

  const ownedProjects = projectsData?.ownedProjects || [];
  const memberProjects = projectsData?.memberProjects || [];

  const handleLoadMoreOwned = () => {
    setOwnedProjectsToShow((prev) => prev + 8);
  };

  const handleLoadMoreMember = () => {
    setMemberProjectsToShow((prev) => prev + 8);
  };

  const EmptyState = ({ type }) => (
    <div className="card bg-base-100 shadow-xl border border-base-300">
      <div className="card-body items-center text-center py-12">
        <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mb-4">
          <Users className="w-8 h-8 opacity-60" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No {type} projects yet</h3>
        <p className="opacity-70 mb-6">
          {type === "owned"
            ? "Create your first project to get started"
            : "You haven't been added to any projects yet"}
        </p>
        {type === "owned" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Project
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" data-theme={theme}>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">Projects</h2>
            <p className="opacity-70">Manage your owned and member projects</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary gap-2 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Create Project</span>
          </button>
        </div>

        {loadingProjects ? (
          <LoadingCards />
        ) : (
          <div className="space-y-12">
            {/* Owned Projects Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="badge badge-primary badge-lg">
                  {ownedProjects?.length}
                </div>
                <h3 className="text-2xl font-bold">Owned Projects</h3>
              </div>

              {ownedProjects?.length === 0 ? (
                <EmptyState type="owned" />
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {ownedProjects
                      .slice(0, ownedProjectsToShow)
                      .map((project) => (
                        <ProjectCard key={project._id} project={project} />
                      ))}
                  </div>

                  {ownedProjectsToShow < ownedProjects?.length && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={handleLoadMoreOwned}
                        className="btn btn-outline btn-wide gap-2"
                      >
                        <span>Load More</span>
                        <ChevronDown className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Member Projects Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="badge badge-secondary badge-lg">
                  {memberProjects?.length}
                </div>
                <h3 className="text-2xl font-bold">Projects as a Member</h3>
              </div>

              {memberProjects?.length === 0 ? (
                <EmptyState type="member" />
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {memberProjects
                      .slice(0, memberProjectsToShow)
                      .map((project) => (
                        <ProjectCard key={project._id} project={project} />
                      ))}
                  </div>

                  {memberProjectsToShow < memberProjects?.length && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={handleLoadMoreMember}
                        className="btn btn-outline btn-wide gap-2"
                      >
                        <span>Load More</span>
                        <ChevronDown className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
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
