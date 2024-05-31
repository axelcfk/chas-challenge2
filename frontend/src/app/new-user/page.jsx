"use client";

// Almost same code as the populer movies, enhanced to fetch top-rated and populer genre
// and mix them randomly

import { useState, useEffect } from "react";
import { postAddToLikeList } from "../utils";
import { postRemoveFromLikeList } from "../utils";
import { FaCheckCircle, FaArrowRight, FaHeart } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import { postMovieToDatabase } from "../utils";

export default function MovieSelection() {
  const [movies, setMovies] = useState([]);
  const [selectedMovies, setSelectedMovies] = useState(new Set());
  // const [moreOptions, setMoreOptions] = useState(9);
  const [currentStartIndex, setCurrentStartIndex] = useState(0);

  const apiKey = "71a2109e9f6fadaf14036ae6c29ac5b7";
  const router = useRouter();

  const [fromMixPage, setFromMixPage] = useState(false); // Initialize state for the parameter

  const searchParams = useSearchParams();

  const isFromMixPage = searchParams.get("isFromMixPage");

  //const { isFromMixPage } = router.query;

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

        // store all fetched movies in database (unless they have been fetched before)
        allMovies.forEach(async (movieObject) => {
          await postMovieToDatabase(movieObject);
        });

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
    const nextStartIndex = currentStartIndex + 9;
    if (nextStartIndex >= movies.length) {
      setCurrentStartIndex(0); // Optionally loop back to start or disable button
    } else {
      setCurrentStartIndex(nextStartIndex);
    }
  };

  console.log("isFromMixPage:", fromMixPage);

  return (
    <div className="flex flex-col justify-evenly p-4 bg-black text-slate-50 h-min-screen w-min-screen pt-20">
      <h1 className="text-3xl font-archivo font-extrabold text-center pb-8  pt-4 flex flex-col  ">
        <span className="">
          Click to like movies for better recommendations!
        </span>
      </h1>
      <div className="grid grid-cols-3 gap-4">
        {movies.slice(currentStartIndex, currentStartIndex + 9).map((movie) => (
          <div
            key={movie.id}
            className="rounded-lg  shadow-lg overflow-hidden"
            style={{ border: "1px solid grey" }}
          >
            {!selectedMovies.has(movie.id) ? (
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-auto cursor-pointer"
                onClick={() => {
                  handleMovieClick(movie);
                  postAddToLikeList(movie.id, "movie", movie.title);
                }}
              />
            ) : (
              <div className="overlay">
                <FaHeart
                  //className="text-green-500"
                  className="text-[#EA3546]"
                  style={{
                    fontSize: "40px",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 40,
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
          </div>
        ))}
      </div>
      <div className="w-full flex justify-center items-center pt-5 gap-8 ">
        {movies.length > currentStartIndex + 9 && (
          <button
            className="font-extrabold font-archivo bg-[#CFFF5E] flex justify-center items-center text-slate-950 rounded-full py-3 px-6 transition-all mx-auto"
            onClick={handleLoadMore}
            style={{ border: "1px solid grey" }}
          >
            <span className="px-2 text-xl">More options</span>{" "}
          </button>
        )}
        {isFromMixPage ? (
          <button
            className="font-archivo bg-transparent flex justify-centerbg-transparent text-slate-200 border-2 border-solid box-border border-[#CFFF5E] items-center  rounded-full py-3 px-6 transition-all mx-auto"
            onClick={() => router.push("/mymixes2/Weekly")}
          >
            <span className="px-2 text-xl">Back to Mix Page</span>{" "}
            <FaArrowRight />
          </button>
        ) : (
          <button
            className="bg-transparent flex justify-centerbg-transparent text-slate-200 border-2 border-solid box-border border-[#CFFF5E] items-center  rounded-full py-3 px-6 transition-all mx-auto"
            onClick={() => router.push("/startpage")}
          >
            <span className="px-2 text-xl">Done</span> <FaArrowRight />
          </button>
        )}
      </div>
    </div>
  );
}
