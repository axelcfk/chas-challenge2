"use client";

import {
  postAddToLikeList,
  postAddToWatchList,
  postRemoveFromLikeList,
  postRemoveFromWatchList,
} from "../utils";
import { FaPlus, FaCheck, FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { useEffect, useState } from "react";
import Link from "next/link";

// likedMoviesList and watchedMoviesList provided by parent... will not fetch in every movieCard
// the lists are just used to see if the current movie is liked/watchlisted or not... changing the color of the buttons..
export default function MovieCardWatchAndLike({
  id,
  poster,
  title,
  overview,
  isLiked, // sending this as a prop so we dont have to fetch like/watchlist every time we use a moviecard
  isInWatchList,
  streamingServices,
  voteAverage,
  showRating = true,
  profilePage,
  className,
}) {
  const [watched, setWatched] = useState(isInWatchList);
  const [liked, setLiked] = useState(isLiked);

  function handleLikeButtonClicked() {
    setLiked(!liked);
  }

  function handleButtonClicked() {
    setWatched(!watched);
  }

  if (!id || !poster || !title || !voteAverage) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className={`mr-4 inline-block mx-1 rounded-lg ${className}`}
      style={{ border: profilePage ? "none" : "0.5px solid grey" }}
    >
      {/* w-44 md:w-80 */}
      <div className="h-full w-full flex flex-col justify-center">
        <div className="h-60 w-full flex justify-center m-0">
          <div className="relative h-full">
            <Link href={`/movie/${encodeURIComponent(id)}`}>
              <img
                className="h-full rounded-t-lg w-auto box-border"
                src={poster}
                alt="Movie Poster"
              />
            </Link>
            <div
              style={{
                border: "0.9px solid grey",
                backdropFilter: "blur(4px)",
                backgroundColor: "rgba(0, 0, 0, 0.3)",
              }}
              onClick={() => {
                handleLikeButtonClicked();
                if (!liked) {
                  postAddToLikeList(id, "movie", title);
                } else {
                  postRemoveFromLikeList(id, "movie", title);
                }
              }}
              className="box-border absolute top-0 right-0 rounded-tr-md rounded-bl-md h-16 w-12 flex justify-center items-center hover:cursor-pointer"
            >
              {!liked ? (
                <div className="flex flex-col justify-center items-center">
                  <FaRegHeart className="h-5 w-5 text-slate-100 mb-1" />
                  <p className="text-slate-100 mb-1 text-sm">Like</p>
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center">
                  <FaHeart className="h-5 w-5 text-red-600 mb-1" />
                  <p className="text-red-600 mb-1 text-sm">Liked</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col justify-start">
          {" "}
          {/* gap-4 */}
          {showRating && (
            <div className="flex gap-2 justify-start items-center px-2">
              <FaStar color="yellow" />
              <p className="pl-1">{voteAverage.toFixed(1)}</p>
            </div>
          )}
          <div className="mt-4 px-2">
            <button
              onClick={() => {
                handleButtonClicked(id); // Toggles like state
                if (!watched) {
                  postAddToWatchList(id, "movie", title); // Adds to like list if not liked
                } else {
                  postRemoveFromWatchList(id, "movie", title); // Removes from like list if liked
                }
              }}
              className={`w-full h-10 bg-inherit border border-solid ${
                !watched
                  ? "border-[#3D3B8E]"
                  : profilePage
                  ? "border-profile-page"
                  : "border-green-600"
              } hover:cursor-pointer flex justify-center items-center rounded-full box-border ${
                !watched
                  ? ""
                  : profilePage
                  ? "profile-added-button"
                  : "added-button"
              }`}
            >
              {!watched ? (
                <div className="w-full flex gap-2 justify-center items-center leading-none font-light text-gray-200">
                  <FaPlus className="text-2xl leading-none text-gray-200" />

                  <p className="leading-none text-xs">WATCHLIST</p>
                </div>
              ) : (
                <div className="w-full flex justify-center gap-2 items-center font-light text-gray-200">
                  <FaCheck className="text-2xl leading-none text-gray-200" />
                  <p className="leading-none ">ADDED</p>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
