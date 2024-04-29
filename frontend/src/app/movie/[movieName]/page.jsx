"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function moviePage() {
  const [movieDetails, setMovieDetails] = useState({});
  const [loading, setLoading] = useState(true); // Add loading state
  const movieAPI_KEY = "4e3dec59ad00fa8b9d1f457e55f8d473";

  const router = useRouter();

  // Ensure router is ready before trying to access query parameters
  useEffect(() => {
    if (!router.isReady) return;

    const { movieName } = router.query;

    if (movieAPI_KEY && movieName) {
      // Fetch movie ID from the API
      fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
          movieName
        )}&api_key=${movieAPI_KEY}`
      )
        .then((response) => response.json())
        .then((data) => {
          const movieId = data.results[0]?.id;
          if (movieId) {
            // Fetch movie details using the ID
            fetchMovieDetails(movieId);
          } else {
            console.error("No movie found with the given name");
            setLoading(false);
          }
        })
        .catch((error) => {
          console.error("Error fetching movie:", error);
          setLoading(false);
        });
    }
  }, [router.isReady, router.query, movieAPI_KEY]);

  const fetchMovieDetails = async (movieId) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${movieAPI_KEY}`
      );
      const data = await response.json();
      if (data.title) {
        setMovieDetails({
          title: data.title,
          overview: data.overview,
          voteAverage: data.vote_average,
          release: data.release_date,
          tagline: data.tagline,
          runtime: data.runtime,
          backdrop: `https://image.tmdb.org/t/p/w500${data.backdrop_path}`,
          poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
        });
      } else {
        console.error("No movie found with the given ID");
      }
    } catch (error) {
      console.error("Error fetching movie details:", error);
    } finally {
      setLoading(false);
    }
  };

  console.log("rätt sida");

  return (
    <div>
      {loading ? (
        <div>Loading...</div> // Render a loading indicator while fetching data
      ) : (
        <>
          <h1>{movieDetails.title}</h1>
          <div>hejhej</div>
        </>
      )}
    </div>
  );
}

//1.fetch the movie id from tmdb: `https://api.themoviedb.org/3/search/movie?query=${encodedMovieTitle}&api_key=${movieAPI_KEY}`
//2. fetch the movie details using that id: `https://api.themoviedb.org/3/movie/${movieDetails.idFromAPI}?api_key=${movieAPI_KEY}`;
//3. store the
