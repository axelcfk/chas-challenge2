"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

//const movieAPI_KEY = process.env.movieAPI_KEY;

export default function FirstPage() {
  const movieAPI_KEY = "4e3dec59ad00fa8b9d1f457e55f8d473"; // INSERT YOUR API KEY
  const movieName = "Fight Club";

  const [movieId, setMovieId] = useState("");

  useEffect(() => {
    if (movieAPI_KEY != null) {
      fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
          movieName
        )}&api_key=${movieAPI_KEY}`
      )
        .then((response) => response.json())
        .then((data) => {
          // Extract movie ID from the response

          setMovieId(data.results[0].id); // Assuming we want the first result
        })
        .catch((error) => console.error("Error fetching data:", error));
    }
  }, [movieAPI_KEY]);
  console.log("Movie ID:", movieId);

  useEffect(() => {
    if (movieId != "") {
      fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${movieAPI_KEY}`
      )
        .then((response) => response.json())
        .then((data) => {
          // Extract movie ID from the response
          const test = data; // Assuming we want the first result
          console.log("test:", test);
        })
        .catch((error) => console.error("Error fetching data:", error));
    }
  }, [movieId]);

  return (
    <div
      className="py-10 px-5 h-screen w-screen"
      style={{
        backgroundImage: "url('/front-img.jpg')",
        backgroundPosition: "bottom",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <h1 className="text-3xl font-semibold mb-14 text-center text-slate-100">
        LO <br />
        GO
      </h1>
      <div className="h-1/2 w-full flex justify-center"></div>
      <div>
        <button className="text-xl h-14 w-full bg-slate-100  rounded-full font-semibold mb-2 mt-16 text-slate-900 hover:bg-slate-200">
          <Link href="create-account">Create an account</Link>
        </button>
        <button
          style={{ border: "1px solid white" }}
          className="text-xl text-slate-100 h-14 w-full bg-transparent rounded-full font-semibold"
        >
          <Link href="login">Log in</Link>
        </button>
      </div>
    </div>
  );
}
