"use client";

import { useRouter } from "next/navigation";

import { useState, useEffect, useRef } from "react";
import { postMovieToDatabase } from "../utils";

import AutoQuery from "./autoQuery";
import InputField from "./inputField";
import FetchedMovies from "./FetchedMovies";
// import BackButton from "../components/BackButton";

const streamingServiceLinks = {
  Netflix: "https://www.netflix.com/se", //funkar
  HBOMax: "https://www.hbo.com/se",
  Viaplay: "https://www.viaplay.com/se", //funkar
  "Amazon Prime Video": "https://www.primevideo.com/", //funkar
  "Disney+": "https://www.disneyplus.com/se",
  Hulu: "https://www.hulu.com/se/watch/",
  "Apple TV+": "https://www.apple.com/se/tv/",
  Paramount: "https://www.paramount.com/se",
  Mubi: "https://www.mubi.com/se/movie/",
};

//TODO: Byt ut Mubi till Tele2 play istället

// Kolla om filmen är tillgänglig på en av de streaming-tjänsterna vi "stödjer" på vår sida
// (annars ersätter "not available" t.ex. Hoopla, Cinemax, Showtime Apple TV, FXNow, fuboTV, som vi
// inte känner till)
const isAvailableOnSupportedServices = (streaming) => {
  const supportedServices = [
    "Netflix",
    "HBO Max",
    "Viaplay",
    "Amazon Prime",
    "Disney+",
    "Hulu",
    "Apple TV+",
    "Paramount",
    "Mubi",
  ];
  return streaming?.flatrate?.some((provider) =>
    supportedServices.includes(provider.provider_name)
  );
};

export default function ChatPage2() {
  const [input, setInput] = useState("");
  const [movieDetails, setMovieDetails] = useState([]);
  const [movieCredits, setMovieCredits] = useState({});
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noResult, setNoResult] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const movieAPI_KEY = "4e3dec59ad00fa8b9d1f457e55f8d473";
  const videoRef = useRef(null);

  const handleInputChange = (e) => setInput(e.target.value);

  const changeSpeed = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const router = useRouter();

  const handleNavigation = () => {
    // Navigate back to the previous page
    router.back();
  };
  

  const handleQuerySubmit = async () => {
    setLoading(true);
    setMovies([]);
    // setInput("");
    setShowVideo(true);
    changeSpeed(5);

    try {
      const response = await fetch("http://localhost:3010/moviesuggest2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });
      const data = await response.json();

      if (data.movieNames && data.movieNames.length > 0) {
        console.log("Received Movie Names:", data.movieNames);
        // Delay setting movies and hiding video
        setTimeout(() => {
          setMovies(data.movieNames); // Now set movies here to trigger details fetching after the delay
          setLoading(false); // Also set loading false here to ensure it happens after the video hides
          setErrorMessage("");
          setShowVideo(false); // Hide video after 10 seconds
        }, 3000);
      } else {
        setErrorMessage(data.suggestion);
        console.log("Error Message Set:", data.suggestion);
        setNoResult(true);
        setLoading(false);
        setShowVideo(false);
      }
    } catch (error) {
      console.error("Failed to fetch AI suggestion:", error);
      setNoResult(true);
      setLoading(false);
      setShowVideo(false);
      changeSpeed(1);
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
                streaming: streamingData.SE, // Hämtar providers utifrån SE region
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
      return data.results;
    } catch (error) {
      console.error("Error fetching streaming services:", error);
      return {};
    }
  }

  useEffect(() => {
    //setLoading(true);

    const fetchMovieDetails = async () => {
      if (movieDetails.idFromAPI) {
        console.log("Fetching movie details for ID:", movieDetails.idFromAPI);
        try {
          // TODO: kolla först om filmen redan finns i våran databas, annars fetcha ifrån APIt OCH spara film till våran databas

          const url = `https://api.themoviedb.org/3/movie/${movieDetails.idFromAPI}?api_key=${movieAPI_KEY}`;
          const response = await fetch(url);
          const data = await response.json();
          console.log("fetched movie details data: ", data);
          console.log(data.vote_average);

          await postMovieToDatabase(data);

          /* if (!responseBackend.ok) {
              throw new Error("Failed to fetch 'addmovietodatabase' POST");
            } */

          if (data.title) {
            // Check if data includes title
            setMovieDetails({
              ...movieDetails,
              titleFromAPI: data.title, // om vi inte redan gjort detta via ChatGpts response
              overview: data.overview,
              voteAverage: data.vote_average,
              release: data.release_date,
              tagline: data.tagline,
              runtime: data.runtime,
              backdrop: `https://image.tmdb.org/t/p/w500${data.backdrop_path}`,
              poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
            });

            // setMovieDetailsFetched(true); // Mark that movie details have been fetched
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
  return (
    <div className=" flex  flex-col justify-center items-center md:items-start px-5 md:px-20 h-screen  text-slate-100 z-0 py-12">
      <button onClick={handleNavigation}>Go Back</button>

      {/* <BackButton /> */}
      {errorMessage && !loading && (
        <div className=" bg-yellow-500 h-full flex justify-center items-center ">
          <p className="text-3xl font-semibold text-center">{errorMessage}</p>
        </div>
      )}

      {showVideo && movies.length < 2 && (
        <div
          className={` md:w-full flex flex-col justify-center items-center h-full ${
            loading ? "-mt-48" : ""
          } `}
        >
          <div className=" h-96 flex justify-center items-center ">
            <video
              className="md:w-1/3 w-2/3 transform scale- "
              ref={videoRef}
              autoPlay
              loop
              muted
            >
              <source src="/ai-gif.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          {!loading ? (
            <p className="px-5 text-xl flex flex-col items-center  h-40 ">
              {" "}
              <span className="mb-4 text-2xl font-semibold text-center">
                I'm your AI movie matcher
              </span>{" "}
              <span className="font-light text-center">
                I give you the best movie suggestions based on your mood, vibe
                or
              </span>{" "}
            </p>
          ) : (
            <p className="px-5 text-xl flex flex-col items-center  h-40 ">
              {" "}
              <span className="mb-4 text-2xl font-semibold text-center">
                Finding the best match for you...
              </span>
            </p>
          )}
        </div>
      )}

      {movies.length === 6 && (
        <div className=" h-full w-full ">
          <div className="sticky inset-x-0 top-4 w-full">
            <InputField
              input={input}
              handleQuerySubmit={handleQuerySubmit}
              handleInputChange={handleInputChange}
              placeholder={"Try your luck again..."}
            />
          </div>
          <FetchedMovies
            credits={movieCredits}
            movieDetails={movieDetails}
            isAvailableOnSupportedServices={isAvailableOnSupportedServices}
            streamingServiceLinks={streamingServiceLinks}
          />
        </div>
      )}

      {!loading && movies < 2 ? (
        <>
          <AutoQuery input={input} setInput={setInput} />
          <div className="sticky inset-x-0 bottom-8 w-full">
            <InputField
              input={input}
              handleQuerySubmit={handleQuerySubmit}
              handleInputChange={handleInputChange}
              placeholder={"What's your vibe today?"}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

{
  /* <MovieCard
                    key={movie.id}
                    movie={movie}
                    credits={movieCredits}
                    movieDetails={movieDetails}
                  /> */
}
