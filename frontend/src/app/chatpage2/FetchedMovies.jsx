"use client";

import Link from "next/link";
import { useState } from "react";
import { FaStar, FaHeart, FaRegHeart, FaPlus, FaCheck } from "react-icons/fa";
import { postAddToLikeList } from "../utils";
import { postRemoveFromLikeList } from "../utils";

export default function FetchedMovies({
  movieDetails,
  movieCredits,
  isAvailableOnSupportedServices,
  streamingServiceLinks,
}) {
  const [watches, setWatches] = useState({});

  function handleButtonClicked(id) {
    setWatches((prevWatches) => ({
      ...prevWatches,
      [id]: !prevWatches[id],
    }));
  }

  function handleToggleProvidersVisibility(movieId) {
    setWatches((prevWatches) => ({
      ...prevWatches,
      [movieId]: !prevWatches[movieId],
    }));
  }

  console.log("fetched är", movieDetails);
  return (
    <>
      <div className="flex flex-col w-full justify-center items-center py-10">
        <h2 className="text-2xl font-semibold">Lights, Camera, Action!</h2>
        <p>Your curated movies awaits!</p>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full ">
        {movieDetails.map((movie) => (
          <div
            key={movie.id}
            className="w-full  flex justify-center items-center rounded-lg bg-slate-950"
            style={{ border: "0.8px solid grey" }}
          >
            <div className="flex flex-col justify-center items-center w-full ">
              <Link href={`/movie/${encodeURIComponent(movie.id)}`}>
                <img
                  className="w-full rounded-t-lg"
                  src={movie.poster}
                  alt="poster"
                />
              </Link>

              <div className=" w-full h-full py-5 px-2">
                <p className="flex pb-4 justify-start items-center">
                  <span>
                    <FaStar color="yellow" />
                  </span>
                  <span className="pl-1"> {movie.voteAverage.toFixed(1)}</span>
                </p>
                <p className="h-14 font-semibold">{movie.title}</p>
                <div className="">
                  {isAvailableOnSupportedServices(movie.streaming) && (
                    <p className="text-xs">Watch on:</p>
                  )}
                  {isAvailableOnSupportedServices &&
                  isAvailableOnSupportedServices(movie.streaming) ? (
                    movie.streaming.flatrate.map((provider) => (
                      <>
                        <a
                          key={provider.provider_id}
                          href={streamingServiceLinks[provider.provider_name]}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <p className="hover:underline">
                            <span className="text-base">
                              {provider.provider_name}
                            </span>
                          </p>
                        </a>
                      </>
                    ))
                  ) : (
                    <p className="h-10"></p>
                  )}
                </div>
                <div className="w-full flex justify-center items-center pt-5 px-2">
                  <button
                    onClick={() => {
                      handleButtonClicked(movie.id); // Toggles like state
                      if (!watches[movie.id]) {
                        postAddToLikeList(movie.id, "movie", movie.title); // Adds to like list if not liked
                      } else {
                        postRemoveFromLikeList(movie.id, "movie", movie.title); // Removes from like list if liked
                      }
                    }}
                    className="w-full h-10 bg-slate-900 flex justify-center items-center rounded-xl px-3"
                  >
                    {!watches[movie.id] ? (
                      <FaPlus className="text-2xl" />
                    ) : (
                      <FaCheck className="text-2xl" />
                    )}
                    {!watches[movie.id] ? (
                      <span className="pl-2 w-full text-sm">ADD TO LIST</span>
                    ) : (
                      <span className="pl-2 w-full text-sm">ADDED</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
