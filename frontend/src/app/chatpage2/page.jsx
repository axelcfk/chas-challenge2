"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSearch } from "../context/SearchContext";
import { useHandleQuerySubmit } from "../hooks/useHandleQuerySubmit";

import { postMovieProvidersToDatabase, postMovieToDatabase } from "../utils";
import AutoQuery from "./autoQuery";
import InputField from "./inputField";
import FetchedMovies from "./FetchedMovies";
import ProtectedRoute from "../components/ProtectedRoute";

const streamingServiceLinks = {
  Netflix: "https://www.netflix.com/se",
  HBOMax: "https://www.hbo.com/se",
  Viaplay: "https://www.viaplay.com/se",
  "Amazon Prime Video": "https://www.primevideo.com/",
  "Disney+": "https://www.disneyplus.com/se",
};

const isAvailableOnSupportedServices = (streaming) => {
  const supportedServices = [
    { name: "Netflix", logo: "/netflix.svg" },
    { name: "HBO Max", logo: "/logo.svg" },
    { name: "Viaplay", logo: "/viaplay.png" },
    { name: "Amazon Prime", logo: "prime.svg" },
    { name: "Disney+", logo: "/disney.png" },
    { name: "Tele2Play", logo: "/tele2play.png" },
  ];
  return streaming?.flatrate?.some((provider) =>
    supportedServices
      .map((service) => service.name)
      .includes(provider.provider_name)
  );
};

export default function ChatPage2() {
  const { input, setInput, movies, loading, showVideo, errorMessage } =
    useSearch();
  // const [input, setInput] = useState("");
  const [movieDetails, setMovieDetails] = useState([]);
  const [movieCredits, setMovieCredits] = useState({});
  const { handleQuerySubmit } = useHandleQuerySubmit();

  // const [movies, setMovies] = useState([]);
  // const [loading, setLoading] = useState(false);
  // const [noResult, setNoResult] = useState(false);
  // const [showVideo, setShowVideo] = useState(true);

  // const [errorMessage, setErrorMessage] = useState("");

  const movieAPI_KEY = "4e3dec59ad00fa8b9d1f457e55f8d473";
  const videoRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  const handleInputChange = (e) => setInput(e.target.value);

  const changeSpeed = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  useEffect(() => {
    async function fetchAllMovieDetails() {
      const allMovieDetails = await Promise.all(
        movies.map(async (title) => {
          try {
            const encodedTitle = encodeURIComponent(title);
            const response = await fetch(
              `https://api.themoviedb.org/3/search/movie?query=${encodedTitle}&api_key=${movieAPI_KEY}`
            );
            const data = await response.json();
            if (data.results.length > 0) {
              const movieId = data.results[0].id;
              const detailsResponse = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}?api_key=${movieAPI_KEY}`
              );
              const detailsData = await detailsResponse.json();
              const streamingData = await fetchStreamingServices(movieId);
              await postMovieToDatabase(detailsData);
              const posterPath = detailsData.poster_path;
              const posterUrl = posterPath
                ? `https://image.tmdb.org/t/p/w500${posterPath}`
                : null;
              return {
                title: detailsData.title,
                id: movieId,
                poster: posterUrl,
                overview: detailsData.overview,
                voteAverage: detailsData.vote_average,
                streaming: streamingData.SE,
              };
            }
          } catch (error) {
            console.error(`Error fetching details for ${title}:`, error);
          }
        })
      );
      setMovieDetails(allMovieDetails.filter((detail) => detail !== undefined));
    }

    if (movies.length > 0) fetchAllMovieDetails();
  }, [movies]);

  async function fetchStreamingServices(movieId) {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${movieAPI_KEY}`
      );
      const data = await response.json();
      //await postMovieProvidersToDatabase(data); // backend hänger sig

      return data.results;
    } catch (error) {
      console.error("Error fetching streaming services:", error);
      return {};
    }
  }

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (movieDetails.idFromAPI) {
        try {
          const url = `https://api.themoviedb.org/3/movie/${movieDetails.idFromAPI}?api_key=${movieAPI_KEY}`;
          const response = await fetch(url);
          const data = await response.json();
          await postMovieToDatabase(data);

          if (data.title) {
            setMovieDetails({
              ...movieDetails,
              titleFromAPI: data.title,
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
        }
      }
    };

    fetchMovieDetails();
  }, [movieDetails.idFromAPI]);

  useEffect(() => {
    if (pathname === "/startpage") {
      localStorage.removeItem("latestSearch");
    }
  }, [pathname]);

  useEffect(() => {
    console.log("Initial localStorage:", localStorage);
  }, []);

  
  return (
    <ProtectedRoute>
      <div className="flex flex-col justify-center items-center md:items-start px-8 md:px-20 text-slate-100 z-0 pb-5 min-h-full">
        {errorMessage && !loading && (
          <div className="h-full flex justify-center items-center">
            <p className="text-3xl font-semibold text-center">{errorMessage}</p>
          </div>
        )}
        {showVideo && movies.length < 2 && (
          <div
            className={`md:w-full flex flex-col justify-center items-center`}
          >
            <div className="relative h-96 flex justify-center items-center">
              <video
                className="md:w-1/3 w-2/3 transform rounded-full z-10"
                ref={videoRef}
                autoPlay
                loop
                muted
              >
                <source src="/ai-gif.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="video-gradient-overlay"></div>
            </div>
            {!loading ? (
              <p className="px-5 text-xl flex flex-col items-center h-24">
                <span className="mb-4 text-2xl font-semibold text-center">
                  I'm your AI movie matcher
                </span>
              </p>
            ) : (
              <div className=" flex justify-center items-center">
                <p className="px-5 text-xl flex flex-col items-center h-24">
                  <span className="mb-4 text-2xl font-semibold text-center">
                    Finding the best match for you...
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {movies.length === 6 && (
          <div className="h-full w-full">
            <div className=" inset-x-0 top-4 w-full z-10 absolute">
              <InputField
                input={input}
                handleQuerySubmit={handleQuerySubmit}
                handleInputChange={handleInputChange}
                placeholder={"Try your luck again..."}
              />
            </div>
            <div className="z-0">
              <FetchedMovies
                credits={movieCredits}
                movieDetails={movieDetails}
                isAvailableOnSupportedServices={isAvailableOnSupportedServices}
                streamingServiceLinks={streamingServiceLinks}
              />
            </div>
          </div>
        )}

        {!loading && movies.length < 2 ? (
          <div className="">
            <div className="absolute inset-x-0 bottom-24 w-full">
              <AutoQuery input={input} setInput={setInput} />
            </div>
            <div className=" absolute inset-x-0 bottom-8 w-full">
              <InputField
                input={input}
                handleQuerySubmit={handleQuerySubmit}
                handleInputChange={handleInputChange}
                placeholder={"What's your vibe today?"}
              />
            </div>
          </div>
        ) : null}
      </div>
    </ProtectedRoute>
  );
}
