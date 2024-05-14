"use client";

import { useState, useEffect } from "react";
import { postMovieToDatabase } from "../utils";

export default function MovieSelection() {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [moreOptions, setMoreOptions] = useState(9);

  const apiKey = "71a2109e9f6fadaf14036ae6c29ac5b7";
  useEffect(() => {
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`;

    const fetchMovies = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch movies");
        }
        const data = await response.json();

        // store all fetched movies in database (unless they have been fetched before)
        data.results.forEach(async (movieObject) => {
          await postMovieToDatabase(movieObject);
        });

        // Shuffles 20 movies
        const firstThreeMovies = data.results.slice(0, 20);
        for (let i = 0; i < 20; i++) {
          const randomIndex = Math.floor(Math.random() * 20);
          [firstThreeMovies[i], firstThreeMovies[randomIndex]] = [
            firstThreeMovies[randomIndex],
            firstThreeMovies[i],
          ];
        }

        // there are only 20 movies in the populer movies api, 9 of which are being shuffled
        const shuffledMovies = [...firstThreeMovies, ...data.results.slice(9)];
        setMovies(shuffledMovies);
      } catch (error) {
        console.error("Failed to render ", error);
      }
    };

    fetchMovies();
  }, []);

  const handleMovieClick = (movie) => {
    setSelectedMovie(selectedMovie === movie.id ? null : movie.id);
  };

  const handleLoadMore = () => {
    setMoreOptions((prevCount) => prevCount + 9);
  };

  return (
    <div className="bg-gray-100 p-4 w-full ">
      <h1 className="text-2xl font-bold text-center mb-4">Populer Movies</h1>
      <div className="grid grid-cols-3 gap-4">
        {movies.slice(0, moreOptions).map((movie) => (
          <div key={movie.id} className="rounded-lg shadow-lg overflow-hidden">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full h-auto cursor-pointer"
              onClick={() => handleMovieClick(movie)}
            />
            {selectedMovie === movie.id && (
              <div className="p-4">
                <h3 className="text-lg font-semibold">{movie.title}</h3>
                <p className="text-sm">{movie.overview}</p>
                <p className="text-gray-600">
                  Release Date: {movie.release_date}
                </p>
                <p className="text-gray-600">Rating: {movie.vote_average}/10</p>
              </div>
            )}
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
