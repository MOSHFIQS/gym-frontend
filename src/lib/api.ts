import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.clear();
        // Avoid redirect loop if already on signin
        if (!window.location.pathname.startsWith("/auth/signin")) {
          window.location.href = "/auth/signin";
        }
      }
    }

    // Extract errorSources[0].message or general message
    if (error.response?.data) {
      const errorData = error.response.data;
      let extractedMessage = errorData.message || "An unexpected error occurred.";
      
      if (Array.isArray(errorData.errorSources) && errorData.errorSources.length > 0) {
        extractedMessage = errorData.errorSources[0].message;
      }
      
      // Override the error message with the extracted one
      error.message = extractedMessage;
    }

    return Promise.reject(error);
  }
);

export default apiClient;
