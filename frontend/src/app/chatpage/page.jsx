"use client";

import { useState, useEffect } from "react";
import { host, postAddToLikeList, postAddToWatchList, postMovieToDatabase } from "../utils";
import { FaPlus, FaThumbsUp } from "react-icons/fa";


// https://api.themoviedb.org/3/movie/550/watch/providers?api_key=a97f158a2149d8f803423ee01dec4d83

export default function ChatPage() {
  const [actorsToggle, setActorsToggle] = useState(false);
  const [input, setInput] = useState("");
  const [movieDetails, setMovieDetails] = useState({});
  const [movieCredits, setMovieCredits] = useState({});
  const [loading, setLoading] = useState(false);
  const [noResult, setNoResult] = useState(false);
  const [movieDetailsFetched, setMovieDetailsFetched] = useState(false);
  const [movieCreditsFetched, setMovieCreditsFetched] = useState(false);
  const [toggleExpanded, setToggleExpanded] = useState(false);
  // const [chatGPTFetched, setChatGPTFetched] = useState(false);
  const movieAPI_KEY = "b0aa22976a88a1f9ab9dbcd9828204b5";

  // Shanti api key:
  // b0aa22976a88a1f9ab9dbcd9828204b5

  // const movieAPI_KEY = "a97f158a2149d8f803423ee01dec4d83";
  // 4e3dec59ad00fa8b9d1f457e55f8d473

  function handleToggle() {
    setToggleExpanded(!toggleExpanded);
  }

  function handleActorsToggle() {
    setActorsToggle(!actorsToggle);
  }

  const resetState = () => {
    setNoResult(false);
    setInput("");
    setMovieDetails({});
    setLoading(false);
    setMovieDetailsFetched(false);
    // setChatGPTFetched(false);
  };

  useEffect(() => {
    if (movieAPI_KEY != null && loading && movieDetails.titleFromGPT) {
      console.log("title received from GPT: ", movieDetails.titleFromGPT);
      const encodedMovieTitle = encodeURIComponent(movieDetails.titleFromGPT);
      console.log("encoded movie title: ", encodedMovieTitle);

      fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodedMovieTitle}&api_key=${movieAPI_KEY}`
      )
        .then((response) => response.json())
        .then((data) => {
          // Extract movie ID from the response
          console.log("id from API: ", data.results[0].id);

          setMovieDetails({
            ...movieDetails,
            idFromAPI: data.results[0].id,
          }); // Assuming we want the first result
        })
        .catch((error) => console.error("Error fetching data:", error));
    }
  }, [movieDetails.titleFromGPT]);

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

            

            setMovieDetailsFetched(true); // Mark that movie details have been fetched
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
    //setLoading(true);

    const fetchWatchProviders = async () => {
      if (movieDetails.idFromAPI) {
        console.log("Fetching movie providers for ID:", movieDetails.idFromAPI);
        try {
          const url = `https://api.themoviedb.org/3/movie/${movieDetails.idFromAPI}/watch/providers?api_key=${movieAPI_KEY}`;
          const response = await fetch(url);
          const data = await response.json();
          //console.log(data); // MYCKET DATA
          console.log("Watch Providers API Response:", data); // Log the API response
          if (
            data &&
            data.results &&
            data.results.SE &&
            data.results.SE.flatrate
          ) {
            // Extract providers for 'SE' locale
            const seProviders = data.results.SE.flatrate.map(
              (provider) => provider.provider_name
            );
            const seProviders2 = data.results.SE.rent.map(
              (provider) => provider.provider_name
            );
            const seProviders3 = data.results.SE.buy.map(
              (provider) => provider.provider_name
            );
            // Update movieDetails state
            console.log(seProviders);
            setMovieDetails({
              ...movieDetails,
              SE_flaterate: seProviders,
              SE_rent: seProviders2,
              SE_buy: seProviders3,
            });
          } else {
            console.error("No movie found with the given ID");
          }
        } catch (error) {
          console.error("Error fetching movie details:", error);
        } finally {
          setLoading(false); // Set loading to false after fetching providers
          console.log(movieDetails);
        }
      }
    };

    fetchWatchProviders();
  }, [movieDetailsFetched]);

  useEffect(() => {
    async function fetchCreditsDetails() {
      if (movieDetails.idFromAPI) {
        try {
          const url = `https://api.themoviedb.org/3/movie/${movieDetails.idFromAPI}/credits?api_key=${movieAPI_KEY}`;
          const response = await fetch(url);
          const data = await response.json();
          console.log("received:", data);

          const actors = data.cast.slice(0, 4).map((actor) => actor.name);
          console.log("The actors are:", actors);

          const director = data.crew.find(
            (person) => person.job === "Director"
          );
          console.log(`The director is: ${director.name}`);
          if (director) {
            setMovieCredits({
              ...movieCredits,
              director: director.name,
              actors: actors,
            });
            setMovieCreditsFetched(true); // Mark that movie credits have been fetched
            console.log(movieCreditsFetched);
          } else {
            console.error("No movie found with the given ID");
          }
        } catch (error) {
          console.error("Error fetching movie details:", error);
        }
      }
    }

    fetchCreditsDetails();
  }, [movieDetails.idFromAPI]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleQuerySubmit = async () => {
    resetState(); // reset state
    setLoading(true);
    console.log("Submitting query for movie:", input);
    try {
      const response = await fetch(`${host}/moviesuggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });
      const data = await response.json(); // ändra i server.js så att chatgpt bara returnerar movie name, och sen kan vi göra en query för TMDB ID (se första useEffecten i firstpage/page.js)
      if (data.tmdbId && data.movieName) {
        console.log("Received TMDB ID:", data.tmdbId);
        console.log("Received Movie Name:", data.movieName);

        setMovieDetails({
          idFromGPT: data.tmdbId,
          titleFromGPT: data.movieName,
        });
        // setChatGPTFetched(true);
      } else {
        setNoResult(true);
        setLoading(false);
        console.error("No TMDB ID received or error in response");
      }
    } catch (error) {
      console.error("Failed to fetch AI suggestion:", error);
    }
    // setLoading(false);
  };

  function LoadingIndicator() {
    return (
      <div className="loading-indicator ">
        <h3 className="font-semibold text-3xl">Exciting stuff!</h3>
        <div className="loader m-10"></div>
        <p className="font-semibold text-xl">Finding a movie match ... </p>
      </div>
    );
  }

  /* if (movieDetails.SE == null) {
    return <div>Loading...</div>
  }
 */

  // console.log(movieDetails);
  // console.log(movieCredits);
  return (
    <div className="flex flex-col justify-center items-center md:items-start pb-10  px-8 md:px-20 h-screen w-screen bg-slate-950 text-slate-100">
      {movieDetails.backdrop && (
        <div className=" ">
          <img
            id="img"
            className="absolute top-0 left-0 w-full  object-cover z-0 "
            src={movieDetails.backdrop}
            alt="Movie Backdrop"
          />
          <div className="gradient"></div>
        </div>
      )}

      {loading ? (
        <LoadingIndicator />
      ) : noResult ? (
        <div className=" flex justify-center items-center h-full">
          <h2 className=" text-center text-3xl font-semibold">
            No Movie or TV series was found. Try again!
          </h2>
        </div>
      ) : (
        <div className="h-full flex flex-col justify-center items-center  relative z-10">
          {movieDetails.titleFromAPI ? (
            <div className="flex flex-col justify-center items-center text-slate-400">
              <div className="flex flex-col  justify-center items-center ">
                {" "}
                <div className="w-full flex flex-row justify-center items-center  ">
                  <div className="w-full">
                    <h2 className="text-2xl font-semibold mb-5 text-slate-50 mr-4">
                      {" "}
                      {movieDetails.titleFromAPI}
                    </h2>
                    <div className="flex text-sm">
                      <p>
                        {movieDetails.release.slice(0, 4)}
                        <span className="text-sm mx-2">●</span>
                      </p>
                      <p>DIRECTED BY</p>
                    </div>
                    <p className="font-semibold text-lg">
                      {movieCredits.director}
                    </p>
                    <p>{movieDetails.runtime.toString()} mins</p>
                  </div>
                  <div className="flex flex-col w-full justify-center items-center gap-4">
                    <img
                      className=" h-52 md:h-96 rounded-md w-auto"
                      src={movieDetails.poster}
                      alt="Movie Poster"
                      style={{ border: "1px solid grey" }}
                    />

                    <div className="w-full flex justify-center gap-4">
                      <button
                        onClick={() => {
                          postAddToLikeList(movieDetails.idFromAPI, "movie");
                        }}
                      >
                        <FaThumbsUp></FaThumbsUp>
                      </button>

                      <button
                        onClick={() => {
                          postAddToWatchList(movieDetails.idFromAPI, "movie");
                        }}
                      >
                        <FaPlus></FaPlus>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="h-60 lex flex-col justify-start md:justify-center items-start  w-full md:w-full ">
                  <div className=" " onClick={handleToggle}>
                    {!toggleExpanded ? (
                      <div>
                        <p className="mt-10 mb-2 font-medium text-lg">
                          {movieDetails.tagline}
                        </p>
                        <p className="mb-5  md:w-full  font-light">
                          {movieDetails.overview.slice(0, 200)}...
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="mt-10 mb-2 font-medium text-lg">
                          {movieDetails.tagline}
                        </p>
                        <p className="mb-5  md:w-full font-light text-base">
                          {movieDetails.overview.slice(0, 600)}
                        </p>
                      </div>
                    )}
                  </div>

                  <p
                    onClick={handleActorsToggle}
                    className="mt-10 mb-2 font-medium text-lg"
                  >
                    Actors
                  </p>
                  {actorsToggle ? (
                    <div className="mb-5  md:w-full font-light text-base flex flex-row">
                      {movieCredits &&
                        movieCredits.actors.map((actor, index) => (
                          <div key={index} className="mr-2">
                            {actor}
                          </div>
                        ))}
                    </div>
                  ) : null}
                </div>
                <div className="w-full flex  justify-end mt-8">
                  <div className="w-full ">
                    {movieDetails.SE_flaterate &&
                    movieDetails.SE_flaterate.length > 0 ? (
                      <p className="text-sm mr-2">WATCH IT ON</p>
                    ) : null}

                    {movieDetails.SE_flaterate &&
                    movieDetails.SE_flaterate.length > 0 ? (
                      movieDetails.SE_flaterate.map((providerName, index) => {
                        return (
                          <div>
                            <div className="flex">
                              <p key={index} className="text-lg flex mr-3">
                                {providerName}{" "}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className=" h-10 flex items-end">
                        <p className="text-sm mr-2">
                          Not available in your area
                        </p>
                      </div>
                    )}
                  </div>
                  <div className=" h-10 flex items-end">
                    <p className="font-semibold text-3xl text-green-400">
                      <span className="text-sm mr-2 text-slate-400 font-normal">
                        RATING
                      </span>
                      {movieDetails.voteAverage.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className=" flex justify-center items-center h-full">
              <h2 className=" text-center text-3xl font-semibold">
                What kind of film do you want to watch today?
              </h2>
            </div>
          )}
        </div>
      )}
      <div className="md:flex md:justify-center md:items-center z-10 fixed inset-x-0 bottom-0 pb-2 px-8 md:px-20 bg-slate-950">
        <input
          style={{ border: "1px solid grey" }}
          className="h-14 bg-transparent w-full md:w-1/3 px-5 rounded-xl text-lg text-center text-slate-50"
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Describe the movie you want..."
        />
        <button
          className={`h-12 ${
            input
              ? "bg-slate-100 hover:bg-slate-300 text-slate-900"
              : "bg-slate-400 text-slate-900"
          } w-full md:w-1/3 rounded-full md:mt-0 mt-5 font-semibold text-xl`}
          onClick={handleQuerySubmit}
          disabled={!input}
        >
          Find Movie
        </button>
      </div>
    </div>
  );
}
