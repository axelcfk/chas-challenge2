"use client";

// Almost same code as the populer movies, enhanced to fetch top-rated and populer genre
// and mix them randomly

import { useState, useEffect } from "react";
import { postAddToLikeList } from "../utils";
import { postRemoveFromLikeList } from "../utils";
import { FaCheckCircle } from "react-icons/fa";

export default function MovieSelection() {
  const [movies, setMovies] = useState([]);
  const [selectedMovies, setSelectedMovies] = useState(new Set());
  const [moreOptions, setMoreOptions] = useState(9);
  const [movieClicked, setMovieClicked] = useState(false);

  const apiKey = "71a2109e9f6fadaf14036ae6c29ac5b7";

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const popularUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`;
        const popularResponse = await fetch(popularUrl);
        if (!popularResponse.ok) {
          throw new Error("Failed to fetch popular movies");
        }
        const popularData = await popularResponse.json();

        const topRatedUrl = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}`;
        const topRatedResponse = await fetch(topRatedUrl);
        if (!topRatedResponse.ok) {
          throw new Error("Failed to fetch top-rated movies");
        }
        const topRatedData = await topRatedResponse.json();

        // Combination for the blended result
        const allMovies = [...popularData.results, ...topRatedData.results];

        const shuffledMovies = shuffleArray(allMovies);

        setMovies(shuffledMovies);
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      }
    };

    fetchMovies();
  }, [apiKey]);

  // Function to shuffle an array
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleMovieClick = (movie) => {
    setSelectedMovies((prev) => {
      const newSelectedMovies = new Set(prev);
      if (newSelectedMovies.has(movie.id)) {
        newSelectedMovies.delete(movie.id);
      } else {
        newSelectedMovies.add(movie.id);
      }
      return newSelectedMovies;
    });
  };

  const handleLoadMore = () => {
    setMoreOptions((prevCount) => prevCount + 9);
  };

  return (
    <div className="bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-4">
        Popular and Top Rated Movies
      </h1>
      <div className="grid grid-cols-3 gap-4">
        {movies.slice(0, moreOptions).map((movie) => (
          <div key={movie.id} className="rounded-lg shadow-lg overflow-hidden">
            {!selectedMovies.has(movie.id) ? (
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-auto cursor-pointer"
                onClick={() => (
                  handleMovieClick(movie), postAddToLikeList(movie.id, "movie")
                )}
              />
            ) : (
              <div className="overlay">
                <FaCheckCircle
                  className="text-green-500"
                  style={{
                    fontSize: "40px",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 10,
                  }}
                />
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-auto cursor-pointer"
                  onClick={() => {
                    handleMovieClick(movie);
                    postRemoveFromLikeList(movie.id, "movie");
                  }}
                />
              </div>
            )}
            {/* {selectedMovie === movie.id && (
              <div className="p-4">
                <h3 className="text-lg font-semibold">{movie.title}</h3>
                <p className="text-sm">{movie.overview}</p>
                <p className="text-gray-600">
                  Release Date: {movie.release_date}
                </p>
                <p className="text-gray-600">Rating: {movie.vote_average}/10</p>
              </div>
            )} */}
          </div>
        ))}
      </div>

      {moreOptions < movies.length && (
        <button
          className="text-sm py-2 px-4 bg-gray-200 rounded-full my-4 hover:bg-gray-300 transition-colors mx-auto"
          onClick={handleLoadMore}
        >
          More options
        </button>
      )}

      <button className="bg-black text-white rounded-full py-3 px-6 my-2 hover:bg-gray-800 transition-colors mx-auto">
        Go Further
      </button>
    </div>
  );
}
