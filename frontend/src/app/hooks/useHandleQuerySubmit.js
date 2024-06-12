"use client";

import { useRouter } from "next/navigation";
import { useSearch } from "../context/SearchContext";
import { useState, useRef } from "react";
import { host } from "../utils";

const changeSpeed = (videoRef, speed) => {
  if (videoRef.current) {
    videoRef.current.playbackRate = speed;
  }
};

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

  const videoRef = useRef(null);

  const handleQuerySubmit = async () => {
    setInput("");
    setLoading(true);
    setMovies([]);
    setShowVideo(true);

    changeSpeed(videoRef, 6.0); // ändra hastighet

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${host}/api/moviesuggest2`, {
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

          changeSpeed(videoRef, 3.0);

          router.push("/chatpage2");
        }, 10);
      } else {
        setErrorMessage(data.suggestion);
        setLoading(false);
        setShowVideo(false);

        changeSpeed(videoRef, 1.0);
      }
    } catch (error) {
      console.error("Failed to fetch AI suggestion:", error);
      setLoading(false);
      setShowVideo(false);

      changeSpeed(videoRef, 1.0);
    }
  };

  return { handleQuerySubmit, setInput, videoRef };
};
