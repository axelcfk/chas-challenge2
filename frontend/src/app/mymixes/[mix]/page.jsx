"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMovieObject, host } from "../../utils";
import SlideMenu from "../../components/SlideMenu";
import { SlideMenuMovieCard } from "../../components/SlideMenu";
import { postMovieToDatabase } from "../../utils";
import { MovieCardMix } from "./MovieCardMix";
import Navbar from "../../components/Navbar";

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
  const [suggestionFetchedFromGPT, setSuggestionFetchedFromGPT] =
    useState(false);

  const [fetchedAndSavedDetailsFromAPI, setFetchedAndSavedDetailsFromAPI] =
    useState(false);

  const [movieIdsFromAPI, setMovieIdsFromAPI] = useState([]);
  const [idsReceivedFromAPI, setIdsReceivedFromAPI] = useState(false);

  const [loading, setLoading] = useState(false);
  const [movieNamesFromGPT, setMovieNamesFromGPT] = useState([]);

  const [mixDetails, setMixDetails] = useState([]);

  const [showDetails, setShowDetails] = useState(false);

  const [fetchedMixWithIDsFromDatabase, setFetchedMixWithIDsFromDatabase] =
    useState(false);

  // TODO: just nu om du klickar på generate daily mix igen så kommer movienamesfromgpt.length och movieIdsFromAPI.length vara annorlunda och därmed inte trigga andra useEffecten! Måste kanske deleta dailymixen på backend innan man klickar generate igen?

  const resetState = () => {
    setIdsReceivedFromAPI(false);
    setSuggestionFetchedFromGPT(false);
    setFetchedMixWithIDsFromDatabase(false);
    setFetchedAndSavedDetailsFromAPI(false);
    setFetchedMixWithIDsFromDatabase(false);
    setShowDetails(false);
    // setChatGPTFetched(false);
  };

  // First time entering page or Refreshing page, check if we already have a dailymixbasedonlikes on backend

  useEffect(() => {
    if (fetchedAndSavedDetailsFromAPI === false) {
      // safety if-statement, shouldnt be needed...?
      getMixFromOurDatabaseOnlyIDs(); // this triggers the last useEffect which populates mixDetails
    }
  }, []);

  // ----------------------- onClick  getGenerateDailyMixFromGPT(); starts a sequence of useEffects --------------

  // triggers after getGenerateDailyMixFromGPT(); is complete
  useEffect(() => {
    if (suggestionFetchedFromGPT === true && movieNamesFromGPT.length > 0) {
      //fetchMovieIds();
      fetchAllMovieIdsFromTMDB();
    }
  }, [movieNamesFromGPT]);

  // triggers after fetchAllMovieIdsFromTMDB(); is complete
  useEffect(() => {
    if (
      movieIdsFromAPI.length > 0 &&
      movieIdsFromAPI.length === movieNamesFromGPT.length
    ) {
      setIdsReceivedFromAPI(true); // had to be in a seperate useEffect because reasons
    }
  }, [movieIdsFromAPI]);

  // triggers after idsReceivedFromAPI becomes true
  useEffect(() => {
    if (idsReceivedFromAPI === true && movieIdsFromAPI.length > 0) {
      console.log("all movie ids received from api: ", movieIdsFromAPI);

      movieIdsFromAPI.forEach(async (movieId) => {
        //fetchLikedMovieDetails(movie.id);
        await fetchMovieDetails(movieId);
      });
    }
  }, [idsReceivedFromAPI]);

  // triggers when all fetchMovieDetails are complete
  useEffect(() => {
    if (fetchedAndSavedDetailsFromAPI === true) {
      getMixFromOurDatabaseOnlyIDs();
    }
  }, [fetchedAndSavedDetailsFromAPI]); // sometimes this becomes true before all movies have been posted to our mix on backend?

  // triggers when getMixFromOurDatabaseOnlyIDs() is complete
  useEffect(() => {
    if (
      fetchedMixWithIDsFromDatabase === true &&
      mixFromDatabaseOnlyIDs.length > 0
    ) {
      try {
        mixFromDatabaseOnlyIDs.forEach(async (movie) => {
          const movieObject = await fetchMovieObject(movie.id);
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
    }
    //setShowDetails(true);
    // }
  }, [fetchedMixWithIDsFromDatabase]);

  // --------------------- FUNCTIONS -----------------------------------------------------

  const getGenerateDailyMixFromGPT = async () => {
    resetState();
    setLoading(true);

    try {
      const response = await fetch(`${host}/generatedailymix`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        //body: JSON.stringify({ }),
      });
      const data = await response.json(); // ändra i server.js så att chatgpt bara returnerar movie name, och sen kan vi göra en query för TMDB ID (se första useEffecten i firstpage/page.js)
      if (data.movieNames) {
        setMovieNamesFromGPT(data.movieNames);

        //setReasoningFromGPT(data.reasoning)
      } else {
        setLoading(false);
        console.error("No suggestion in response");
      }
    } catch (error) {
      console.error("Failed to fetch AI suggestion:", error);
    } finally {
      //setLoading(false)

      setSuggestionFetchedFromGPT(true);
    }
    // setLoading(false);
    //setLoading(false);
  };

  const fetchAllMovieIdsFromTMDB = async () => {
    //setLoading(true);
    if (movieNamesFromGPT && movieNamesFromGPT.length > 0) {
      // Create an array to store all the promises
      console.log("all movienames suggested by GPT: ", movieNamesFromGPT);

      const fetchPromises = movieNamesFromGPT.map(async (movieName) => {
        // Await each fetch inside the map function
        await fetchMovieIdFromTMDB(movieName);
      });

      // Wait for all the fetches to complete
      await Promise.all(fetchPromises);

      // Once all fetches are complete, set idsReceivedFromAPI to true
      //setIdsReceivedFromAPI(true); // just to trigger the useEffect below
    } else {
      setLoading(false);
      console.log("No movie names suggested by ChatGPT");
    }
  };

  async function fetchMovieIdFromTMDB(movieNameFromGPT) {
    if (movieAPI_KEY != null && movieNameFromGPT) {
      const encodedMovieTitle = encodeURIComponent(movieNameFromGPT);
      console.log("encoded movie title: ", encodedMovieTitle);

      fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodedMovieTitle}&api_key=${movieAPI_KEY}`
      )
        .then((response) => response.json())
        .then((data) => {
          // Extract movie ID from the response
          console.log("id from API: ", data.results[0].id);

          /* setMovieIdsFromAPI((prevDetails) => [ 
            ...prevDetails, {
              id: data.results[0].id,
            }
          ]);  */ // Assuming we want the first result
          setMovieIdsFromAPI((prevIds) => [...prevIds, data.results[0].id]);
        })
        .catch((error) => console.error("Error fetching data:", error));
    }
  }

  // TODO: delete mix on backend before starting to add new movies to the mix?

  // TODO: if-statement so we only fetchMovieDetails if the movie doesnt already exist in our database
  // fetch movie details from API
  async function fetchMovieDetails(id) {
    // console.log("Fetching movie details for ID:", id);
    try {
      const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${movieAPI_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      console.log(data);
      console.log(data.vote_average);

      // TODO: if statement?
      await postMovieToDatabase(data); // TODO: sometimes these two functions occur after all other code is complete, so the page does not have time to populate mixDetails?
      await postAddToMixOnBackend(data.id, data.title);

      // Vi hämtar ifrån backend först istället så det blir lättare att importera på andra sidor, och om vi laddar om sidan...

      /* if (data.title) {
        // Check if data includes title
        setMixDetails((prevDetails) => [
          ...prevDetails,
          {
            id: id,
            title: data.title,
            overview: data.overview,
            voteAverage: data.vote_average,
            release: data.release_date,
            tagline: data.tagline,
            runtime: data.runtime,
            backdrop: `https://image.tmdb.org/t/p/w500${data.backdrop_path}`,
            poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
          },
        ]);

        //  setMovieDetailsFetched(true); // Mark that movie details have been fetched
      } else {
        console.error("No movie found with the given ID");
      } */
    } catch (error) {
      console.error("Error fetching movie details:", error);
    } finally {
      //setLoading(false);
      //setFetchedAndSavedDetailsFromAPI(!fetchedAndSavedDetailsFromAPI);
      setFetchedAndSavedDetailsFromAPI(true);
    }
  }

  // fetch mix from our database:

  async function getMixFromOurDatabaseOnlyIDs() {
    try {
      const response = await fetch(`${host}/dailymixbasedonlikes`, {
        // users sidan på backend! dvs inte riktiga sidan!
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        /*  body: JSON.stringify({
         
        }), */
      });

      const data = await response.json();
      if (data.mix && data.mix) {
        console.log(
          "fetched data.mix from backend: ",
          data.mix,
          setMixFromDatabaseOnlyIDs(data.mix)
        );
      } else {
        console.log(
          "failed to fetch data.mix from backend, or does not exist yet"
        );
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setFetchedMixWithIDsFromDatabase(true);
    }
  }
  // fetch movies from our database and populate mixDetails that will be shown on site:

  async function postAddToMixOnBackend(id, title) {
    try {
      //const response = await fetch("http://localhost:4000/sessions", {
      const response = await fetch(`${host}/addtodailymixbasedonlikes`, {
        // users sidan på backend! dvs inte riktiga sidan!
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          title: title,
          //movieOrSeries: movieOrSeries,
        }),
      });
    } catch (error) {
      console.error("Error posting like to backend:", error);
    }
  }

  //console.log("idsReceivedFromAPI: ", idsReceivedFromAPI);

  // TODO: fetch streaming services...
  /* async function fetchStreamingServices(movieId) {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${movieAPI_KEY}`
      );
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error("Error fetching streaming services:", error);
      //return {};
    }
  }
 */
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
            <button className="flex justify-center items-center text-center p-6 py-2 bg-[#FF506C] rounded-lg">
              Save List
            </button>{" "}
            {/* TODO: save into a new list on backend, not postAddToMixOnBackend again, or use that function but save to a new list...! we still want to keep the other list after fetching so it stays when you reload the page! */}
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
