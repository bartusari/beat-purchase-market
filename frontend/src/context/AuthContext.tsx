import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setToken } from "../helper/api";
import { useAudio } from "./AudioContext";
import type { User } from "../types/user";

interface AuthContextType {
  user: User | null;
  userRole: "USER" | "PRODUCER" | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (role: "USER" | "PRODUCER", token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { stopAudio } = useAudio();

  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("accessToken"),
  );
  const [userRole, setUserRole] = useState<"USER" | "PRODUCER" | null>(
    localStorage.getItem("userRole") as "USER" | "PRODUCER" | null,
  );
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    stopAudio();
    setUser(null);
    setUserRole(null);
    setAccessToken(null);
    localStorage.removeItem("userRole");
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  useEffect(() => {
    const initAuth = async () => {
      if (accessToken) {
        setToken(accessToken);
        try {
          const res = await axios.get<User>(`${API_BASE_URL}/users/me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          setUser(res.data);
        } catch (err) {
          console.error("Oturum süresi dolmuş veya hatalı:", err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [accessToken]);

  const login = async (role: "USER" | "PRODUCER", token: string) => {
    setAccessToken(token);
    setUserRole(role);
    setToken(token);
    localStorage.setItem("userRole", role);
    localStorage.setItem("accessToken", token);

    try {
      const res = await axios.get<User>(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("Login sonrası kullanıcı bilgisi alınamadı:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, userRole, accessToken, isLoading, login, logout }}
    >
      {!isLoading ? children : <div className="h-screen bg-black" />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
