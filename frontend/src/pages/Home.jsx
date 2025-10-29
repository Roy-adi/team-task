import React from "react";
import { getAnalytics } from "../lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, CheckCircle, Clock, TrendingUp, Users, Briefcase, ListTodo, AlertCircle, Target, Award } from "lucide-react";


const Home = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics"],
    queryFn: getAnalytics,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="alert alert-error max-w-md">
          <AlertCircle className="w-6 h-6" />
          <span>Failed to load analytics data</span>
        </div>
      </div>
    );
  }

  const analytics = data?.data;
  const role = data?.role;
  const isMember = role === "member";
  const isManagerOrOwner = role === "manager_or_owner";

  const getStatusColor = (status) => {
    switch (status) {
      case "Done":
        return "badge-success";
      case "In Progress":
        return "badge-warning";
      case "Todo":
        return "badge-info";
      default:
        return "badge-ghost";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "badge-error";
      case "Medium":
        return "badge-warning";
      case "Low":
        return "badge-success";
      default:
        return "badge-ghost";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {isMember ? "My Dashboard" : "Analytics Dashboard"}
            </h1>
            <p className="opacity-60">
              {isMember 
                ? "Track your assigned tasks and deadlines" 
                : "Overview of your projects and team performance"}
            </p>
          </div>
          <div className="badge badge-lg badge-primary gap-2">
            {isMember ? (
              <>
                <Target className="w-4 h-4" />
                Team Member
              </>
            ) : (
              <>
                <Award className="w-4 h-4" />
                Manager
              </>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isManagerOrOwner && (
          <>
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="opacity-60 text-sm font-medium">Total Users</p>
                    <p className="text-3xl font-bold mt-2">{analytics?.summary?.totalUsers || 0}</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="opacity-60 text-sm font-medium">Total Projects</p>
                    <p className="text-3xl font-bold mt-2">{analytics?.summary?.totalProjects || 0}</p>
                  </div>
                  <div className="bg-secondary/10 p-3 rounded-lg">
                    <Briefcase className="w-8 h-8 text-secondary" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="opacity-60 text-sm font-medium">Total Tasks</p>
                    <p className="text-3xl font-bold mt-2">{analytics?.summary?.totalTasks || 0}</p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-lg">
                    <ListTodo className="w-8 h-8 text-accent" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="opacity-60 text-sm font-medium">Avg Tasks/Project</p>
                    <p className="text-3xl font-bold mt-2">{analytics?.summary?.avgTasksPerProject || "0.00"}</p>
                  </div>
                  <div className="bg-info/10 p-3 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-info" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {isMember && (
          <>
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="opacity-60 text-sm font-medium">My Projects</p>
                    <p className="text-3xl font-bold mt-2">{analytics?.summary?.totalProjects || 0}</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Briefcase className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="opacity-60 text-sm font-medium">Assigned Tasks</p>
                    <p className="text-3xl font-bold mt-2">{analytics?.summary?.totalTasks || 0}</p>
                  </div>
                  <div className="bg-secondary/10 p-3 rounded-lg">
                    <ListTodo className="w-8 h-8 text-secondary" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="opacity-60 text-sm font-medium">Pending Tasks</p>
                    <p className="text-3xl font-bold mt-2">
                      {analytics?.taskStatusCounts?.find(s => s._id === "Todo")?.count || 0}
                    </p>
                  </div>
                  <div className="bg-warning/10 p-3 rounded-lg">
                    <Clock className="w-8 h-8 text-warning" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="opacity-60 text-sm font-medium">Completed</p>
                    <p className="text-3xl font-bold mt-2">
                      {analytics?.taskStatusCounts?.find(s => s._id === "Done")?.count || 0}
                    </p>
                  </div>
                  <div className="bg-success/10 p-3 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-success" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Task Status Distribution */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">Task Status Distribution</h2>
            <div className="space-y-4">
              {analytics?.taskStatusCounts?.length > 0 ? (
                analytics.taskStatusCounts.map((status) => (
                  <div key={status._id}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{status._id}</span>
                      <span className="opacity-60">{status.count} tasks</span>
                    </div>
                    <progress
                      className={`progress ${
                        status._id === "Done"
                          ? "progress-success"
                          : status._id === "In Progress"
                          ? "progress-warning"
                          : "progress-info"
                      } w-full`}
                      value={status.count}
                      max={analytics?.summary?.totalTasks || 1}
                    ></progress>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 opacity-60">
                  <ListTodo className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p>No task data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task Priority Distribution */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">Task Priority Distribution</h2>
            <div className="space-y-4">
              {analytics?.taskPriorityCounts?.length > 0 ? (
                analytics.taskPriorityCounts.map((priority) => (
                  <div key={priority._id}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{priority._id}</span>
                      <span className="opacity-60">{priority.count} tasks</span>
                    </div>
                    <progress
                      className={`progress ${
                        priority._id === "High"
                          ? "progress-error"
                          : priority._id === "Medium"
                          ? "progress-warning"
                          : "progress-success"
                      } w-full`}
                      value={priority.count}
                      max={analytics?.summary?.totalTasks || 1}
                    ></progress>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 opacity-60">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p>No priority data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers - Only for Manager/Owner */}
      {isManagerOrOwner && analytics?.topUsersByTasksCompleted?.length > 0 && (
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title mb-4">
              <CheckCircle className="w-6 h-6 text-success" />
              Top Performers
            </h2>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Completed Tasks</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topUsersByTasksCompleted.map((user) => (
                    <tr key={user.userId} className="hover">
                      <td className="font-medium">{user.fullName}</td>
                      <td className="opacity-60">{user.email}</td>
                      <td>
                        <div className="badge badge-success gap-2">
                          {user.completedTasks} tasks
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Assigned Tasks - Only for Member */}
      {isMember && analytics?.assignedTasks?.length > 0 && (
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title mb-4">
              <Target className="w-6 h-6 text-primary" />
              My Assigned Tasks
            </h2>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Project</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.assignedTasks.map((task) => (
                    <tr key={task._id} className="hover">
                      <td>
                        <div>
                          <div className="font-bold">{task.title}</div>
                          <div className="text-sm opacity-60 line-clamp-2">{task.description}</div>
                        </div>
                      </td>
                      <td className="opacity-80">{task.project?.title}</td>
                      <td>
                        <div className={`badge ${getStatusColor(task.status)}`}>{task.status}</div>
                      </td>
                      <td>
                        <div className={`badge ${getPriorityColor(task.priority)}`}>{task.priority}</div>
                      </td>
                      <td className="opacity-60">{formatDate(task.dueDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Deadlines */}
      {analytics?.tasksWithDueDate?.length > 0 && (
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title mb-4">
              <Calendar className="w-6 h-6 text-error" />
              {isMember ? "My Upcoming Deadlines" : "Upcoming Task Deadlines"}
            </h2>
            <div className="space-y-4">
              {analytics.tasksWithDueDate
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .map((task) => {
                  const daysUntil = getDaysUntilDue(task.dueDate);
                  const isOverdue = daysUntil < 0;
                  const isUrgent = daysUntil >= 0 && daysUntil <= 3;

                  return (
                    <div
                      key={task._id}
                      className="card bg-base-200 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <div className="card-body p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">{task.title}</h3>
                            <p className="opacity-60 text-sm mt-1 line-clamp-2">{task.description}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              <div className={`badge ${getStatusColor(task.status)}`}>
                                {task.status}
                              </div>
                              <div className={`badge ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </div>
                              <div className="badge badge-outline">{task.project?.title}</div>
                            </div>
                          </div>
                          <div className="flex flex-col items-start sm:items-end gap-2">
                            <div className="flex items-center gap-2">
                              <Clock
                                className={`w-4 h-4 ${
                                  isOverdue ? "text-error" : isUrgent ? "text-warning" : "opacity-60"
                                }`}
                              />
                              <span
                                className={`text-sm font-medium ${
                                  isOverdue ? "text-error" : isUrgent ? "text-warning" : "opacity-60"
                                }`}
                              >
                                {isOverdue
                                  ? `${Math.abs(daysUntil)} days overdue`
                                  : daysUntil === 0
                                  ? "Due today"
                                  : `${daysUntil} days left`}
                              </span>
                            </div>
                            <span className="text-xs opacity-60">{formatDate(task.dueDate)}</span>
                            {task.assignee?.fullName && (
                              <div className="text-sm opacity-80">
                                <span className="font-medium">{task.assignee.fullName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Recent Tasks - Only for Manager/Owner */}
      {isManagerOrOwner && analytics?.recentTasks?.length > 0 && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">
              <Clock className="w-6 h-6 text-info" />
              Recent Tasks
            </h2>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Project</th>
                    <th>Assignee</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentTasks.map((task) => (
                    <tr key={task._id} className="hover">
                      <td>
                        <div>
                          <div className="font-bold">{task.title}</div>
                          <div className="text-sm opacity-60 line-clamp-2">{task.description}</div>
                        </div>
                      </td>
                      <td className="opacity-80">{task.project?.title}</td>
                      <td className="opacity-80">{task.assignee?.fullName}</td>
                      <td>
                        <div className={`badge ${getStatusColor(task.status)}`}>{task.status}</div>
                      </td>
                      <td>
                        <div className={`badge ${getPriorityColor(task.priority)}`}>{task.priority}</div>
                      </td>
                      <td className="opacity-60">{formatDate(task.dueDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {analytics?.summary?.totalTasks === 0 && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center py-12">
            <ListTodo className="w-16 h-16 mx-auto mb-4 opacity-40" />
            <h3 className="text-2xl font-bold mb-2">No Tasks Yet</h3>
            <p className="opacity-60">
              {isMember 
                ? "You don't have any assigned tasks at the moment." 
                : "Get started by creating your first project and task."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;