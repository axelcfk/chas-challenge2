"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSearch } from "../context/SearchContext";
import { useHandleQuerySubmit } from "../hooks/useHandleQuerySubmit";
import { TbEdit } from "react-icons/tb";
import { host } from "../utils";
import axios from "axios";

import { postMovieProvidersToDatabase, postMovieToDatabase } from "../utils";
import AutoQuery from "./autoQuery";
import InputField from "./inputField";
import FetchedMovies from "./FetchedMovies";
import ProtectedRoute from "../components/ProtectedRoute";
import { SlArrowLeft } from "react-icons/sl";

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
    { name: "Max", logo: "/logo.svg" },
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
  const {
    input,
    setInput,
    movies,
    loading,
    showVideo,
    errorMessage,
    resetState,
    explanation,
  } = useSearch();
  const [movieDetails, setMovieDetails] = useState([]);
  const [movieCredits, setMovieCredits] = useState({});
  const { handleQuerySubmit, videoRef } = useHandleQuerySubmit();

  // const [movies, setMovies] = useState([]);
  // const [loading, setLoading] = useState(false);
  // const [noResult, setNoResult] = useState(false);
  // const [showVideo, setShowVideo] = useState(true);

  // const [errorMessage, setErrorMessage] = useState("");

  const movieAPI_KEY = "4e3dec59ad00fa8b9d1f457e55f8d473";
  // const videoRef = useRef(null);
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
    if (
      pathname === "/startpage" ||
      pathname === "/about" ||
      pathname === "/profile"
    ) {
      resetState();
    }
  }, [pathname]);

  // useEffect(() => {
  //   console.log("Initial sessionstorage:", sessionStorage);
  // }, []);

  const handleNavigation = () => {
    router.back();
  };

  const clearSuggestionsAndQueries = async () => {
    try {
      await fetch(`${host}/api/clearSuggestionsAndQueries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      console.log("Suggestions and queries cleared.");
    } catch (error) {
      console.error("Error clearing suggestions and queries:", error);
    }
  };

  const handleReset = () => {
    resetState();
    //clearSuggestionsAndQueries();
    resetLatestQueryAndSuggestions();
  };

  const [currentText, setCurrentText] = useState("Hello I'm LUDI!");
  const [animationPhase, setAnimationPhase] = useState("erasing");
  const [currentPhrase, setCurrentPhrase] = useState(0);
  useEffect(() => {
    let timer;

    const phrases = [
      "I'm your personal movie matcher",
      `What do you want to watch today?`,
    ];

    if (animationPhase === "erasing") {
      if (currentText.length > 0) {
        timer = setTimeout(() => {
          setCurrentText((prev) => prev.substring(0, prev.length - 1));
        }, 5); // hastighet
      } else {
        setAnimationPhase("writing");
        setCurrentPhrase((prev) => (prev === 0 ? 1 : 0)); // Toggle between phrases
      }
    } else if (animationPhase === "writing") {
      if (currentText !== phrases[currentPhrase]) {
        timer = setTimeout(() => {
          setCurrentText((prev) =>
            phrases[currentPhrase].substring(0, prev.length + 1)
          );
        }, 5); // hastighet
      } else {
        timer = setTimeout(() => {
          setAnimationPhase("erasing");
        }, 7000); //vänta 7 sek innan radera
      }
    }

    return () => clearTimeout(timer);
  }, [currentText, animationPhase, currentPhrase]);

  async function resetLatestQueryAndSuggestions() {
    try {
      //const token = localStorage.getItem("token");

      const response = await fetch(
        `${host}/api/resetlatestuserqueryandsuggestions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // token: token,
          }),
        }
      );

      const data = await response.json();

      if (data.message) {
        console.log(data.message);
      } else {
        console.log(
          "failed receiving data.message from /resetlatestuserqueryandsuggestions endpoint"
        );
      }
    } catch (error) {
      console.error("Failed to reset latest user query and suggestions", error);
    }
  }

 /*  <ProtectedRoute>
    </ProtectedRoute>

 */

  return (
      <div className="bg-black flex flex-col justify-center items-center md:items-start px-8 md:px-20 text-slate-100 z-0  pb-5 ">
        <button
          className="bg-transparent border-none absolute top-0 left-0 m-8 px-4 my-20 z-40 text-slate-100 text-xl hover:cursor-pointer"
          onClick={handleNavigation}
        >
          <SlArrowLeft />
        </button>
        {/* <Navbar /> */}
        {errorMessage && !loading && (
          <div className="h-full flex justify-center items-center pt-40">
            <p className="text-3xl font-semibold text-center">{errorMessage}</p>
          </div>
        )}
        {showVideo && movies.length < 2 && (
          <div
            className={`md:w-full flex flex-col justify-center items-center`}
          >
            <div className=" h-96 flex justify-center items-center">
              <video
                className="md:w-1/3 w-96 transform rounded-full z-10"
                ref={videoRef}
                autoPlay
                loop
                muted
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                <source src="/ai-gif.mp4" type="video/mp4" />
                Your browser does not support the video.
              </video>
              <div className="video-gradient-overlay"></div>
            </div>
            {!loading ? (
              <p className="px-5 text-xl flex flex-col items-center h-24">
                <span className="absolute top-50 bottom-50 mb-4 text-3xl font-archivo px-8 font-extrabold text-center uppercase">
                  {currentText}
                </span>
              </p>
            ) : (
              <div className=" flex justify-center items-center">
                <p className="px-5 text-xl flex flex-col items-center h-24">
                  <span className="absolute top-50 bottom-50 mb-4 text-4xl font-archivo  font-extrabold text-center">
                    Finding the best <br />
                    match for you...
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {movies.length === 6 && (
          <div className=" ">
            <div className="mt-20">
              <div className="flex flex-col justify-end items-end">
                <button
                  onClick={handleReset}
                  className="pb-4  bg-transparent border-none hover:cursor-pointer"
                >
                  <TbEdit size={35} color="#CFFF5E" />
                </button>
              </div>
              <InputField
                setInput={setInput}
                input={input}
                handleQuerySubmit={handleQuerySubmit}
                handleInputChange={handleInputChange}
                placeholder={"Refine your search..."}
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
          <div className="pt-20  fixed bottom-8 left-10 right-10">
            <div className="  ">
              <AutoQuery input={input} setInput={setInput} />
            </div>
            <div className=" ">
              <InputField
                setInput={setInput}
                input={input}
                handleQuerySubmit={handleQuerySubmit}
                handleInputChange={handleInputChange}
                placeholder={"Search with LUDI..."}
                heightDiv={"h-14"}
              />
            </div>
          </div>
        ) : null}
      </div>
  );
}
