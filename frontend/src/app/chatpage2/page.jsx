"use client";

import { useState, useEffect } from "react";
import MovieCard from "./moviecards";

// https://api.themoviedb.org/3/movie/550/watch/providers?api_key=a97f158a2149d8f803423ee01dec4d83

export default function ChatPage2() {
  const [input, setInput] = useState("");
  const [movieDetails, setMovieDetails] = useState([]);
  const [movieCredits, setMovieCredits] = useState({});

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noResult, setNoResult] = useState(false);
  const movieAPI_KEY = "4e3dec59ad00fa8b9d1f457e55f8d473";

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  useEffect(() => {
    async function fetchCreditsDetails() {
      if (movieDetails.idFromAPI) {
        try {
          const url = `https://api.themoviedb.org/3/movie/${movieDetails.idFromAPI}/credits?api_key=${movieAPI_KEY}`;
          const response = await fetch(url);
          const data = await response.json();
          console.log(data);
          const director = data.crew.find(
            (person) => person.job === "Director"
          );

          console.log(`The direector is: ${director.name}`);
          if (director) {
            setMovieCredits({
              ...movieCredits,
              director: director.name,
            });
          } else {
            console.error("No movie found with the given ID");
          }
        } catch (error) {
          console.error("Error fetching movie details:", error);
        }
      }
    }

    fetchCreditsDetails();
  }, [movieDetails.idFromAPI]);

  const handleQuerySubmit = async () => {
    setLoading(true);
    setNoResult(false);
    try {
      const response = await fetch("http://localhost:3010/moviesuggest2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });
      const data = await response.json();
      console.log("Data received:", data);

      if (data.movieNames && data.movieNames.length > 0) {
        console.log("Received Movie Names:", data.movieNames);
        setMovies(data.movieNames);
      } else {
        setNoResult(true);
      }
    } catch (error) {
      console.error("Failed to fetch AI suggestion:", error);
      setNoResult(true);
    } finally {
      setLoading(false);
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
            console.log(data.results);
            if (data.results.length > 0) {
              const movieId = data.results[0].id;
              const detailsResponse = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}?api_key=${movieAPI_KEY}`
              );
              const detailsData = await detailsResponse.json();
              const posterPath = detailsData.poster_path;
              const posterUrl = posterPath
                ? `https://image.tmdb.org/t/p/w500${posterPath}`
                : null;
              return {
                title: detailsData.title,
                id: movieId,
                poster: posterUrl,
                overview: detailsData.overview,
                // Add more details as needed
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

  console.log("movies:", movies);
  console.log("moviedetails :", movieDetails);
  console.log("moviecredits", movieCredits);

  return (
    <div className="flex flex-col justify-center items-center md:items-start px-10 md:px-20 h-screen w-screen bg-slate-950 text-slate-100 z-0">
      <div className="flex justify-center items-center">
        <div
          className="flex flex-col
         justify-center items-center flex-wrap"
        >
          {movieDetails.map((movie, index) => (
            <MovieCard key={movie.id} movie={movie} credits={movieCredits} />
          ))}
        </div>
      </div>
      <div className="sticky inset-x-0 bottom-0  z-10 w-full">
        <input
          style={{ border: "1px solid grey" }}
          className="h-14 bg-transparent w-full md:w-1/3 rounded-xl text-lg text-center text-slate-50"
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Describe the movie you want..."
        />
        <button
          className={`h-12  ${
            input
              ? "bg-slate-100 hover:bg-slate-300 text-slate-900"
              : "bg-slate-400 text-slate-900"
          } w-full md:w-1/3 rounded-full mt-5 font-semibold text-xl`}
          onClick={handleQuerySubmit}
          disabled={!input}
        >
          Find Movie
        </button>
      </div>
    </div>
  );
}
