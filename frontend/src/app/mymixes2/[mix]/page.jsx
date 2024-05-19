"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMovieObject, fetchWatchAndLikeList, host } from "../../utils";
import SlideMenu from "../../components/SlideMenu";
import { SlideMenuMovieCard } from "../../components/SlideMenu";
import { postMovieToDatabase } from "../../utils";
import { MovieCardMix } from "./MovieCardMix";
import Navbar from "../../components/Navbar";
import { FaPlus } from "react-icons/fa";

export default function Mix() {
  const [mixFromDatabaseOnlyIDs, setMixFromDatabaseOnlyIDs] = useState([]);
  const [reasoningFromGPT, setReasoningFromGPT] = useState("");
  const movieAPI_KEY = "4e3dec59ad00fa8b9d1f457e55f8d473";
  const [messageNoStoredMix, setMessageNoStoredMix] = useState("");

  const params = useParams();
  const mixTitle = params.mix; // Get movie ID from the URL parameter

  const [userHasNoLikes, setUserHasNoLikes] = useState(true);
  const [messageNoLikedMovies, setMessageNoLikedMovies] = useState("");

  const [loading, setLoading] = useState(false);

  const [mixFromBackendObjects, setMixFromBackendObjects] = useState([]);
  const [mixFromBackendProvidersObjects, setMixFromBackendProvidersObjects] =
    useState([]);

  const [mixDetails, setMixDetails] = useState([]);

  const [showDetails, setShowDetails] = useState(false);

  // TODO: just nu om du klickar på generate daily mix igen så kommer movienamesfromgpt.length och movieIdsFromAPI.length vara annorlunda och därmed inte trigga andra useEffecten! Måste kanske deleta dailymixen på backend innan man klickar generate igen?

  const resetState = () => {
    setMixFromBackendObjects([]);
    setMixDetails([]);
    setShowDetails(false);
    setLoading(true);
    setMessageNoStoredMix("");
    setMessageNoLikedMovies("");
    // setChatGPTFetched(false);
  };

  // First time entering page or Refreshing page, check if we already have a dailymixbasedonlikes on backend

  useEffect(() => {
    setMixDetails([]);
    setMixFromBackendObjects([]);
    setMixFromBackendProvidersObjects([]);

    async function getStoredMix() {
      setLoading(true);
      try {
        const response = await fetch(`${host}/me/dailymixbasedonlikes`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          //body: JSON.stringify({ }),
        });
        const data = await response.json(); // ändra i server.js så att chatgpt bara returnerar movie name, och sen kan vi göra en query för TMDB ID (se första useEffecten i firstpage/page.js)
        if (data.mixMovieObjects && data.mixMovieObjectsProviders) {
          setMessageNoStoredMix("");

          setMixFromBackendObjects(data.mixMovieObjects);

          setMixFromBackendProvidersObjects(data.mixMovieObjectsProviders);

          //setReasoningFromGPT(data.reasoning)
        } else if (data.message) {
          setMessageNoStoredMix(data.message);
        } else {
          setLoading(false);
          console.error("Failed to fetch stored mix");
        }
      } catch (error) {
        console.error("Failed to fetch stored mix:", error);
      } finally {
        //setLoading(false)
        //setSuggestionFetchedFromGPT(true);
        //setMixIsFetched(true);
      }
    }
    getStoredMix();
  }, []);

  // populate mixDetails after mixFromBackendObjects has been populated by a stored mix or new generated mix
  useEffect(() => {
    const fetchDetails = async () => {
      const details = [];

      for (const movieObject of mixFromBackendObjects) {
        const watchAndLikeData = await fetchWatchAndLikeList();

        const isInWatchList = watchAndLikeData.movieWatchList.some((movie) => {
          return movie.movie_id === movieObject.id;
        });

        const isLiked = watchAndLikeData.likedMoviesList.some((movie) => {
          return movie.movie_id === movieObject.id;
        });

        const providersOfMovie = mixFromBackendProvidersObjects.find(
          (movieObjectProviders) => {
            return movieObjectProviders.id === movieObject.id;
          }
        );

        if (movieObject.title) {
          details.push({
            id: movieObject.id,
            title: movieObject.title,
            overview: movieObject.overview,
            voteAverage: movieObject.vote_average,
            release: movieObject.release_date,
            tagline: movieObject.tagline,
            runtime: movieObject.runtime,
            backdrop: `https://image.tmdb.org/t/p/w500${movieObject.backdrop_path}`,
            poster: `https://image.tmdb.org/t/p/w500${movieObject.poster_path}`,
            flatrate: providersOfMovie.flatrate,
            isLiked: isLiked,
            isInWatchList: isInWatchList,
          });
        }
      }

      setMixDetails(details);
      setLoading(false);
    };

    if (mixFromBackendObjects.length > 0) {
      fetchDetails();
    }
  }, [mixFromBackendObjects]);

  // --------------------- onClick generate new mix, will suggested movies and their movie objects from TMDB ---------------------

  const getGenerateDailyMixFromGPT = async () => {
    resetState();
    // setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${host}/generatedailymix2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token: token,
        }),
      });
      const data = await response.json(); // ändra i server.js så att chatgpt bara returnerar movie name, och sen kan vi göra en query för TMDB ID (se första useEffecten i firstpage/page.js)
      if (data.mixMovieObjects && data.mixMovieObjectsProviders) {
        setMixFromBackendObjects(data.mixMovieObjects);

        setMixFromBackendProvidersObjects(data.mixMovieObjectsProviders);

        // TODO: also have this endpoint make a list of the movie ids and a true/false if they are liked or not, and same for watchlisted. And then check the setMixDetails above (the utkommenterade delen)

        //setReasoningFromGPT(data.reasoning)
      } else if (data.messageNoLikedMovies) {
        setMessageNoLikedMovies(data.messageNoLikedMovies);
        setLoading(false);
        console.log("No movies liked yet");
      } else {
        setLoading(false);
        console.error("No suggestion in response");
      }
    } catch (error) {
      console.error("Failed to fetch AI suggestion:", error);
    } finally {
      //setLoading(false)
      //setSuggestionFetchedFromGPT(true);
      //setMixIsFetched(true);
    }
    // setLoading(false);
    //setLoading(false);
  };

  console.log("MixFromBackendObjects: ", mixFromBackendObjects);

  console.log("Daily mix based on likes: ", mixDetails);

  console.log("mixFromBackendProvidersObjects", mixFromBackendProvidersObjects);

  return (
    <div className="bg-[#29274C] h-screen p-8">
      {/* <Navbar></Navbar> */}
      
      <div className="h-full flex flex-col items-center pt-8">

      <div className="bg-[#110A19] rounded-3xl p-6 w-3/4 flex justify-between items-center">
  <div className="flex flex-col justify-center items-center">
    <h1 className="text-white font-light text-xl mb-2">{mixTitle} mix</h1>
    <button
      className="bg-slate-100 w-40 h-10 rounded-full font-semibold border-none mt-4 transition duration-300 ease-in-out hover:bg-slate-200 hover:cursor-pointer"
      onClick={getGenerateDailyMixFromGPT}
    >
      Generate with AI
    </button>
  </div>
  <img className="h-64 -mt-16 -mr-4 z-10" src="/image.png" alt="AI" />
</div>





        <div className="bg-[#110A19] rounded-3xl min-h-full pt-4 pb-8 pl-4 pr-8 border border-solid border-[#FF506C] border-l-0 border-r-0 border-b-0 mt-8 w-full">
          
        {/* TODO: save into a new list on backend, not postAddToMixOnBackend again, or use that function but save to a new list...! we still want to keep the other list after fetching so it stays when you reload the page!  */}
          {/* <div className="flex w-full justify-end items-center">
          
            <button className="text-white flex gap-2 box-border justify-center items-center text-center p-6 py-2 bg-inherit rounded-lg border-2 border-solid border-[#FF506C] hover:border-white">
              <FaPlus className="text-2xl text-white" /> Save List
            </button>
           
          </div> */}

          <div className="pt-8">
            {loading === false && messageNoStoredMix !== "" && (
              <div>
                <p>{messageNoStoredMix}</p>
              </div>
            )}

            {loading === false && messageNoLikedMovies !== "" && (
              <div>
                <p>{messageNoLikedMovies}</p>
              </div>
            )}


            {loading === true ? (
              <h2 className="text-white">
                AI Generating a mix based on your likes...
              </h2>
            ) : (
              <>
                {mixDetails && mixDetails.length > 0 ? (
                  <div className="flex w-full flex-col gap-8">
                    {mixDetails.map((movie, index) => (
                      <MovieCardMix
                        key={index}
                        id={movie.id}
                        title={movie.title}
                        poster={movie.poster}
                        overview={movie.overview}
                        voteAverage={movie.voteAverage}
                        streamingServices={movie.flatrate}
                        isInWatchList={movie.isInWatchList}
                        isLiked={movie.isLiked}
                      />
                    ))}
                  </div>
                ) : (
                  ""
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
