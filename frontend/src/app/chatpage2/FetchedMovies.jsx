"use client";

import Link from "next/link";
import { useState } from "react";
import { FaStar, FaHeart, FaRegHeart, FaPlus, FaCheck } from "react-icons/fa";
import {
  postAddToLikeList,
  postRemoveFromLikeList,
  postAddToWatchList,
  postRemoveFromWatchList,
} from "../utils";

export default function FetchedMovies({
  movieDetails,
  movieCredits,
  isAvailableOnSupportedServices,
  streamingServiceLinks,
}) {
  const [watches, setWatches] = useState({});
  const [likes, setLikes] = useState({});
  const [showToast, setShowToast] = useState(false);

  function handleButtonClicked(id) {
    setWatches((prevWatches) => ({
      ...prevWatches,
      [id]: !prevWatches[id],
    }));
  }

  function handleLikeButtonClicked(id) {
    const newLikes = !likes[id];
    setLikes((prevLikes) => ({
      ...prevLikes,
      [id]: newLikes,
    }));
    if (newLikes) {
      postAddToLikeList(
        id,
        "movie",
        movieDetails.find((movie) => movie.id === id)?.title
      );
      showToastMessage();
    } else {
      postRemoveFromLikeList(
        id,
        "movie",
        movieDetails.find((movie) => movie.id === id)?.title
      );
    }
  }

  function showToastMessage() {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1750);
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
                    onClick={() => handleLikeButtonClicked(movie.id)}
                    className="absolute top-0 right-0 m-2 rounded-full h-10 w-10 flex justify-center items-center hover:cursor-pointer"
                  >
                    {!likes[movie.id] ? (
                      <FaRegHeart className="h-5 w-5 text-red-600" />
                    ) : (
                      <FaHeart className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
              </div>
              <div className="w-full h-full py-5 px-2">
                {showToast && (
                  <div className="fixed bottom-20 left-5 w-auto max-w-full whitespace-nowrap p-3 bg-gray-600 text-white rounded-lg animate-bounce-up">
                    Thank you for enhancing the AI!
                  </div>
                )}
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
                      handleButtonClicked(movie.id);
                      if (!watches[movie.id]) {
                        postAddToWatchList(movie.id, "movie", movie.title);
                      } else {
                        postRemoveFromWatchList(movie.id, "movie", movie.title);
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
