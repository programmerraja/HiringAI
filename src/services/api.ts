import axios from "axios";

// Create an axios instance with default config
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // Important for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors here, but don't redirect on 401 to avoid redirect loops
    // The auth context will handle authentication state
    console.error("API Error:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default api;
