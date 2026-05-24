"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  isActive?: boolean;
  createdAt?: string;
  member?: {
    id: string;
    fullName: string;
    phone: string;
    status: "PENDING" | "ACTIVE" | "INACTIVE";
    membershipPlan: "MONTHLY" | "QUARTERLY" | "HALF_YEARLY" | "YEARLY";
    profileImage?: string;
  } | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signin: (token: string, user: User) => void;
  signup: (token: string, user: User) => void;
  signout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = async (authToken: string) => {
    try {
      const response = await apiClient.get("/auth/me", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.data?.success && response.data?.data) {
        const fullUser = response.data.data;
        setUser(fullUser);
        localStorage.setItem("user", JSON.stringify(fullUser));
      } else {
        throw new Error("Failed to fetch user details");
      }
    } catch (error) {
      console.error("Session revalidation failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      fetchMe(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const signin = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    fetchMe(newToken);
  };

  const signup = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    fetchMe(newToken);
  };

  const signout = async () => {
    try {
      await apiClient.post("/auth/signout");
    } catch (err) {
      console.error("Signout API call failed:", err);
    } finally {
      localStorage.clear();
      setToken(null);
      setUser(null);
      window.location.href = "/auth/signin";
    }
  };

  const refetchUser = async () => {
    const currentToken = token || localStorage.getItem("token");
    if (currentToken) {
      await fetchMe(currentToken);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        signin,
        signup,
        signout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
