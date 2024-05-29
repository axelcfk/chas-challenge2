"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMovieObject, fetchWatchAndLikeList, host } from "../../utils";
import SlideMenu from "../../components/SlideMenu";
import { SlideMenuMovieCard } from "../../components/SlideMenu";
import { postMovieToDatabase } from "../../utils";
import { MovieCardMix } from "./MovieCardMix";
import Navbar from "../../components/Navbar";
import { FaArrowRight, FaPlus } from "react-icons/fa";
import Link from "next/link";

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

  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isGettingStoredMix, setIsGettingStoredMix] = useState(false);

  //const [disabledButton, setDisabledButton] = useState(false);

  // TODO: just nu om du klickar på generate daily mix igen så kommer movienamesfromgpt.length och movieIdsFromAPI.length vara annorlunda och därmed inte trigga andra useEffecten! Måste kanske deleta dailymixen på backend innan man klickar generate igen?

  const resetState = () => {
    //setIsAiGenerating(false);
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
    async function getStoredMix() {
      /* setMixDetails([]);
      setMixFromBackendObjects([]);
      setMixFromBackendProvidersObjects([]); */
      setLoading(true);
      try {
        setIsGettingStoredMix(true);
        const token = localStorage.getItem("token");

        const response = await fetch(`${host}/me/dailymixbasedonlikes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: token,
          }),
        });
        const data = await response.json(); // ändra i server.js så att chatgpt bara returnerar movie name, och sen kan vi göra en query för TMDB ID (se första useEffecten i firstpage/page.js)
        if (data.mixMovieObjects && data.mixMovieObjectsProviders) {
          setMessageNoStoredMix("");

          setMixFromBackendObjects(data.mixMovieObjects);

          setMixFromBackendProvidersObjects(data.mixMovieObjectsProviders);

          //setReasoningFromGPT(data.reasoning)
        } else if (data.message) {
          setMessageNoStoredMix(data.message);
          setLoading(false);
        } else {
          setLoading(false);
          console.error("Failed to fetch stored mix");
        }
      } catch (error) {
        console.error("Failed to fetch stored mix:", error);
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
      setIsGettingStoredMix(false);
      setIsAiGenerating(false);
      setLoading(false);
    };

    if (mixFromBackendObjects.length > 0) {
      fetchDetails();
    }
  }, [mixFromBackendObjects]);

  useEffect(() => {

    if (messageNoStoredMix !== "") {
      getGenerateDailyMixFromGPT();
    }
    
  }, [messageNoStoredMix])

  // --------------------- onClick generate new mix, will suggested movies and their movie objects from TMDB ---------------------

  const getGenerateDailyMixFromGPT = async () => {
    resetState();
    // setLoading(true);

    try {
      setIsGettingStoredMix(false);
      setIsAiGenerating(true);
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
    <div className="bg-[#110A19] min-h-screen p-8 pt-20">
      {/* <Navbar></Navbar> */}

      <div className="h-full flex flex-col items-center pt-8">
        <div className="bg-[#CFFF5E] box-border rounded-3xl p-8 w-full flex justify-between items-center my-8 card-shadow2 ">
          <div className="w-full flex flex-col justify-center items-start h-full">
            <h1 className="text-slate-950 font-archivo font-extrabold mb-2 uppercase">
              Your {mixTitle} mix by AI
            </h1>
            {/* <button
              className="bg-slate-100 w-40 h-12 text-lg rounded-full font-extrabold font-archivo border border-solid border-white  transition duration-300 ease-in-out hover:bg-slate-200 hover:cursor-pointer hover:border-black "
              onClick={() => {
                getGenerateDailyMixFromGPT();
              }}
              style={{ border: "0.5px solid grey" }}
            >
              Generate mix
            </button> */}
          </div>
        </div>

        {/* min-h-full  */}
        <div
          className="bg-[#1b1028] rounded-3xl min-h-[1000px] pt-4 pb-8 pl-4 pr-8 border border-solid border-[white] border-l-0 border-r-0 border-b-0 mt-8 w-full"
          style={{ backgroundColor: "rgba(141, 126, 255, 0.2)" }}
        >
          {/* TODO: save into a new list on backend, not postAddToMixOnBackend again, or use that function but save to a new list...! we still want to keep the other list after fetching so it stays when you reload the page!  */}
          {/* <div className="flex w-full justify-end items-center">
          
            <button className="text-white flex gap-2 box-border justify-center items-center text-center p-6 py-2 bg-inherit rounded-lg border-2 border-solid border-[#FF506C] hover:border-white">
              <FaPlus className="text-2xl text-white" /> Save List
            </button>
           
          </div> */}

          <div className="pt-8">
           {/*  
            // använder inte längre, användes när vi hade Generate knappen
           {loading === false && messageNoStoredMix !== "" && (
              <div>
                <p>{messageNoStoredMix}</p>
              </div>
            )} */}

            {loading === false && messageNoLikedMovies !== "" && (
              <div>
                <p>{messageNoLikedMovies}</p>{" "}
                {/* You need to like some movies before I can generate a Mix for you! */}
                <div className="flex items-center">
                  <Link className="justify-center items-center flex p-4 text-center text-black no-underline bg-slate-100 w-40 h-12 text-xl rounded-full font-bold border border-solid border-white mt-4 transition duration-300 ease-in-out hover:bg-slate-200 hover:cursor-pointer hover:border-black" href={{ pathname:"/new-user", query: { isFromMixPage: true }}}>
                    Start Liking Movies
                     <FaArrowRight color="rgb(2 6 23)" size={"40px"} />
                  </Link>
                </div>
              </div>
            )}

            {loading === true && isGettingStoredMix && (
              <div>
                <p>Finding stored mix...</p>
              </div>
            )}

            {loading && isAiGenerating && mixDetails.length === 0 ? (
              <h2 className="text-slate-100 text-2xl">
                AI Generating a mix based on your likes...
              </h2>
            ) : (
              <>
                {mixDetails && mixDetails.length > 0 ? (
                  <div className="flex w-full flex-col gap-8 justify-center items-center">
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
