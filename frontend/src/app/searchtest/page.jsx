"use client";
import { host } from "../utils";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import RatingFilter from "../filter-components/RatingFilter";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { FaChevronUp } from "react-icons/fa6";

function MovieSearch({ isSearchOpen, setIsSearchOpen }) {
  const [inputValue, setInputValue] = useState(""); // State to hold input value
  const [movies, setMovies] = useState([]); // State to hold movies fetched from the API
  const [isSearching, setIsSearching] = useState(false); // State to toggle search input visibility
  const [ratingFilter, setRatingFilter] = useState("All"); // State to handle the rating filter
  const [movieProviders, setMovieProviders] = useState([]); // State to handle movie providers
  const [fetchStreamService, setFetchStreamService] = useState(false); // State to fetch stream services

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
          const slicedResults = data.results.slice(0, 10);
          setMovies(slicedResults);
        })
        .catch((error) => console.error("Error fetching data:", error));
    }
  }, [inputValue]);

  // Function to fetch movie providers from the backend
  async function fetchMovieProviders(id) {
    try {
      const response = await fetch(`${host}/fetchmovieprovidersTMDB`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
        }),
      });

      const data = await response.json();

      setMovieProviders((prevDetails) => [
        ...prevDetails,
        {
          providers: data.movieProvidersObject,
          movieId: data.movieId,
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const handleIconClick = () => {
    setIsSearching(true); // Show the input field when icon is clicked
    setIsSearchOpen(true); // Set the navbar state to open
    if (inputRef.current) {
      inputRef.current.focus(); // Focus the input field after it appears
    }
  };

  const handleChange = (event) => {
    const newValue = event.target.value;
    setInputValue(newValue);

    // If the input value is empty, clear the movie list
    if (!newValue.trim()) {
      setMovies([]);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (inputValue.trim()) {
      setIsSearching(false); // Optionally hide the input field on submit
      setIsSearchOpen(false); // Set the navbar state to closed
    }
  };

  const handleBlur = () => {
    if (!inputValue && !isSearching) {
      setIsSearching(false); // Hide the input field when it loses focus and is empty
      setIsSearchOpen(false); // Set the navbar state to closed
    }
  };

  const handleClose = () => {
    setInputValue(""); // Clear input value
    setIsSearching(false); // Close the search field
    setMovies([]);
    setIsSearchOpen(false); // Set the navbar state to closed
  };

  const handleCloseLinkClick = () => {
    handleClose(); // Call the handleClose function to close the search list
  };

  const handleIconKeyPress = (event) => {
    if (event.key === "Enter") {
      handleIconClick();
    }
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

  useEffect(() => {
    if (fetchStreamService) {
      // Clear previous providers
      setMovieProviders([]);
      // Fetch providers for each filtered movie
      filteredMovies.forEach((movie) => {
        fetchMovieProviders(movie.id);
      });
      // Reset fetchStreamService to false after fetching providers
      setFetchStreamService(false);
    }
  }, [fetchStreamService, filteredMovies]);

  return (
    <div className={`relative ${isSearchOpen ? "w-full" : "w-auto"}`}>
      <form
        onSubmit={handleSubmit}
        className={`flex items-center space-x-2 ${
          isSearchOpen ? "w-full" : "w-auto"
        }`}
      >
        <div
          className={`flex items-center space-x-2 ${
            isSearchOpen ? "w-full" : "w-auto"
          } relative`}
        >
          {isSearching || isSearchOpen ? (
            <div className="relative w-full flex items-center">
              <FaChevronUp
                className="cursor-pointer text-gray-400 text-2xl absolute ml-4"
                onClick={handleClose}
              />
              <input
                ref={inputRef}
                className=" border pl-24 h-12 text-white border-solid bg-deep-purple rounded-full shadow appearance-none pr-40 w-full box-border"
                type="text"
                value={inputValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleClose();
                  }
                }}
                placeholder="Search Movie..."
                autoComplete="off"
              />
              <div className="absolute right-0 flex items-center pr-2">
                <div className="mr-1">
                  <RatingFilter
                    ratingFilter={ratingFilter}
                    setRatingFilter={setRatingFilter}
                    className="text-gray-500 rounded bg-deep-purple px-2 py-1 hover:bg-lighter-purple cursor-pointer border-none focus:outline-none mr-2"
                  />
                </div>
                <button
                  type="button"
                  className="text-gray-500 rounded bg-deep-purple px-2 py-1 hover:bg-lighter-purple cursor-pointer border-none focus:outline-none mr-2"
                  onClick={() => setFetchStreamService(true)}
                >
                  Stream
                </button>
              </div>
            </div>
          ) : (
            <FaMagnifyingGlass
              role="button"
              tabIndex={0}
              className="text-2xl cursor-pointer"
              onClick={handleIconClick}
              onKeyPress={handleIconKeyPress}
              aria-label="search button"
            />
          )}
        </div>
      </form>
      {movies.length > 0 && (
        <ul className="mt-4 absolute z-10 bg-white text-black opacity-90 rounded-md w-full max-w-full max-h-[500px] overflow-y-scroll">
          {filteredMovies.map((movie) => (
            <li className="list-none p-2 hover:bg-gray-200" key={movie.id}>
              <Link
                className="text-black no-underline hover:underline flex items-center"
                href={`/movie/${encodeURIComponent(movie.id)}`}
                onClick={handleCloseLinkClick} /* Add onClick handler */
              >
                <img
                  src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                  alt={movie.title}
                  className="w-10 h-10 mr-2"
                  aria-hidden="true"
                />
                {movie.title}
                {movieProviders &&
                  movieProviders.map((movieProviderObj) => {
                    if (movieProviderObj.movieId === movie.id) {
                      return (
                        <div key={movieProviderObj.movieId}>
                          {movieProviderObj.providers.noProviders && (
                            <p>{movieProviderObj.providers.noProviders}</p>
                          )}
                          {movieProviderObj.providers.flatrate && (
                            <p>
                              {
                                movieProviderObj.providers.flatrate[0]
                                  .provider_name
                              }
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MovieSearch;
