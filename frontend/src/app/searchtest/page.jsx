"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import RatingFilter from "../filter-components/RatingFilter";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoIosClose } from "react-icons/io";

function MovieSearch() {
  const [inputValue, setInputValue] = useState(""); // State to hold input value
  const [movies, setMovies] = useState([]); // State to hold movies fetched from the API
  const [isSearching, setIsSearching] = useState(false); // State to toggle search input visibility
  const [ratingFilter, setRatingFilter] = useState("All"); // State to handle the rating filter

  const inputRef = useRef(null); // Reference for the input field

  // API key for fetching movies, replace with your actual API key
  const movieAPI_KEY = "a97f158a2149d8f803423ee01dec4d83";

  useEffect(() => {
    // Fetching movies based on the input value
    if (inputValue) {
      fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
          inputValue
        )}&api_key=${movieAPI_KEY}`
      )
        .then((response) => response.json())
        .then((data) => {
          setMovies(data.results);
        })
        .catch((error) => console.error("Error fetching data:", error));
    }
  }, [inputValue]);

  const handleIconClick = () => {
    setIsSearching(true); // Show the input field when icon is clicked
    if (inputRef.current) {
      inputRef.current.focus(); // Focus the input field after it appears
    }
  };

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (inputValue.trim()) {
      setIsSearching(false); // Optionally hide the input field on submit
    }
  };

  const handleBlur = () => {
    if (!inputValue) {
      setIsSearching(false); // Hide the input field when it loses focus and is empty
    }
  };

  const handleClose = () => {
    setInputValue(""); // Clear input value
    setIsSearching(false); // Close the search field
  };

  // Filter movies based on rating
  const filteredMovies = movies.filter((movie) => {
    if (ratingFilter === "All") {
      return true;
    } else {
      const selectedRating = parseFloat(ratingFilter);
      return (
        movie.vote_average >= selectedRating &&
        movie.vote_average < selectedRating + 1
      );
    }
  });

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          {isSearching ? (
            <div className="relative">
              <input
                ref={inputRef}
                className="p-2 border text-white border-solid bg-deep-purple rounded shadow appearance-none pr-20" // Pr-10 for close button space
                type="text"
                value={inputValue}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Search for a movie..."
                autoComplete="off"
              />
              <IoIosClose // Close button icon
                className="absolute top-0.5 right-2 transform -translate-y-1/2 cursor-pointer text-gray-400 text-3xl" // Text-xl for larger size of X
                onClick={handleClose}
              />
            </div>
          ) : (
            <FaMagnifyingGlass
              className="text-2xl cursor-pointer"
              onClick={handleIconClick}
            />
          )}

          {isSearching && (
            <RatingFilter // Rating filter component
              ratingFilter={ratingFilter}
              setRatingFilter={setRatingFilter}
            />
          )}
        </div>
      </form>
      {movies.length > 0 && (
        <ul className="mt-4 absolute z-10 bg-white text-black opacity-90 rounded-md w-full">
          {filteredMovies.map((movie) => (
            <li className="list-none p-2 hover:bg-gray-200" key={movie.id}>
              <Link
                className="text-black no-underline hover:underline"
                href={`/movie/${encodeURIComponent(movie.id)}`}
              >
                {movie.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MovieSearch;
