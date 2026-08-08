import request from "@/lib/request";

const baseURL = "/api/profile";

export interface Profile {
  id: number;
  avatarUrl: string;
  nickname: string;
  bio: string;
  isProfilePublic: boolean;
}

export interface ProfileUpdateRequest {
  avatarUrl?: string;
  nickname?: string;
  bio?: string;
  isProfilePublic?: boolean;
}

export function getProfile() {
  return request.get<Profile>(baseURL);
}

export function updateProfile(data: ProfileUpdateRequest) {
  return request.post<Profile>(`${baseURL}/edit`, data);
}