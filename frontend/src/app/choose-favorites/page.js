"use client";

import { SlideMenuMovieCard } from "../components/SlideMenu";
import { useState, useEffect } from "react";
import { fetchTMDBMovieDetails, host } from "@/app/utils";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

export default function ChooseFavorites() {
  const [seenMovies, setSeenMovies] = useState([]);
  const [selectedFavorites, setSelectedFavorites] = useState([]);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchSeenMovies = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const response = await fetch(
          `${host}:3010/api/seen/${userId}`
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

    const fetchFavorites = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const response = await fetch(
          `${host}:3010/favorites/${userId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP status ${response.status}`);
        }
        const data = await response.json();
        setSelectedFavorites(data.map((favorite) => favorite.movie_id));
      } catch (error) {
        console.error("Failed to fetch favorites", error);
      }
    };

    fetchSeenMovies();
    fetchFavorites();
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
    console.log(
      `Saving favorites for user: ${userId} with selected movies:`,
      selectedFavorites
    );

    // Rensa/uppdatera nuvarande favoriter
    try {
      const response = await fetch(
        `${host}:3010/favorites/${userId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to clear current favorites", error);
    }

    // Spara dom nya favoriterna
    for (let movieId of selectedFavorites) {
      try {
        const response = await fetch(`${host}:3010/favorites`, {
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
    router.push(`/profile/${user.id}`);
  };

 /*  <ProtectedRoute>
    </ProtectedRoute>
 */

  return (
      <main className="mt-24">
        <h1>Pick 4 Favorite Movies</h1>
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
              className={
                selectedFavorites.includes(movie.movie_id) ? "selected" : ""
              }
              disableLink={true} // Disable link for ChooseFavorites
            />
          ))}
        </div>

        <button onClick={saveFavorites}>Save Favorites</button>
      </main>
  );
}
