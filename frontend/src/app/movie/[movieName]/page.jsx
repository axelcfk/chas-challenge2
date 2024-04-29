"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function moviePage() {
  const [movieDetails, setMovieDetails] = useState("");
  // const [loading, setLoading] = useState(true);
  const movieAPI_KEY = "4e3dec59ad00fa8b9d1f457e55f8d473";

  const router = useRouter();
  const movieName = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    const movieName = router.query;
    console.log("the moviename is:", movieName);
    if (movieName) {
      fetchData(movieName);
    } else {
      console.log("Movie name is not available");
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    async function fetchData(movieName) {
      console.log("Fetching data for:", movieName);
      // setLoading(true);
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/search/movie?query=${movieName}&api_key=${movieAPI_KEY}`
        );
        const data = await response.json();
        if (data.results.length > 0) {
          const movieId = data.results[0].id;
          console.log("ID är:", movieId);
          await fetchMovieDetails(movieId);
        } else {
          console.log("No movies found for:", movieName);
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        // setLoading(false);
      }
    }

    fetchData();
  }, [router.isReady, router.query, movieAPI_KEY]);

  const fetchMovieDetails = async (movieId) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${movieAPI_KEY}`
      );
      const data = await response.json();
      console.log("Movie details:", data);
      console.log("innan set,", movieDetails);
      setMovieDetails([data]);
      console.log("efter set,", movieDetails);
    } catch (error) {
      console.error("Error fetching movie details:", error);
    } finally {
      // setLoading(false);
    }
  };

  console.log("rätt sida");
  console.log("Movie details:", movieDetails);

  return (
    <div>
      {/* {loading ? (
        <div>Loading...</div>
      ) : ( */}
      <>
        <h1 className="text-4xl mb-20">
          {" "}
          movieName is: {movieDetails[0]?.title}
        </h1>
        <p>{movieDetails[0]?.overview}</p>
        <div className="mt-20">Rätt sida </div>
      </>
      {/* )} */}
    </div>
  );
}
