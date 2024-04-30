"use client";

import { useState, useEffect, useRef } from "react";
import MovieCard from "./moviecards";
import { postMovieToDatabase } from "../utils";

export default function ChatPage2() {
  const [input, setInput] = useState("");
  const [movieDetails, setMovieDetails] = useState([]);
  const [movieCredits, setMovieCredits] = useState({});
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noResult, setNoResult] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const movieAPI_KEY = "4e3dec59ad00fa8b9d1f457e55f8d473";
  const videoRef = useRef(null);

  const handleInputChange = (e) => setInput(e.target.value);

  const changeSpeed = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleQuerySubmit = async () => {
    setLoading(true);
    setInput("");
    setShowVideo(true);
    changeSpeed(5); // Speed up the video when the search begins

    try {
      const response = await fetch("http://localhost:3010/moviesuggest2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });
      const data = await response.json();

      if (data.movieNames && data.movieNames.length > 0) {
        console.log("Received Movie Names:", data.movieNames);
        // Delay setting movies and hiding video
        setTimeout(() => {
          setMovies(data.movieNames); // Now set movies here to trigger details fetching after the delay
          setLoading(false); // Also set loading false here to ensure it happens after the video hides
          setShowVideo(false); // Hide video after 10 seconds
        }, 2000);
      } else {
        setNoResult(true);
        setLoading(false);
        setShowVideo(false);
      }
    } catch (error) {
      console.error("Failed to fetch AI suggestion:", error);
      setNoResult(true);
      setLoading(false);
      setShowVideo(false);
    }
  };

  useEffect(() => {
    async function fetchAllMovieDetails() {
      const allMovieDetails = await Promise.all(
        movies.map(async (title) => {
          try {
            const encodedTitle = encodeURIComponent(title);
            const response = await fetch(
              `https://api.themoviedb.org/3/search/movie?query=${encodedTitle}&api_key=${movieAPI_KEY}`
            );
            const data = await response.json();
            if (data.results.length > 0) {
              const movieId = data.results[0].id;
              const detailsResponse = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}?api_key=${movieAPI_KEY}`
              );
              const detailsData = await detailsResponse.json();
              await postMovieToDatabase(detailsData);
              const posterPath = detailsData.poster_path;
              const posterUrl = posterPath
                ? `https://image.tmdb.org/t/p/w500${posterPath}`
                : null;
              return {
                title: detailsData.title,
                id: movieId,
                poster: posterUrl,
                overview: detailsData.overview,
              };
            }
          } catch (error) {
            console.error(`Error fetching details for ${title}:`, error);
          }
        })
      );
      setMovieDetails(allMovieDetails.filter((detail) => detail !== undefined));
    }

    if (movies.length > 0) fetchAllMovieDetails();
  }, [movies]);

  return (
    <div className="flex  flex-col justify-center items-center md:items-start px-10 md:px-20 h-screen w-screen bg-black text-slate-100 z-0">
      {showVideo && movieDetails.length < 3 && (
        <div className=" md:w-full flex flex-col justify-center items-center h-full ">
          <video
            className="md:w-1/2 w-full "
            ref={videoRef}
            autoPlay
            loop
            muted
          >
            <source src="/ai-gif.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <p className="text-xl flex flex-col items-center md:-mt-14 -mt-8">
            {" "}
            <span className="mb-4">Hi there!</span>{" "}
            <span>I'm your personal </span> <span>AI movie matcher</span>
          </p>
        </div>
      )}
      <div className="flex justify-center items-center ">
        {movieDetails.length > 0 && (
          <div>
            <div className="flex flex-col justify-center items-center flex-wrap">
              {movieDetails.map((movie, index) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  credits={movieCredits}
                />
              ))}
            </div>
            <div className=" sticky inset-x-0 bottom-10 z-10 w-full flex flex-wrap justify-center items-center ">
              <div
                className="flex justify-center items-center  rounded-xl h-14 px-10 z-10"
                style={{ border: "1px solid grey" }}
              >
                <input
                  className="h-14 bg-transparent w-full md:w-1/3 rounded-xl text-lg text-center text-slate-50 md:mr-3"
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Want anything else?"
                />
                <div
                  className="hover:cursor-pointer"
                  onClick={handleQuerySubmit}
                >
                  <video
                    className="w-full h-14"
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                  >
                    <source src="/ai-gif.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {!movieDetails.length > 0 && (
        <div className=" sticky inset-x-0 bottom-10 z-10 w-full flex flex-wrap justify-center items-center ">
          <input
            style={{ border: "1px solid grey" }}
            className="h-14 bg-transparent w-full md:w-1/3 rounded-xl text-lg text-center text-slate-50 md:mr-3"
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="What's your movie vibe today?"
          />
          <button
            className={`h-14 ${
              input
                ? "bg-slate-100 hover:bg-slate-300 text-slate-900"
                : "bg-slate-400 text-slate-900"
            } w-full md:w-1/3 rounded-full  font-semibold text-xl md:ml-3 md:mt-0 mt-5`}
            onClick={handleQuerySubmit}
            disabled={!input}
          >
            Find Movie
          </button>
        </div>
      )}
    </div>
  );
}
