"use client";
import { host } from "../utils";
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
  const [movieProviders, setMovieProviders] = useState([]); // State to handle
  const [fetchStreamService, setFetchStreamService] = useState(false);

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

  //fetchar streamingtjänster från backend
  async function fetchMovieProviders(id) {
    try {
      const response = await fetch(`${host}/fetchmovieprovidersTMDB`, {
        // users sidan på backend! dvs inte riktiga sidan!
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,

          //token: tokenStorage, // "backend får in detta som en "request" i "body"... se server.js när vi skriver t.ex. const data = req.body "
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
    } finally {
    }
  }
  //fetchar streamingtjänster från backend

  const handleIconClick = () => {
    setIsSearching(true); // Show the input field when icon is clicked
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
    }
  };

  const handleBlur = () => {
    if (!inputValue && !isSearching) {
      setIsSearching(false); // Hide the input field when it loses focus and is empty
    }
  };

  const handleClose = () => {
    setInputValue(""); // Clear input value
    setIsSearching(false); // Close the search field
    setMovies([]);
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
  }, [fetchStreamService, filteredMovies]); // ÄNDRA TILL NÅGON ANNAN TRIGGER, annars fetchas varje gång du skriver en bokstav... måNGa fetches
  // }, [inputValue]);

  //console.log(movieProviders);

  if (movieProviders.length === 20) {
    movieProviders.map((movie) => {
      if (movie.providers.flatrate) {
        console.log(
          "flatrates of movie ID ",
          movie.movieId,
          ": ",
          movie.providers.flatrate
        );
      } else if (!movie.providers.flatrate) {
        console.log(
          "no providers for movie ID ",
          movie.movieId,
          ": ",
          movie.providers.noProviders
        );
      }
    });
  }

  return (
    <div className="relative ">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <div
          className={`flex items-center space-x-2 p-1 text-white ${
            isSearching
              ? "border border-solid border-t-0 border-x-0 border-gray-500"
              : ""
          } bg-deep-purple`}
        >
          {isSearching ? (
            <div className="relative ">
              <input
                ref={inputRef}
                className="p-2 text-white bg-deep-purple rounded shadow border-none pr-10" // Pr-10 for close button space
                type="text"
                value={inputValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleClose();
                  }
                }}
                placeholder="Search for a movie..."
                autoComplete="off"
                aria-label="Search for a movie"
              />
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

          {isSearching && (
            <>
              <RatingFilter // Rating filter component
                ratingFilter={ratingFilter}
                setRatingFilter={setRatingFilter}
                aria-label="Filter rating"
              />
              <button
                tabIndex={0}
                type="button"
                className="text-gray-500 rounded-s bg-deep-purple px-1 py-1.5 hover:bg-lighter-purple cursor-pointer border border-solid border-gray-500 focus:border-gray-500"
                onClick={() => (
                  setMovieProviders([]), setFetchStreamService(true)
                )}
                aria-label="Shows streaming provider"
              >
                stream
              </button>
              <IoIosClose // Close button icon
                tabIndex={0}
                className="top-0.5 right-2 transform -translate-y-1/2 cursor-pointer text-gray-400 text-3xl" // Text-xl for larger size of X
                onClick={handleClose}
                onKeyPress={handleClose}
                aria-label="close search bar"
              />
            </>
          )}
        </div>
      </form>
      {movies.length > 0 && (
        <ul className="mt-4 absolute z-10 bg-white text-black opacity-90 rounded-md w-full max-h-[500px] overflow-y-scroll">
          {filteredMovies.map((movie) => (
            <li className="list-none p-2 hover:bg-gray-200" key={movie.id}>
              <Link
                className="text-black no-underline hover:underline"
                href={`/movie/${encodeURIComponent(movie.id)}`}
                onClick={handleCloseLinkClick} /* Add onClick handler */
              >
                <img
                  src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                  alt={movie.title}
                  className="w-10 h-10 mr-2"
                  aria-hidden="true"
                />
                {movieProviders &&
                  movieProviders.map((movieProviderObj) => {
                    return (
                      <div>
                        {movieProviderObj.movieId === movie.id &&
                          movieProviderObj.providers.noProviders && (
                            <p>{movieProviderObj.providers.noProviders}</p>
                          )}

                        {movieProviderObj.movieId === movie.id &&
                          movieProviderObj.providers.flatrate && (
                            <p>
                              {
                                movieProviderObj.providers.flatrate[0]
                                  .provider_name
                              }
                            </p>
                          )}
                      </div>
                    );
                  })}
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
