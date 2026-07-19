import request from "@/lib/request";

const BASEURL = "/api/users";

export interface CreateUserRequest {
    username: string;
    password: string;
}

export interface CreateUserResponse {
    id: number;
    username: string;
    createdAt: string;
}

export const createUser = (data: CreateUserRequest) =>
    request.post<CreateUserResponse>(BASEURL, data);

export const checkUsername = (username: string) =>
    request.get<boolean>(`${BASEURL}/exists`, {params: {username: username}});