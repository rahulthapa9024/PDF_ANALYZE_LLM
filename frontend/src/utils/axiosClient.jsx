import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:8000", // ✅ MUST match backend
  withCredentials: true,
});

export default axiosClient;