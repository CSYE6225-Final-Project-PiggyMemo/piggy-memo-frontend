import axios from "axios";

const request = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 10000,
    withCredentials: true
});

request.interceptors.response.use(
    (res) => res,
    (error) => {
        if(error.response?.status === 401) {
            //Avoid refresh when login failed; avoid triggered in cli"
            if(typeof window !== "undefined" && window.location.pathname !== "/login")
                window.location.href = "/login";
        }
        return Promise.reject(error);
    }
)

export default request;