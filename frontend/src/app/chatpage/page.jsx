"use client";

import { useState, useEffect } from "react";

// https://api.themoviedb.org/3/movie/550/watch/providers?api_key=a97f158a2149d8f803423ee01dec4d83

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [movieDetails, setMovieDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [movieDetailsFetched, setMovieDetailsFetched] = useState(false);
  // const [chatGPTFetched, setChatGPTFetched] = useState(false);
  //const movieAPI_KEY = "4e3dec59ad00fa8b9d1f457e55f8d473";
  const movieAPI_KEY = "a97f158a2149d8f803423ee01dec4d83";

  const resetState = () => {
    setInput("");
    setMovieDetails({});
    setLoading(false);
    setMovieDetailsFetched(false);
    // setChatGPTFetched(false);
  };

  useEffect(() => {
    //setLoading(true);

    const fetchMovieDetails = async () => {
      if (movieDetails.id) {
        console.log("Fetching movie details for ID:", movieDetails.id);
        try {
          const url = `https://api.themoviedb.org/3/movie/${movieDetails.id}?api_key=${movieAPI_KEY}`;
          const response = await fetch(url);
          const data = await response.json();
          console.log(data);
          console.log(data.vote_average);
          if (data.title) {
            // Check if data includes title
            setMovieDetails({
              ...movieDetails,
              title: data.title, // om vi inte redan gjort detta via ChatGpts response
              overview: data.overview,
              voteAverage: data.vote_average,
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
  }, [movieDetails.id]);

  useEffect(() => {
    //setLoading(true);

    const fetchWatchProviders = async () => {
      if (movieDetails.id) {
        console.log("Fetching movie providers for ID:", movieDetails.id);
        try {
          const url = `https://api.themoviedb.org/3/movie/${movieDetails.id}/watch/providers?api_key=${movieAPI_KEY}`;
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
            // Update movieDetails state
            console.log(seProviders);
            setMovieDetails({
              ...movieDetails,
              SE: seProviders,
            });
          } else {
            console.error("No movie found with the given ID");
          }
        } catch (error) {
          console.error("Error fetching movie details:", error);
        } finally {
          setLoading(false); // Set loading to false after fetching providers
        }
      }
    };

    fetchWatchProviders();
  }, [movieDetailsFetched]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleQuerySubmit = async () => {
    resetState(); // reset state
    setLoading(true);
    console.log("Submitting query for movie:", input);
    try {
      const response = await fetch("http://localhost:3010/moviesuggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });
      const data = await response.json(); // ändra i server.js så att chatgpt bara returnerar movie name, och sen kan vi göra en query för TMDB ID (se första useEffecten i firstpage/page.js)
      if (data.tmdbId) {
        console.log("Received TMDB ID:", data.tmdbId);
        setMovieDetails({ id: data.tmdbId });
        // setChatGPTFetched(true);
      } else {
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

  console.log(movieDetails);
  return (
    <div
      // style={{
      //   backgroundImage:
      //     "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3)), url('/background.jpg')",
      //   backgroundPosition: "bottom",
      //   backgroundSize: "cover",
      //   backgroundRepeat: "no-repeat",
      // }}

      className="flex flex-col justify-center items-center md:items-start pt-10 px-8 md:px-20 h-screen w-screen bg-slate-950 text-slate-100"
    >
      <img
        className="absolute top-0 left-0 w-full  object-cover z-0 gradient"
        src={movieDetails.backdrop}
        alt="Movie Backdrop"
      />

      {loading ? (
        <LoadingIndicator />
      ) : (
        <div className="h-full flex flex-col justify-center items-center  relative z-10">
          {movieDetails.title ? (
            <div className="flex flex-col justify-center items-center md:items-start">
              <h2 className="text-5xl font-semibold mb-10 text-center">
                {" "}
                {movieDetails.title}
              </h2>
              <div className="flex flex-col md:flex-row justify-center items-center md:justify-start ">
                {" "}
                <img
                  className="h-60 md:h-96 md:mr-20  rounded-lg"
                  src={movieDetails.poster}
                  alt="Movie Poster"
                  style={{ border: "1px solid grey" }}
                />
                <p className="mb-10 mt-4 font-semibold text-3xl">
                  <span className="text-lg mr-2">Rating:</span>
                  {movieDetails.voteAverage.toFixed(1)}
                </p>
                <div className="mb-10 mt-4 font-semibold">
                  <p className="text-lg mr-2">Providers in Sweden:</p>
                  <div className="flex flex-col justify-center items-center">
                    {movieDetails.SE && movieDetails.SE.length > 0
                      ? movieDetails.SE.map((providerName, index) => {
                          return (
                            <p key={index} className="text-lg">
                              {providerName}
                            </p>
                          );
                        })
                      : "N/A"}
                  </div>
                </div>
                <p className="mb-10 md:w-1/5 font-base text-xl text-center">
                  {movieDetails.overview.slice(0, 100)}...
                </p>
              </div>
            </div>
          ) : (
            <h2 className="h-full ">No movie details to display</h2>
          )}
        </div>
      )}

      <input
        className="h-20 bg-slate-50 w-full md:w-1/3 px-5 rounded-xl text-slate-900 text-lg text-center"
        type="text"
        value={input}
        onChange={handleInputChange}
        placeholder="Describe the movie you want..."
      />
      <button
        className="h-20 bg-blue-700 text-slate-50 w-full md:w-1/3 rounded-full mt-5 mb-10 font-semibold text-xl"
        onClick={handleQuerySubmit}
      >
        Find Movie
      </button>
    </div>
  );
}
