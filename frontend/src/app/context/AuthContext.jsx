"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import axios from "axios";
import { host } from "../utils";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedIn = localStorage.getItem("isLoggedIn") === true;
      const storedUser = localStorage.getItem("user");
      setIsLoggedIn(loggedIn);
      setUser(storedUser ? JSON.parse(storedUser) : null);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post(
        `${host}/api/sessions`,
        { username, password },
        { withCredentials: true }
      );
      setIsLoggedIn(true);
      setUser(response.data.user);
      if (typeof window !== "undefined") {
        localStorage.setItem("isLoggedIn", true);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userId", response.data.user.id);
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${host}/api/logout`,
        {},
        { withCredentials: true }
      );
      setIsLoggedIn(false);
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const checkAuth = useCallback(async () => {
    try {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoggedIn(false);
          setUser(null);
          return;
        }
        const response = await axios.get(
          `${host}/api/session-status`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        if (response.data.loggedIn) {
          setIsLoggedIn(true);
          setUser(response.data.user);
          localStorage.setItem("isLoggedIn", true);
          localStorage.setItem("user", JSON.stringify(response.data.user));
        } else {
          setIsLoggedIn(false);
          setUser(null);
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("user");
        }
      }
    } catch (error) {
      setIsLoggedIn(false);
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("user");
      }
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, user, login, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};
