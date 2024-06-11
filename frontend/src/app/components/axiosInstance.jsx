import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://16.171.5.238:3010",
    withCredentials: true,
});

export default axiosInstance;