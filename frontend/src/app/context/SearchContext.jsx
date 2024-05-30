"use client";

import { createContext, useContext, useState } from "react";

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [input, setInput] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [explanation, setExplanation] = useState("");

  const resetState = () => {
    setInput("");
    setMovies([]);
    setLoading(false);
    setShowVideo(true);
    setErrorMessage("");
  };

  return (
    <SearchContext.Provider
      value={{
        input,
        setInput,
        movies,
        setMovies,
        explanation,
        setExplanation,
        loading,
        setLoading,
        showVideo,
        setShowVideo,
        errorMessage,
        setErrorMessage,
        resetState,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
