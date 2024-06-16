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

 /*  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedIn = localStorage.getItem("isLoggedIn") === true;
      const storedUser = localStorage.getItem("user");
      setIsLoggedIn(loggedIn);
      setUser(storedUser ? JSON.parse(storedUser) : null);
    }
  }, []); */

  function checkIfLoggedIn() {
    if (typeof window !== "undefined") {
      const isLoggedInLocalStorage = localStorage.getItem("isLoggedIn");
      if (isLoggedInLocalStorage !== null) {
        setIsLoggedIn(isLoggedInLocalStorage === "true");
        const storedUser = localStorage.getItem("user");
        setUser(storedUser ? JSON.parse(storedUser) : null);
      } else {
        console.log("isLoggedIn does not exist in localStorage, setting isLoggedIn to false");
        setIsLoggedIn(false);
      }
      }
  }

  useEffect(() => {
    checkIfLoggedIn();
  }, []);

  useEffect(() => {
    checkIfLoggedIn();
  }, [isLoggedIn]);

  const login = async (username, password) => {
    try {
      const response = await axios.post(
        `${host}/api/sessions`,
        { username, password },
        { withCredentials: true }
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("isLoggedIn", true);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userId", response.data.user.id);
      }
      setIsLoggedIn(true);
      setUser(response.data.user);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  function logout2() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      
      setIsLoggedIn(false);
    }
  }

  const logout = async () => { /* det blev token undefined i cookies på backend ibland? och då funkade inte logout? */
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

  /* useEffect(() => {
    checkAuth();
  }, [checkAuth]); */

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, user, login, logout, checkAuth, logout2, checkIfLoggedIn }}
    >
      {children}
    </AuthContext.Provider>
  );
};
