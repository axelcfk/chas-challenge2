"use client"

import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({ token: null, userId: null });

  const login = (token, userId) => {
    setAuth({ token, userId });
  };

  const logout = () => {
    setAuth({ token, userId });
  };


  // skicka med state och funktionerna
  return (
<AuthContext.Provider value={{ auth, login, logout}}>
    {children}
</AuthContext.Provider>
  )
}


export function useAuth() {
    return useContext(AuthContext);
}