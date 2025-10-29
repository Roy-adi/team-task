import { Calendar, Mail, User, Users, X } from "lucide-react";
import React from "react";
import { useState } from "react";

const ProjectCard = ({ project }) => {
  const [selectedProjectMembers, setSelectedProjectMembers] = useState(null);

  return (
   <>
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-base-300">
      <div className="card-body">
        <h3 className="card-title text-xl font-bold line-clamp-2">
          {project.title}
        </h3>

        <p className="text-sm opacity-70 line-clamp-3 mb-4">
          {project.description}
        </p>

        <div className="space-y-3 pt-4 border-t border-base-300">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 opacity-60" />
            <span className="font-medium">Owner:</span>
            <span className="truncate">{project.owner.fullName}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 opacity-60" />
            <span className="font-medium">Email:</span>
            <span className="truncate">{project.owner.email}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 opacity-60" />
            <span className="font-medium">Members:</span>
            <span>{project.members?.length}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 opacity-60" />
            <span>{new Date(project?.createdAt).toLocaleDateString()}</span>
          </div>

          {project?.members?.length > 0 && (
            <div className="flex items-center gap-2 pt-2">
              <div className="flex -space-x-2">
                {project?.members.slice(0, 3).map((member, idx) => (
                  <div
                    key={idx}
                    className="avatar placeholder cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => setSelectedProjectMembers(project.members)}
                  >
                    <div className="w-8 rounded-full bg-primary text-primary-content ring ring-base-100">
                      {member?.user?.profilePic ? (
                        <img
                          src={member.user.profilePic}
                          alt={member.user.fullName}
                        />
                      ) : (
                        <span className="text-xs">
                          {member?.user?.fullName?.charAt(0).toUpperCase() ||
                            "U"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {project?.members?.length > 3 && (
                  <div
                    className="avatar placeholder cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => setSelectedProjectMembers(project.members)}
                  >
                    <div className="w-8 rounded-full bg-base-300 ring ring-base-100">
                      <span className="text-xs">
                        +{project?.members?.length - 3}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    {selectedProjectMembers && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedProjectMembers(null)}
        >
          <div 
            className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-base-300">
              <h3 className="font-bold text-2xl">
                Project Members ({selectedProjectMembers.length})
              </h3>
              <button
                onClick={() => setSelectedProjectMembers(null)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {selectedProjectMembers.map((member, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 rounded-lg bg-base-200 hover:bg-base-300 transition-colors"
                  >
                    <div className="avatar">
                      <div className="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        {member?.user?.profilePic ? (
                          <img
                            src={member.user.profilePic}
                            alt={member.user.fullName}
                          />
                        ) : (
                          <div className="bg-primary text-primary-content flex items-center justify-center text-lg font-bold w-full h-full">
                            {member?.user?.fullName?.charAt(0).toUpperCase() ||
                              "U"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold truncate">
                          {member?.user?.fullName}
                        </h4>
                        <span className="badge badge-sm badge-primary">
                          {member?.role}
                        </span>
                      </div>
                      <p className="text-sm opacity-70 truncate">
                        {member?.user?.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-base-300">
              <button
                onClick={() => setSelectedProjectMembers(null)}
                className="btn btn-primary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
   </>
  );
};

export default ProjectCard;
