"use client";

import { useState, useEffect } from "react";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [movieDetails, setMovieDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const movieAPI_KEY = "4e3dec59ad00fa8b9d1f457e55f8d473";

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (movieDetails.id) {
        console.log("Fetching movie details for ID:", movieDetails.id);
        try {
          const url = `https://api.themoviedb.org/3/movie/${movieDetails.id}?api_key=${movieAPI_KEY}`;
          const response = await fetch(url);
          const data = await response.json();
          if (data.title) {
            // Check if data includes title
            setMovieDetails({
              ...movieDetails,
              title: data.title,
              overview: data.overview,
              poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
            });
          } else {
            console.error("No movie found with the given ID");
          }
        } catch (error) {
          console.error("Error fetching movie details:", error);
        }
      }
    };

    fetchMovieDetails();
  }, [movieDetails.id]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleQuerySubmit = async () => {
    setLoading(true);
    console.log("Submitting query for movie:", input);
    try {
      const response = await fetch("http://localhost:3010/moviesuggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });
      const data = await response.json();
      if (data.tmdbId) {
        console.log("Received TMDB ID:", data.tmdbId);
        setMovieDetails({ id: data.tmdbId });
      } else {
        console.error("No TMDB ID received or error in response");
      }
    } catch (error) {
      console.error("Failed to fetch AI suggestion:", error);
    }
    setLoading(false);
  };

  function LoadingIndicator() {
    return (
      <div className="loading-indicator ">
        <h3 className="font-semibold text-3xl">Exciting stuff!</h3>
        <div className="loader m-10"></div>
        <p className="font-semibold text-xl">Finding a movie match ... </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center pt-10 px-8 h-screen w-screen">
      {loading ? (
        <LoadingIndicator />
      ) : (
        <div className="h-full flex flex-col justify-center items-center">
          <p>I recommend</p>
          {movieDetails.title ? (
            <div className="flex flex-col justify-center items-center">
              <h2 className="text-5xl font-semibold mb-10">
                {" "}
                {movieDetails.title}
              </h2>
              <div className="flex flex-col justify-center items-center">
                {" "}
                <img
                  className="h-60 mb-10"
                  src={movieDetails.poster}
                  alt="Movie Poster"
                />
                <p className="mb-10">
                  {movieDetails.overview.slice(0, 200)}...
                </p>
              </div>
            </div>
          ) : (
            <h2 className="h-full ">No movie details to display</h2>
          )}
        </div>
      )}

      <input
        className="h-20 bg-slate-200 w-full px-5 rounded-xl"
        type="text"
        value={input}
        onChange={handleInputChange}
        placeholder="Describe the movie you want..."
      />
      <button
        className="h-20 bg-blue-700 text-slate-50 w-full rounded-full mt-5 mb-10"
        onClick={handleQuerySubmit}
      >
        Find Movie
      </button>
    </div>
  );
}
