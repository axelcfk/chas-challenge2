"use client";

import { useRouter } from "next/navigation";
import { useSearch } from "../context/SearchContext";

export const useHandleQuerySubmit = () => {
  const router = useRouter();
  const {
    input,
    setMovies,
    setLoading,
    setShowVideo,
    setErrorMessage,
    setInput,
  } = useSearch();

  const handleQuerySubmit = async () => {
    setLoading(true);
    setMovies([]);
    setShowVideo(true);

    const cachedData = JSON.parse(localStorage.getItem("latestSearch"));
    const token = localStorage.getItem("token");

    if (cachedData && cachedData.input === input) {
      setMovies(cachedData.movies);
      setLoading(false);
      setShowVideo(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3010/moviesuggest2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input, token: token }),
      });
      const data = await response.json();

      if (data.movieNames && data.movieNames.length > 0) {
        const sanitizedMovieNames = data.movieNames.map((name) =>
          name.replace(/^"|"$/g, "")
        );
        localStorage.setItem(
          "latestSearch",
          JSON.stringify({ movies: sanitizedMovieNames, input })
        );
        setTimeout(() => {
          setMovies(sanitizedMovieNames);
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
