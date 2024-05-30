"use client";

import { useRouter } from "next/navigation";
import { useSearch } from "../context/SearchContext";
import { useState } from "react";

export const useHandleQuerySubmit = () => {
  const router = useRouter();
  const {
    input,
    setExplanation,
    setMovies,
    setLoading,
    setShowVideo,
    setErrorMessage,
    setInput,
    resetState,
  } = useSearch();

  const handleQuerySubmit = async () => {
    setInput("");
    setLoading(true);
    setMovies([]);
    setShowVideo(true);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:3010/moviesuggest2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input, token: token }),
      });
      const data = await response.json();

      if (data.movieNames && data.movieNames.length > 0) {
        setTimeout(() => {
          setMovies(data.movieNames);
          setExplanation(data.motivation);
          setLoading(false);
          setErrorMessage("");
          setShowVideo(false);
          router.push("/chatpage2");
        }, 10);
      } else {
        setErrorMessage(data.suggestion);
        setLoading(false);
        setShowVideo(false);
      }
    } catch (error) {
      console.error("Failed to fetch AI suggestion:", error);
      setLoading(false);
      setShowVideo(false);
    }
  };

  return { handleQuerySubmit, setInput };
};
