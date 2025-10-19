import React from "react";
import { getAnalytics } from "../lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, CheckCircle, Clock, TrendingUp, Users, Briefcase, ListTodo, AlertCircle } from "lucide-react";

const Home = () => {
  const queryClient = useQueryClient();

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
        <h1 className="text-4xl font-bold text-base-content mb-2">Analytics Dashboard</h1>
        <p className="text-base-content/60">Overview of your projects and team performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base-content/60 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-base-content mt-2">{analytics?.summary?.totalUsers}</p>
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
                <p className="text-base-content/60 text-sm font-medium">Total Projects</p>
                <p className="text-3xl font-bold text-base-content mt-2">{analytics?.summary?.totalProjects}</p>
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
                <p className="text-base-content/60 text-sm font-medium">Total Tasks</p>
                <p className="text-3xl font-bold text-base-content mt-2">{analytics?.summary?.totalTasks}</p>
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
                <p className="text-base-content/60 text-sm font-medium">Avg Tasks/Project</p>
                <p className="text-3xl font-bold text-base-content mt-2">{analytics?.summary?.avgTasksPerProject}</p>
              </div>
              <div className="bg-info/10 p-3 rounded-lg">
                <TrendingUp className="w-8 h-8 text-info" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Task Status Distribution */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-base-content mb-4">Task Status Distribution</h2>
            <div className="space-y-4">
              {analytics?.taskStatusCounts?.map((status) => (
                <div key={status._id}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-base-content font-medium">{status._id}</span>
                    <span className="text-base-content/60">{status.count} tasks</span>
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
                    max={analytics?.summary?.totalTasks}
                  ></progress>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Task Priority Distribution */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-base-content mb-4">Task Priority Distribution</h2>
            <div className="space-y-4">
              {analytics?.taskPriorityCounts?.map((priority) => (
                <div key={priority._id}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-base-content font-medium">{priority._id}</span>
                    <span className="text-base-content/60">{priority.count} tasks</span>
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
                    max={analytics?.summary?.totalTasks}
                  ></progress>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title text-base-content mb-4">
            <CheckCircle className="w-6 h-6 text-success" />
            Top Performers
          </h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="text-base-content">Name</th>
                  <th className="text-base-content">Email</th>
                  <th className="text-base-content">Completed Tasks</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.topUsersByTasksCompleted?.map((user) => (
                  <tr key={user.userId} className="hover">
                    <td className="text-base-content font-medium">{user.fullName}</td>
                    <td className="text-base-content/60">{user.email}</td>
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

      {/* Upcoming Deadlines */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title text-base-content mb-4">
            <Calendar className="w-6 h-6 text-error" />
            Upcoming Task Deadlines
          </h2>
          <div className="space-y-4">
            {analytics?.tasksWithDueDate
              ?.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
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
                          <h3 className="font-bold text-base-content text-lg">{task.title}</h3>
                          <p className="text-base-content/60 text-sm mt-1">{task.description}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <div className={`badge ${getStatusColor(task.status)}`}>
                             Status : {task.status}
                            </div>
                            <div className={`badge ${getPriorityColor(task.priority)}`}>
                             Priority : {task.priority}
                            </div>
                            <div className="badge badge-outline">Project : {task.project?.title}</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-start sm:items-end gap-2">
                          <div className="flex items-center gap-2">
                            <Clock
                              className={`w-4 h-4 ${
                                isOverdue ? "text-error" : isUrgent ? "text-warning" : "text-base-content/60"
                              }`}
                            />
                            <span
                              className={`text-sm font-medium ${
                                isOverdue ? "text-error" : isUrgent ? "text-warning" : "text-base-content/60"
                              }`}
                            >
                              {isOverdue
                                ? `${Math.abs(daysUntil)} days overdue`
                                : daysUntil === 0
                                ? "Due today"
                                : `${daysUntil} days left`}
                            </span>
                          </div>
                          <span className="text-xs text-base-content/60">{formatDate(task.dueDate)}</span>
                          <div className="text-sm text-base-content/80">
                            <span className="font-medium">{task.assignee?.fullName}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-base-content mb-4">
            <Clock className="w-6 h-6 text-info" />
            Recent Tasks
          </h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="text-base-content">Task</th>
                  <th className="text-base-content">Project</th>
                  <th className="text-base-content">Assignee</th>
                  <th className="text-base-content">Status</th>
                  <th className="text-base-content">Priority</th>
                  <th className="text-base-content">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.recentTasks?.map((task) => (
                  <tr key={task._id} className="hover">
                    <td>
                      <div>
                        <div className="font-bold text-base-content">{task.title}</div>
                        <div className="text-sm text-base-content/60">{task.description}</div>
                      </div>
                    </td>
                    <td className="text-base-content/80">{task.project?.title}</td>
                    <td className="text-base-content/80">{task.assignee?.fullName}</td>
                    <td>
                      <div className={`badge ${getStatusColor(task.status)}`}>{task.status}</div>
                    </td>
                    <td>
                      <div className={`badge ${getPriorityColor(task.priority)}`}>{task.priority}</div>
                    </td>
                    <td className="text-base-content/60">{formatDate(task.dueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;