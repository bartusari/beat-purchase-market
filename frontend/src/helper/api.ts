import axios from "axios";
import Cookies from "universal-cookie";

import type { User } from "../types/user";
import type { Beat } from "../types/beat";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export function setToken(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

export async function loginUser(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  const data = res.data;

  setToken(data.accessToken);

  const cookies = new Cookies();
  cookies.set("loggedInUser", data, {
    path: "/",
    sameSite: "strict",
    secure: window.location.protocol === "https:",
  });

  return data;
}

export const getMe = async (token: string): Promise<User> => {
  setToken(token);
  const res = await api.get<User>("/users/me");
  return res.data;
};

export const getUserById = async (id: number): Promise<User> => {
  const res = await api.get(`/users/${id}`);
  return res.data;
};

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export const changePassword = async (token: string, dto: ChangePasswordDto) => {
  setToken(token);
  const res = await api.patch("/users/change-password", dto);
  return res.data;
};

export const getGenre = async (id: number): Promise<string> => {
  try {
    const res = await api.get(`/genres/${id}`);
    return res.data?.name ?? `Genre ${id}`;
  } catch (err) {
    console.error("Genre fetch error:", err);
    return `Genre ${id}`;
  }
};

const normalizeBeat = (
  b: any,
): Beat & {
  favoriteCount: number;
  isFavorite: boolean;
} => ({
  ...b,
  genres: b?.genres ?? [],
  favoriteCount: b?.favoriteCount ?? 0,
  isFavorite: Boolean(b?.isFavorite),
});

export const getBeats = async (): Promise<
  Array<
    Beat & {
      favoriteCount: number;
      isFavorite: boolean;
    }
  >
> => {
  const res = await api.get("/beats");
  const arr = Array.isArray(res.data) ? res.data : [];
  return arr.map(normalizeBeat);
};

export const toggleFavorite = async (beatId: number) => {
  const res = await api.post("/favorites/toggle", { beat: beatId });
  return res.data;
};

export const deleteAccount = async (userId: number, token: string) => {
  setToken(token);
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};
