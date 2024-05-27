"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const login = async (username, password) => {
    try {
      const response = await axios.post(
        "http://localhost:3010/sessions",
        { username, password },
        { withCredentials: true }
      );
      setIsLoggedIn(true);
      setUser(response.data.user);
      //* Store token in local storage
      //* Don't remove thus the fetches wont work.
      localStorage.setItem("token", response.data.token);
      //* Profile-page uses userId
      localStorage.setItem("userId", response.data.user.id);
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
        "http://localhost:3010/logout",
        {},
        { withCredentials: true }
      );
      setIsLoggedIn(false);
      setUser(null);
      // Remove token and userId from local storage when log out
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("token"); // Get token from local storage
      if (!token) {
        setIsLoggedIn(false);
        setUser(null);
        return;
      }
      const response = await axios.get("http://localhost:3010/session-status", {
        headers: { Authorization: `Bearer ${token}` }, // Use token in Authorization header
        withCredentials: true,
      });
      if (response.data.loggedIn) {
        setIsLoggedIn(true);
        setUser(response.data.user);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      setIsLoggedIn(false);
      setUser(null);
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
