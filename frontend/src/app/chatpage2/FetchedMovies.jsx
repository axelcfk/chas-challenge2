"use client";

import Link from "next/link";
import { useState } from "react";
import { FaStar, FaHeart, FaRegHeart, FaPlus, FaCheck } from "react-icons/fa";
import { postAddToLikeList } from "../utils";
import { postRemoveFromLikeList } from "../utils";
import { postAddToWatchList, postRemoveFromWatchList } from "../utils";

//? Lägga till TV4 Play?

//! Dessa måste stavas exakt som dom gör på TMDB från api:et
// Annars blir det "unavailable"
const supportedServices = [
  "Netflix",
  "HBO Max",
  "Viaplay",
  "Amazon Prime Video",
  "Disney Plus",
  "Tele2 Play",
];

const streamingServiceLinks = {
  Netflix: "https://www.netflix.com/se", //visas //funkar
  "HBO Max": "https://play.hbomax.com/", //visas //?länk funkar ej
  Viaplay: "https://www.viaplay.com/se", //visas //funkar
  "Amazon Prime Video": "https://www.primevideo.com/", //visas //funkar
  "Disney Plus": "https://www.disneyplus.com/se", //visas //?länk funkar ej
  "Tele2 Play": "https://www.tele2play.se", //visas //?länk funkar ej
};

export default function FetchedMovies({
  movieDetails,
  movieCredits,
  isAvailableOnSupportedServices,
  streamingServiceLinks,
}) {
  const [watches, setWatches] = useState({});
  const [likes, setLikes] = useState({});

  function handleButtonClicked(id) {
    setWatches((prevWatches) => ({
      ...prevWatches,
      [id]: !prevWatches[id],
    }));
  }
  function handleLikeButtonClicked(id) {
    setLikes((prevLikes) => ({
      ...prevLikes,
      [id]: !prevLikes[id],
    }));
  }

  // function handleToggleProvidersVisibility(movieId) {
  //   setWatches((prevWatches) => ({
  //     ...prevWatches,
  //     [movieId]: !prevWatches[movieId],
  //   }));
  // }

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
            <div className="flex flex-col justify-center items-center w-full z-0">
              <div className="flex flex-col justify-center items-center w-full relative">
                <div className="relative">
                  <Link href={`/movie/${encodeURIComponent(movie.id)}`}>
                    <img
                      className="w-full rounded-t-lg"
                      src={movie.poster}
                      alt="poster"
                    />
                  </Link>
                  <div
                    style={{
                      // border: "1px solid grey",
                      backdropFilter: "blur(4px)",
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                    }}
                    onClick={() => {
                      handleLikeButtonClicked(movie.id);
                      if (!likes[movie.id]) {
                        postAddToLikeList(movie.id, "movie", movie.title);
                      } else {
                        postRemoveFromLikeList(movie.id, "movie", movie.title);
                      }
                    }}
                    className="absolute top-0 right-0 m-2  rounded-full h-10 w-10 flex justify-center items-center hover:cursor-pointer"
                  >
                    {!likes[movie.id] ? (
                      <FaRegHeart className="h-5 w-5 text-red-600" />
                    ) : (
                      <FaHeart className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
              </div>
              <div className=" w-full h-full py-5 px-2">
                <p className="flex pb-4 justify-start items-center">
                  <span>
                    <FaStar color="yellow" />
                  </span>
                  <span className="pl-1"> {movie.voteAverage.toFixed(1)}</span>
                </p>
                <p className="h-14 font-semibold">{movie.title}</p>
                <div>
                  {isAvailableOnSupportedServices(movie.streaming) && (
                    <p className="text-xs">Watch on:</p>
                  )}
                  {movie.streaming?.flatrate?.some((provider) =>
                    supportedServices.includes(provider.provider_name)
                  ) ? (
                    movie.streaming.flatrate
                      .filter((provider) =>
                        supportedServices.includes(provider.provider_name)
                      )
                      .map((provider) => (
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
                    <p className="h-10">Not available in your area</p>
                  )}
                </div>
                <div className="w-full flex justify-center items-center pt-5 px-2">
                  <button
                    onClick={() => {
                      handleButtonClicked(movie.id); // Toggles like state
                      if (!watches[movie.id]) {
                        postAddToWatchList(movie.id, "movie", movie.title); // Adds to like list if not liked
                      } else {
                        postRemoveFromWatchList(movie.id, "movie", movie.title); // Removes from like list if liked
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
