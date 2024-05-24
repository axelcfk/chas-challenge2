"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
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
      console.log("Login response:", response.data);
      setIsLoggedIn(true);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      console.error("Login error", error);
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
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const checkAuth = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:3010/session-status", {
        withCredentials: true,
      });
      console.log("Check auth response:", response.data);
      if (response.data.loggedIn) {
        setIsLoggedIn(true);
        setUser(response.data.user);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Check auth error:", error);
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

