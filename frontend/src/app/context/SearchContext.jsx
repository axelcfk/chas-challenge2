"use client";

import { createContext, useContext, useState } from "react";

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [input, setInput] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <SearchContext.Provider
      value={{
        input,
        setInput,
        movies,
        setMovies,
        loading,
        setLoading,
        showVideo,
        setShowVideo,
        errorMessage,
        setErrorMessage,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
