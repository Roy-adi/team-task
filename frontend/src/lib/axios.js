import axios from "axios";

const BASE_URL = "http://localhost:5000/api/v1"
// const BASE_URL = "https://vc-backend-2d1g.onrender.com/api/v1"

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Add accessToken to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers["Authorization"] = token; // no Bearer, no quotes
  }
  return config;
});
