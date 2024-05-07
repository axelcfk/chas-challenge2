"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";

function MovieSearch() {
  const [inputValue, setInputValue] = useState("");
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieDetails, setMovieDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const movieAPI_KEY = "a97f158a2149d8f803423ee01dec4d83";

  useEffect(() => {
    if (movieAPI_KEY != null && loading && movieDetails.titleFromGPT) {
      console.log("title received from GPT: ", movieDetails.titleFromGPT);
      const encodedMovieTitle = encodeURIComponent(movieDetails.titleFromGPT);
      console.log("encoded movie title: ", encodedMovieTitle);

      fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodedMovieTitle}&api_key=${movieAPI_KEY}`
      )
        .then((response) => response.json())
        .then((data) => {
          console.log("id from API: ", data.results[0].id);

          setMovieDetails({
            ...movieDetails,
            idFromAPI: data.results[0].id,
          });
        })
        .catch((error) => console.error("Error fetching data:", error));
    }
  }, [movieDetails.titleFromGPT]);

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSelectChange = (event) => {
    const selectedId = event.target.value;
    const selected = movies.find((movie) => movie.id.toString() === selectedId);
    setSelectedMovie(selected);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${inputValue}&api_key=${movieAPI_KEY}`
      );
      const data = await response.json();
      setMovies(data.results);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          className="text-black"
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder="Search for a movie..."
          autoComplete=""
        />
        <button className="px-5" type="submit">
          Search
        </button>
      </form>
      <ul className="mt-4 absolute z-10 bg-white text-black opacity-90 border-solid rounded-md ">
        {movies.map((movie) => (
          <li key={movie.id}>
            <Link href={`/movie/${encodeURIComponent(movie.id)}`}>
              {movie.title}{" "}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MovieSearch;
