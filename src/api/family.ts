import request from "@/lib/request";

const BASE_URL = "/api/family";

export type FamilyRole = "OWNER" | "MEMBER";

export interface FamilyMember {
  userId: number;
  nickname: string;
  avatarUrl: string;
  isOwner: boolean;
}

export interface FamilyDetailResponse {
  id: number;
  familyCode: string;
  familyName: string;
  ownerUserId: number;
  createdAt: string;
  members: FamilyMember[];
}

export interface JoinRequestSummary {
  requestId: number;
  userId: number;
  nickname: string;
  requestedAt: string;
}

export interface MyFamily extends FamilyDetailResponse {
  role: FamilyRole;
  /** Only populated when role === "OWNER" (fetched as part of role detection below). */
  joinRequests: JoinRequestSummary[];
}

export interface JoinFamilyRequest {
  familyCode: string;
}

export interface TransferOwnershipRequest {
  newOwnerUserId: number;
}

/**
 * GET /api/family returns a 200 with a JSON `null` body (not an error) when
 * the caller isn't in a family. The backend doesn't return the caller's own
 * role directly either, so it's derived from whether the owner-only
 * join-requests endpoint succeeds (200 => owner) or is denied with 403
 * (=> member) — this doubles as fetching the pending-requests list for free
 * when the caller is the owner, so callers of getMyFamily() don't need a
 * second request for that.
 */
export async function getMyFamily(): Promise<MyFamily | null> {
  const res = await request.get<FamilyDetailResponse | null>(BASE_URL);
  const detail = res.data;
  if (!detail) return null;

  try {
    const joinRequests = await request.get<JoinRequestSummary[]>(`${BASE_URL}/join-requests`);
    return { ...detail, role: "OWNER", joinRequests: joinRequests.data };
  } catch (err) {
    if (err.response?.status === 403) return { ...detail, role: "MEMBER", joinRequests: [] };
    throw err;
  }
}

export interface CreateFamilyRequest {
  name?: string;
}

export function createFamily(data?: CreateFamilyRequest) {
  return request.post<FamilyDetailResponse>(`${BASE_URL}/create`, data);
}

export function joinFamily(data: JoinFamilyRequest) {
  return request.post<void>(`${BASE_URL}/join`, data);
}

export function cancelMyJoinRequest() {
  return request.post<void>(`${BASE_URL}/join/cancel`);
}

/** GET /api/family/join-requests — owner-only. */
export function getJoinRequests() {
  return request.get<JoinRequestSummary[]>(`${BASE_URL}/join-requests`);
}

export function approveJoinRequest(requestId: number) {
  return request.post<void>(`${BASE_URL}/join-requests/${requestId}/approve`);
}

export function rejectJoinRequest(requestId: number) {
  return request.post<void>(`${BASE_URL}/join-requests/${requestId}/reject`);
}

export function transferOwnership(data: TransferOwnershipRequest) {
  return request.post<void>(`${BASE_URL}/transfer-ownership`, data);
}

export function removeMember(userId: number) {
  return request.post<void>(`${BASE_URL}/members/${userId}/remove`);
}

export function leaveFamily() {
  return request.post<void>(`${BASE_URL}/leave`);
}

export function deleteFamily() {
  return request.delete<void>(BASE_URL);
}
