"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import RatingFilter from "../filter-components/RatingFilter";

function MovieSearch() {
  const [inputValue, setInputValue] = useState("");
  const [movies, setMovies] = useState([]);
  const [movieDetails, setMovieDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [ratingFilter, setRatingFilter] = useState("All");

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

  const filteredMovies = movies.filter((movie) => {
    if (ratingFilter === "All") {
      return true;
    } else {
      const selectedRating = parseFloat(ratingFilter);
      const movieRating = parseFloat(movie.vote_average);
      return movieRating >= selectedRating && movieRating < selectedRating + 1;
    }
  });

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
      <RatingFilter
        ratingFilter={ratingFilter}
        setRatingFilter={setRatingFilter}
      />
      <ul className="mt-4 absolute z-10 bg-white text-black opacity-90 rounded-md ">
        {filteredMovies.map((movie) => (
          <li className="list-none" key={movie.id}>
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
