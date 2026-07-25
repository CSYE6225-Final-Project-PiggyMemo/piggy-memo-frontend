import request from "@/lib/request";

const baseURL = "/api/auth";

/**
 * Request body for login request.
 * @param username username of the user, should be not null.
 * @param password password of the user, should be not null.
 */
export interface LoginRequest {
    username: string;
    password: string;
}

/**
 * Login request
 * @param data request body
 * @returns cookies with jwt token.
 */
export const login = (data: LoginRequest) => request.post(`${baseURL}/login`, data);

/**
 * Logout request
 * @returns clears the jwt cookie set by /login
 */
export const logout = () => request.post(`${baseURL}/logout`);