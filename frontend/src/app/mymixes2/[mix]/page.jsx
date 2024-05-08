"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMovieObject, host } from "@/app/utils";
import SlideMenu from "@/app/components/SlideMenu";
import { SlideMenuMovieCard } from "@/app/components/SlideMenu";
import { postMovieToDatabase } from "@/app/utils";
import { MovieCardMix } from "./MovieCardMix";
import Navbar from "@/app/components/Navbar";

export default function Mix() {
  const [mixFromDatabaseOnlyIDs, setMixFromDatabaseOnlyIDs] = useState([]);
  const [reasoningFromGPT, setReasoningFromGPT] = useState("");
  const movieAPI_KEY = "4e3dec59ad00fa8b9d1f457e55f8d473";

  const params = useParams();
  const mixTitle = params.mix; // Get movie ID from the URL parameter

  // fetch mix

  /*   if (!mixTitle) {
    return;
  }

 */
  const [ mixIsFetched, setMixIsFetched] = useState(false);

  const [loading, setLoading] = useState(false);
  const [movieNamesFromGPT, setMovieNamesFromGPT] = useState([]);

  const [mixFromBackendObjects, setMixFromBackendObjects] = useState([]);

  const [mixDetails, setMixDetails] = useState([]);

  const [showDetails, setShowDetails] = useState(false);


  // TODO: just nu om du klickar på generate daily mix igen så kommer movienamesfromgpt.length och movieIdsFromAPI.length vara annorlunda och därmed inte trigga andra useEffecten! Måste kanske deleta dailymixen på backend innan man klickar generate igen?

  const resetState = () => {
    setMixFromBackendObjects([]);
    setMixDetails([]);
    setShowDetails(false);
    setLoading(true);
    // setChatGPTFetched(false);
  };

  // First time entering page or Refreshing page, check if we already have a dailymixbasedonlikes on backend

  /* useEffect(() => {
    getGenerateDailyMixFromGPT()

  }, []) */

  // ----------------------- onClick  getGenerateDailyMixFromGPT(); starts a sequence of useEffects --------------

  
  // triggers when getMixFromOurDatabaseOnlyIDs() is complete
  useEffect(() => {
   
      try {
        mixFromBackendObjects.forEach( (movieObject) => {
         
          // console.log("movieObject: ", movieObject);
          //setLoading(false);

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
              },
            ]);
          } else {
            console.log("data.title does not exist?");
          }
        });
      } catch (error) {
        console.log(
          "error fetching movie objects from backend database",
          error
        );
      } finally {
        setLoading(false);
      }
    
    //setShowDetails(true);
    // }
  }, [mixFromBackendObjects]);

  // --------------------- FUNCTIONS -----------------------------------------------------

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
      if (data.mixMovieObjects) {
        setMixFromBackendObjects(data.mixMovieObjects);

        //setReasoningFromGPT(data.reasoning)
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

  return (
    
    <div className="bg-[#251738] h-screen">
      {/* <Navbar></Navbar> */}
      <div className="border border-white">Navbar</div>
      <div className="h-full">
        <div className="flex flex-col gap-8 my-8 h-52 justify-center items-center">
          <div className="flex w-full justify-center items-center text-center">
            <h1 className="text-3xl font-semibold">{mixTitle} mix</h1>
          </div>
          
          <button
            className={`bg-[#3F295E] text-white rounded-full font-semibold w-52 border border-[#3F295E] hover:border-white`}
            onClick={() => {
              // setButtonClicked(true)
              getGenerateDailyMixFromGPT();
            }}
            //disabled={!input}
          >
            <div className=" flex justify-center items-center text-center w-full p-4">
              <p className="">Generate</p>
            </div>
          </button>
        </div>

        <div className="bg-[#3F295E] min-h-full pb-8 pl-4">
          <div className="flex w-full justify-end pr-8 pt-4 items-center">
            <button className="flex justify-center items-center text-center p-6 py-2 bg-[#FF506C] rounded-lg">Save List</button> {/* TODO: save into a new list on backend, not postAddToMixOnBackend again, or use that function but save to a new list...! we still want to keep the other list after fetching so it stays when you reload the page! */}
          </div>
         
          {loading === true ? (
            <div>Loading...</div>
          ) : (
            <>
              {mixDetails && mixDetails.length > 0 ? (
            <div className="flex w-full flex-col gap-8 bg-[#3F295E]">
              {mixDetails.map((movie, index) => (
                <MovieCardMix // TODO: ändra komponentnamnet till MovieMixCard...?
                  key={index}
                  title={movie.title}
                  poster={movie.poster} // Assuming you have 'poster' and 'overview' properties in 'likedMoviesListDetails'
                  overview={movie.overview}
                  voteAverage={movie.voteAverage}
                  streamingServices="Streaming Services"
                />
              ))}
            </div>
          ) : (
            ""
          )}
            </>
          )}
        </div>
        {/* </div> */}
      </div>
    </div>
  );
}
