import { toast } from "react-toastify";
import { axiosInstance } from "./axios";

export const login = async (loginData) => {
  try {
    const response = await axiosInstance.post("/login", loginData);
    const { user } = response.data;

     console.log(user?.accessToken, 'accessToken')

    if (user) {
      localStorage.setItem("accessToken", user?.accessToken);
    }
    toast.success(`Welcome Back ${user.fullName}`)
    return response.data;
  } catch (error) {
    console.log("Error in Login", error);
    toast.error(error.response?.data?.message || 'Login Failed')
    throw error;
  }
};

export const signup = async (signupData) => {
  try {
    const response = await axiosInstance.post("/signup", signupData);
    const { user } = response.data;

     console.log(user?.accessToken, 'accessToken')
     
    if (user) {
      localStorage.setItem("accessToken", user?.accessToken);
    }
    toast.success(`Hello ${user.fullName}`)
    return response.data;
  } catch (error) {
    console.log("Error in Sinup", error);
    toast.error(error.response?.data?.message || 'Signup Failed')
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await axiosInstance.post("/logout");
    toast.success('Logout')
    return response.data;
  } catch (error) {
    console.log("Error in logout", error);
    throw error;
  }
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/me");
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    return null;
  }
};

export const createProjets = async (payload) => {
  try {
    const response = await axiosInstance.post("/create-project", payload);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed')
    throw error;
  }
};

export const createTask = async (payload) => {
  try {
    const response = await axiosInstance.post("/create-task", payload);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed')
    throw error;
  }
};

export async function getPojectsList() {
  try {
    const response = await axiosInstance.get("/get-projects");
    return response.data;
  } catch (error) {
    console.log("Error in getPojectsList:", error);
     throw error;
  }
}

export async function getTaskList() {
  try {
    const response = await axiosInstance.get("/get-tasks");
    return response.data;
  } catch (error) {
    console.log("Error in getTaskList:", error);
     throw error;
  }
}

export const getUsers = async (payload) => {
  try {
    const response = await axiosInstance.post("/user-list", payload);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed')
    throw error;
  }
};


export const getProjetcsMember = async (payload) => {
  try {
    const response = await axiosInstance.post("/projects/members", payload);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed')
    throw error;
  }
};

export const updateTaskStatus = async (payload) => {
  try {
    console.log('call from apilib')
    const response = await axiosInstance.patch("/update-tasks/status", payload);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed')
    throw error;
  }
};

export const updateTask = async (dataToSend) => {
  try {
    const {taskId, data} = dataToSend
    const response = await axiosInstance.post(`/update-task/${taskId}`, {...data});
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed')
    throw error;
  }
};


export async function getAnalytics() {
  try {
    const response = await axiosInstance.get("/analytics/dashboard");
    return response.data;
  } catch (error) {
    console.log("Error in getAnalytics:", error);
     throw error;
  }
}

export const getTaskDetails = async (taskId) => {
  try {
    const res = await axiosInstance.post("/tasks-details", taskId);
    return res.data;
  } catch (error) {
    console.log("Error in getTaskDetails:", error);
    return null;
  }
};

export const createComment = async (payload) => {
  try {
    const res = await axiosInstance.post("/create-comment", payload);
    return res.data;
  } catch (error) {
    console.log("Error in createComment:", error);
    return null;
  }
};


export const getCommentList = async (taskId) => {
  try {
    const res = await axiosInstance.post("/get-comment", taskId);
    return res.data;
  } catch (error) {
    console.log("Error in createComment:", error);
    return null;
  }
};


export const deleteComment = async (commentId) => {
  try {
    const res = await axiosInstance.post("/delete-comment", commentId);
    return res.data;
  } catch (error) {
    console.log("Error in deleteComment:", error);
    return null;
  }
};


