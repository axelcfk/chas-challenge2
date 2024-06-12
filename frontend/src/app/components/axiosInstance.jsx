import axios from "axios";
import { host } from "../utils";

const axiosInstance = axios.create({
    baseURL: `${host}/api`,
    withCredentials: true,
});

export default axiosInstance;