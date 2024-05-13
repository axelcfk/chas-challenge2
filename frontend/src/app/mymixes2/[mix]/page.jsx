"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMovieObject, host } from "../../utils";
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
  const [messageNoLikedMovies, setMessageNoLikedMovies] = useState("")

  const [loading, setLoading] = useState(false);
 
  const [mixFromBackendObjects, setMixFromBackendObjects] = useState([]);
  const [mixFromBackendProvidersObjects, setMixFromBackendProvidersObjects] = useState([]);


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
    setMixFromBackendObjects([]);

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

          setMixFromBackendProvidersObjects(data.mixMovieObjectsProviders)
          
          //setReasoningFromGPT(data.reasoning)
        } 
          else if (data.message) {
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
    setMixDetails([]);

    try {
      mixFromBackendObjects.forEach((movieObject) => {
        // We map through the movie objects and just pick out the things we need ... this is good incase we want to add the credits and actors etc later since they are seperate fetches...?

        /* let isLiked;
        if (likedMoviesList && likedMoviesList.length > 0) {
          isLiked = likedMoviesList.find((likedMovie) => {
            return likedMovie.id === movie.id; 
          })
        } */
        // and same for watchlist

        const providersOfMovie = mixFromBackendProvidersObjects.find(movieObjectProviders => {
          return movieObjectProviders.id === movieObject.id;
        })

        console.log(providersOfMovie);


        if (movieObject.title) {
          setMixDetails((prevDetails) => [
            ...prevDetails,
            {
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
              /* isLiked: isLiked,
              isInWatchList: isInWatchList, */
            },
          ]);
        } else {
          console.log("data.title does not exist?");
        }
        setLoading(false)
      });
    } catch (error) {
      console.log("error fetching movie objects from backend database", error);
    } finally {
      //setLoading(false);
    }

    //setShowDetails(true);
    // }
  }, [mixFromBackendObjects]);


 
  // --------------------- onClick generate new mix, will suggested movies and their movie objects from TMDB ---------------------

  const getGenerateDailyMixFromGPT = async () => {
    resetState();
    // setLoading(true);



    try {
      const response = await fetch(`${host}/generatedailymix2`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        //body: JSON.stringify({ }),
      });
      const data = await response.json(); // ändra i server.js så att chatgpt bara returnerar movie name, och sen kan vi göra en query för TMDB ID (se första useEffecten i firstpage/page.js)
      if (data.mixMovieObjects && data.mixMovieObjectsProviders) {
        setMixFromBackendObjects(data.mixMovieObjects);

        setMixFromBackendProvidersObjects(data.mixMovieObjectsProviders);

        // TODO: also have this endpoint make a list of the movie ids and a true/false if they are liked or not, and same for watchlisted. And then check the setMixDetails above (the utkommenterade delen)
        


        //setReasoningFromGPT(data.reasoning)
      } else if (data.messageNoLikedMovies) {

        setMessageNoLikedMovies(data.messageNoLikedMovies)
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
    <div className="bg-[#201430] h-screen">
      {/* <Navbar></Navbar> */}
      <div className="border border-white">Navbar</div>
      <div className="h-full">
        <div className="flex flex-col gap-8 my-8 h-52 justify-center items-center">
          <div className="flex w-full justify-center items-center text-center">
            <h1 className="">{mixTitle} mix</h1>
          </div>

          <button
            className={`bg-inherit text-white p-4 w-52 box-border border-2 border-solid border-[#FF506C] rounded-full hover:border-white`}
            onClick={() => {
              // setButtonClicked(true)
              getGenerateDailyMixFromGPT();
            }}
            //disabled={!input}
          >
            <p className="font-semibold">Generate with AI</p>
          </button>
        </div>

        <div className="bg-[#110A19] rounded-3xl min-h-full pt-4 pb-8 pl-4 pr-8 border border-solid border-[#FF506C] border-l-0 border-r-0 border-b-0">
          <div className="flex w-full justify-end items-center">
            {" "}
            {/* pr-8 here moves it outside screen? */}
            {/*  <FaCheck className="text-2xl text-gray-200" /> */}
            <button className=" text-white flex gap-2 box-border justify-center items-center text-center p-6 py-2 bg-inherit rounded-lg  border-2 border-solid border-[#FF506C] hover:border-white">
              <FaPlus className="text-2xl text-white" /> Save List
            </button>{" "}
            {/* TODO: save into a new list on backend, not postAddToMixOnBackend again, or use that function but save to a new list...! we still want to keep the other list after fetching so it stays when you reload the page! */}
          </div>

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
            <h2>AI Generating a mix based on your likes......</h2>
          ) : (
            <>
              {mixDetails && mixDetails.length > 0 ? (
                <div className="flex w-full flex-col gap-8">
                  {mixDetails.map((movie, index) => (
                    <MovieCardMix // TODO: ändra komponentnamnet till MovieMixCard...?
                      key={index}
                      id={movie.id}
                      title={movie.title}
                      poster={movie.poster} // Assuming you have 'poster' and 'overview' properties in 'likedMoviesListDetails'
                      overview={movie.overview}
                      voteAverage={movie.voteAverage}
                      streamingServices={movie.flatrate}
                      isInWatchList={true}
                      isLiked={true}
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
        {/* </div> */}
      </div>
    </div>
  );
}
