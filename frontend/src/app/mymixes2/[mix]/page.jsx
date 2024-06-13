"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMovieObject, fetchWatchAndLikeList, host } from "../../utils";
import SlideMenu from "../../components/SlideMenu";
import { SlideMenuMovieCard } from "../../components/SlideMenu";
import { postMovieToDatabase } from "../../utils";
import { MovieCardMix } from "./MovieCardMix";
import Navbar from "../../components/Navbar";
import { FaArrowRight, FaHeart, FaPlus } from "react-icons/fa";
import Link from "next/link";
import { SlArrowLeft } from "react-icons/sl";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "./mixpage.css";
import ProtectedRoute from "@/app/components/ProtectedRoute";

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

  const router = useRouter();

  const handleNavigation = () => {
    router.back();
    //router.push("/startpage");
  };

  const handleNavigationNewUser = () => {
    resetState();
    const url = `/new-user?isFromMixPage=true`;
    router.push(url);
  };

  //const [disabledButton, setDisabledButton] = useState(false);

  // TODO: just nu om du klickar på generate daily mix igen så kommer movienamesfromgpt.length och movieIdsFromAPI.length vara annorlunda och därmed inte trigga andra useEffecten! Måste kanske deleta dailymixen på backend innan man klickar generate igen?

  const resetState = () => {
    //setIsAiGenerating(false);
    setMixFromBackendObjects([]);
    setMixDetails([]);
    setShowDetails(false);
    //setLoading(true);
    setMessageNoStoredMix("");
    setMessageNoLikedMovies("");
    // setChatGPTFetched(false);
  };

  // First time entering page or Refreshing page, check if we already have a dailymixbasedonlikes on backend

  useEffect(() => {
    async function getStoredMix() {
      //resetState();
      /* setMixDetails([]);
      setMixFromBackendObjects([]);
      setMixFromBackendProvidersObjects([]); */
      try {
        setLoading(true);
        setIsGettingStoredMix(true);
        const token = localStorage.getItem("token");

        const response = await fetch(`${host}/api/me/dailymixbasedonlikes`, {
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
          //setLoading(false);
        } else {
          setLoading(false);
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
      //setLoading(true);

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
    };

    if (mixFromBackendObjects.length > 0) {
      try {
        fetchDetails();
      } catch (error) {
        console.error(
          "Failed fetchDetails function (fetching watchAndLikeList and/or populating mixDetails)"
        );
      } finally {
        setIsGettingStoredMix(false);
        setIsAiGenerating(false);
        setLoading(false);
      }
    }
  }, [mixFromBackendObjects]);

  // if no stored mix is found on backend we start generating a new one
  useEffect(() => {
    // isAiGenerating === false because it might run twice by accident sometimes
    if (messageNoStoredMix !== "" && isAiGenerating === false) {
      getGenerateDailyMixFromGPT();
    }
  }, [messageNoStoredMix]); // messageNoStoredMix gets populated if no stored mix is found...

  // --------------------- generate new mix through ChatGpt, will suggested movies and then fetch movie objects from TMDB ---------------------

  const getGenerateDailyMixFromGPT = async () => {
    try {
      resetState();
      setLoading(true);
      setIsGettingStoredMix(false);
      setIsAiGenerating(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${host}/api/generatedailymix2`, {
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
        setIsAiGenerating(false);
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

  console.log("loading: ", loading);
  console.log("isAiGenerating: ", isAiGenerating);
  console.log("mixDetails.length :", mixDetails.length);

  /*   <ProtectedRoute>
    </ProtectedRoute>
 */

  return (
    <div className="bg-[#110A19] min-h-screen p-8 pb-0 pt-20 md:px-40">
      <div className="h-full w-full flex flex-col items-center pt-8">
        <button
          className="bg-transparent border-none absolute top-0 left-0 m-8 px-4 my-20  text-slate-100 text-xl hover:cursor-pointer"
          onClick={handleNavigation}
        >
          <SlArrowLeft />
        </button>
        <div className="bg-[#CFFF5E] box-border rounded-3xl p-8 w-full md:w-2/5 md:h-64 flex justify-between items-center my-8 card-shadow2 ">
          <div className="w-full flex flex-col justify-center items-start h-full">
            <h1 className="text-slate-950 font-archivo font-extrabold mb-2 uppercase">
              Your {mixTitle} <br />
              mix by AI
            </h1>
            <p className="text-slate-950 whitespace-nowrap font-archivo font-extrabold">
              Based on your
              <FaHeart className=" h-3 w-3 mx-1 text-[#EA3546]"></FaHeart>{" "}
              movies
            </p>
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
          //bg-[#1b1028]
          className="//shadow-[rgba(0,0,15,0.5)_0px_0px_40px_0px]  //shadow-[#CFFF5E] relative shadow-container rounded-tr-3xl rounded-tl-3xl min-h-[1000px] md:min-h-[500px] pt-4 pb-8 px-8 border border-solid border-[#CFFF5E] border-l-0 border-r-0 border-b-0 mt-8 w-full"
          // style={{ backgroundColor: "rgba(141, 126, 255, 0.2)" }}
          //style={{boxShadow: '#CFFF5E 0px 0px 40px 0px, #1b1028 0px -10px 20px -10px' }}
        >
          {/* <div className="flex w-full justify-end items-center">
          
            <button className="text-white flex gap-2 box-border justify-center items-center text-center p-6 py-2 bg-inherit rounded-lg border-2 border-solid border-[#FF506C] hover:border-white">
              <FaPlus className="text-2xl text-white" /> Save List
            </button>
           
          </div> */}

          <div className="flex pt-8 w-full">
            {/*  
            // använder inte längre, användes när vi hade Generate knappen
           {loading === false && messageNoStoredMix !== "" && (
              <div>
                <p>{messageNoStoredMix}</p>
              </div>
            )} */}

            {loading === false &&
              messageNoLikedMovies !== "" &&
              isAiGenerating === false && (
                <div className="flex flex-col gap-8">
                  {/* <p>{messageNoLikedMovies}</p>{" "} */}
                  <h2 className="text-3xl font-bold">
                    No mix provided, please like some movies first!
                  </h2>
                  <div className="flex items-center">
                    {/*  <Link className="justify-center items-center flex p-4 text-center text-black no-underline bg-slate-100 w-48 h-8 text-xl rounded-full font-bold border border-solid border-white mt-4 transition duration-300 ease-in-out hover:bg-slate-200 hover:cursor-pointer hover:border-black" href={{ pathname:"/new-user", query: { isFromMixPage: true }}}>
                   <p className="px-4">Start Here</p> 
                     <FaArrowRight color="rgb(2 6 23)" size={"40px"} />
                  </Link> */}

                    {/* Link does not reset state appropriately? */}
                    {/* <Link className="justify-center no-underline text-black  items-center flex  hover:cursor-pointer border-none text-xl bg-[#CFFF5E] hover:bg-[#CFFF5E] p-4 mt-4 w-48 h-8 rounded-full font-extrabold font-archivo " href={{ pathname:"/new-user", query: { isFromMixPage: true }}}>
                  <p className="px-4">Start Here</p> 
                     <FaArrowRight color="rgb(2 6 23)" size={"40px"} />
                    </Link> */}

                    {/* router.push which resets state better! Avoids useEffects running twice! */}
                    <button
                      className="justify-between text-black items-center flex  hover:cursor-pointer border-none text-xl bg-[#CFFF5E] hover:bg-[#CFFF5E] py-9 px-4 mt-4 w-48 h-8 rounded-full font-extrabold font-archivo "
                      onClick={handleNavigationNewUser}
                    >
                      <p className="">Start Here</p>
                      <FaArrowRight color="rgb(2 6 23)" size={"40px"} />
                    </button>
                  </div>
                </div>
              )}

            {loading === true &&
              !isGettingStoredMix &&
              !isAiGenerating &&
              mixDetails.length === 0 &&
              mixFromBackendObjects.length === 0 && (
                <div>
                  <p>Loading...</p>
                </div>
              )}

            {loading === true && isGettingStoredMix && (
              <>
                {console.log("Finding stored mix...")}
                {/* <div className="flex min-h-[1000px]  w-full flex-col gap-8 justify-center items-center">

                 <SkeletonTheme baseColor="#535157" highlightColor="#7b8085" height={160} width={320}>

                <Skeleton containerClassName="flex-1"></Skeleton>
                <Skeleton containerClassName="flex-1" ></Skeleton>
                <Skeleton containerClassName="flex-1"></Skeleton>
                <Skeleton containerClassName="flex-1"></Skeleton>
                <Skeleton containerClassName="flex-1"></Skeleton>
                <Skeleton containerClassName="flex-1"></Skeleton>
                </SkeletonTheme> 
                <Skeleton containerClassName="flex-1" baseColor="#535157" highlightColor="#7b8085" height={1000}></Skeleton>
                </div> */}
              </>
            )}

            {loading && isAiGenerating && mixDetails.length === 0 ? (
              <div className="relative flex w-full flex-col gap-8 justify-center items-center text-center">
                <h2 className="absolute top-0 z-50 font-archivo text-white text-2xl font-extrabold">
                  {/* AI is generating your Mix... */}
                </h2>

                <div className="flex flex-col gap-8 z-20">
                  <SkeletonTheme
                    baseColor="#535157"
                    highlightColor="#7b8085"
                    height={160}
                    width={320}
                    borderRadius={20}
                  >
                    <Skeleton containerClassName="flex-1"></Skeleton>
                    <Skeleton containerClassName="flex-1"></Skeleton>
                    <Skeleton containerClassName="flex-1"></Skeleton>
                    <Skeleton containerClassName="flex-1"></Skeleton>
                    <Skeleton containerClassName="flex-1"></Skeleton>
                    <Skeleton containerClassName="flex-1"></Skeleton>
                  </SkeletonTheme>
                </div>
              </div>
            ) : (
              <>
                {mixDetails && mixDetails.length > 0 ? (
                  <div className="flex w-full flex-col lg:grid lg:grid-cols-2 gap-8 justify-center items-center lg:justify-items-center">
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
