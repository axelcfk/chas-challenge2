"use client";

import Link from "next/link";
import { useState } from "react";
import { FaStar, FaHeart, FaRegHeart } from "react-icons/fa";
import { postAddToLikeList } from "../utils";
import { postRemoveFromLikeList } from "../utils";

export default function FetchedMovies({
  movieDetails,
  movieCredits,
  isAvailableOnSupportedServices,
  streamingServiceLinks,
}) {
  const [likes, setLikes] = useState({});

  function handleButtonClicked(id) {
    setLikes((prevLikes) => ({
      ...prevLikes,
      [id]: !prevLikes[id],
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
                  className="w-full  rounded-t-lg"
                  src={movie.poster}
                  alt="poster"
                />
              </Link>

              <div className=" w-full h-full py-5 px-2">
                <p className="flex pb-4">
                  <span>
                    <FaStar color="yellow" />
                  </span>
                  <span className="pl-1"> {movie.voteAverage.toFixed(1)}</span>
                </p>
                <p className="h-14">{movie.title}</p>
                <div className="">
                  {isAvailableOnSupportedServices &&
                  isAvailableOnSupportedServices(movie.streaming) ? (
                    movie.streaming.flatrate.map((provider) => (
                      <a
                        key={provider.provider_id}
                        href={streamingServiceLinks[provider.provider_name]}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <p className="hover:underline h-10">
                          <span className="text-sm">
                            {provider.provider_name}
                          </span>
                        </p>
                      </a>
                    ))
                  ) : (
                    <p className="h-10"></p>
                  )}
                </div>
                <div className="w-full flex justify-center items-center pt-5 px-2">
                  <button
                    onClick={() => {
                      handleButtonClicked(movie.id); // Toggles like state
                      if (!likes[movie.id]) {
                        postAddToLikeList(movie.id, "movie", movie.title); // Adds to like list if not liked
                      } else {
                        postRemoveFromLikeList(movie.id, "movie", movie.title); // Removes from like list if liked
                      }
                    }}
                    className="w-full h-10 bg-purple-950 flex justify-center items-center rounded-xl"
                  >
                    {!likes[movie.id] ? <FaRegHeart /> : <FaHeart />}
                    {!likes[movie.id] ? (
                      <span className="pl-2 w-1/2">Like</span>
                    ) : (
                      <span className="pl-2 w-1/2">Unlike</span>
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
