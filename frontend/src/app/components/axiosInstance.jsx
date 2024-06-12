import axios from "axios";
import { host } from "../utils";

const axiosInstance = axios.create({
    baseURL: `${host}:3010`,
    withCredentials: true,
});

export default axiosInstance;