"use client";

import { SlideMenuMovieCard } from "../components/SlideMenu";
import { useState, useEffect } from "react";
import { fetchTMDBMovieDetails } from "@/app/utils"; // Justera vägen till din utils-fil om nödvändigt

export default function ChooseFavorites() {
  const [seenMovies, setSeenMovies] = useState([]);
  const [selectedFavorites, setSelectedFavorites] = useState([]);

  useEffect(() => {
    const fetchSeenMovies = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const response = await fetch(
          `http://localhost:3010/api/seen/${userId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP status ${response.status}`);
        }
        const data = await response.json();

        const moviesWithDetails = await Promise.all(
          data.map(async (movie) => {
            const movieDetails = await fetchTMDBMovieDetails(movie.movie_id);
            return {
              ...movie,
              title: movieDetails.title,
              poster: `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`,
              overview: movieDetails.overview,
            };
          })
        );

        setSeenMovies(moviesWithDetails);
      } catch (error) {
        console.error("Failed to fetch movies", error);
      }
    };

    fetchSeenMovies();
  }, []);

  const toggleFavorite = (movieId) => {
    if (selectedFavorites.includes(movieId)) {
      setSelectedFavorites(selectedFavorites.filter((id) => id !== movieId));
    } else if (selectedFavorites.length < 4) {
      setSelectedFavorites([...selectedFavorites, movieId]);
    }
  };

  const saveFavorites = async () => {
    const userId = localStorage.getItem("userId");
    console.log(`Saving favorites for user: ${userId} with selected movies:`, selectedFavorites);
    for (let movieId of selectedFavorites) {
      try {
        const response = await fetch("http://localhost:3010/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId, movie_id: movieId }),
        });
        if (!response.ok) {
          throw new Error(`HTTP status ${response.status}`);
        }
      } catch (error) {
        console.error("Failed to add favorite", error);
      }
    }
  };

  return (
    <main className="mt-24">
      <h1>Pick 3 Favorite Movies</h1>
      <div className="movie-list">
        {seenMovies.map((movie) => (
          <SlideMenuMovieCard
            key={movie.id}
            id={movie.id}
            movieId={movie.movie_id} // Pass the actual movie_id
            title={movie.title}
            poster={movie.poster}
            overview={movie.overview}
            onClick={() => toggleFavorite(movie.movie_id)} // Use movie_id here
            className={selectedFavorites.includes(movie.movie_id) ? "selected" : ""}
            disableLink={true} // Disable link for ChooseFavorites
          />
        ))}
      </div>
      <button onClick={saveFavorites}>Save Favorites</button>
    </main>
  );
}
