"use client";

import { useParams } from "next/navigation";
import { FaPlus, FaThumbsUp } from "react-icons/fa";
import { useEffect, useState } from "react";

export default function moviePage() {
  const [movieDetails, setMovieDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [noResult, setNoResult] = useState(false);
  const [toggleExpanded, setToggleExpanded] = useState(false);
  const [actorsToggle, setActorsToggle] = useState(false);

  const movieAPI_KEY = "4e3dec59ad00fa8b9d1f457e55f8d473";

  const params = useParams();
  const movieName = params.movieName;

  function handleToggle() {
    setToggleExpanded(!toggleExpanded);
  }

  function handleActorsToggle() {
    setActorsToggle(!actorsToggle);
  }

  async function fetchData(name) {
    console.log("Fetching data for:", name);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
          name
        )}&api_key=${movieAPI_KEY}`
      );
      const data = await response.json();
      if (data.results.length > 0) {
        const movieId = data.results[0].id;
        fetchMovieDetails(movieId);
      } else {
        console.log("No movies found for:", name);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  }

  async function fetchMovieDetails(id) {
    setLoading(false);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${movieAPI_KEY}`
      );
      const data = await response.json();
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
    } catch (error) {
      console.error("Error fetching movie details:", error);
    }
  }

  useEffect(() => {
    if (!movieName) {
      console.log("Movie name is not available");
      return;
    }
    console.log("The movieName is:", movieName);
    fetchData(movieName);
    setLoading(false);
  }, [movieName]);

  function LoadingIndicator() {
    return (
      <div className="loading-indicator ">
        <h3 className="font-semibold text-3xl">Exciting stuff!</h3>
        <div className="loader m-10"></div>
        <p className="font-semibold text-xl">Finding a movie match ... </p>
      </div>
    );
  }

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
                      {/* {movieCredits.director} */}
                      John Doe
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
                          postAddToLikeList(movieDetails.idFromAPI, "movie", movieDetails.titleFromAPI);
                        }}
                      >
                        <FaThumbsUp></FaThumbsUp>
                      </button>

                      <button
                        onClick={() => {
                          postAddToWatchList(movieDetails.idFromAPI, "movie"); // TODO: movieDetails.titleFromAPI
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
    </div>
  );
}
