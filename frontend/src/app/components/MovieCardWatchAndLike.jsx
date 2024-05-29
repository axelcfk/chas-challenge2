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

  const serviceLogos = {
    Netflix: "/Netflix1.svg",
    "HBO Max": "/HBO1.svg",
    Viaplay: "/Viaplay1.svg",
    "Amazon Prime Video": "/Prime1.svg",
    "Disney Plus": "/Disney1.svg",
    "Tele2 Play": "/tele2play.png",
    "Apple TV": "/AppleTv.svg",
    SVT: "/SVTPlay.svg",
    TV4Play: "/TV4Play.svg",
    "Discovery+": "/Discovery+.svg",
  };

  return (
    <div
      className={`inline-block mr-2 rounded-2xl ${className}`}
      style={{
        border: profilePage ? "none" : "0.5px solid grey",
        backgroundColor: "rgba(141, 126, 255, 0.1)",
      }}
    >
      <div className=" h-full w-full flex flex-col justify-center">
        <div className="h-60 w-full flex justify-center m-0">
          <div className="relative h-full">
            <Link href={`/movie/${encodeURIComponent(id)}`}>
              <img
                className="h-full rounded-t-2xl w-40 box-border"
                src={poster}
                alt="Movie Poster"
                aria-label={title}
              />
            </Link>
            <div
              tabIndex={0}
              aria-label="Like button"
              style={{
                border: "0.9px solid grey",
                backdropFilter: "blur(4px)",
                backgroundColor: "rgba(0, 0, 0, 0.3)",
              }}
              onClick={() => {
                handleLikeButtonClicked();
                if (liked === false) {
                  postAddToLikeList(id, "movie", title);
                } else {
                  postRemoveFromLikeList(id, "movie", title);
                }
              }}
              className="box-border absolute top-0 right-0 rounded-tr-2xl rounded-bl-md h-16 w-12 flex justify-center items-center hover:cursor-pointer"
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
        <div className="h-full w-40 flex flex-col justify-start">
          {" "}
          {/* gap-4 */}
          <div className="w-full ">
            <h2 className="px-2 pt-2 h-12 text-wrap font-semibold">{title}</h2>
          </div>
          {showRating && (
            <p className="flex justify-start items-center px-2 pt-2">
              <span>
                <FaStar color="yellow" />
              </span>
              <span className="pl-1"> {voteAverage.toFixed(1)}</span>
            </p>
          )}
          <div className="mt-4 px-6 ">
            <button
              onClick={() => {
                handleButtonClicked(id); // Toggles like state
                if (!watched) {
                  postAddToWatchList(id, "movie", title); // Adds to like list if not liked
                } else {
                  postRemoveFromWatchList(id, "movie", title); // Removes from like list if liked
                }
              }}
              className={`w-full h-8 bg-inherit border border-solid mb-4 ${
                !watched
                  ? "border-white"
                  : profilePage
                  ? "border-profile-page"
                  : "border-[#cfff5e]"
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
                  <FaPlus className="text-base leading-none text-gray-200" />

                  <p className="leading-none text-xs font-semibold">
                    WATCHLIST
                  </p>
                </div>
              ) : (
                <div className="w-full flex justify-center gap-2 items-center font-light text-gray-200">
                  <FaCheck className="text-base leading-none text-[#cfff5e]" />
                  <p className="leading-none text-[#cfff5e] font-semibold">
                    ADDED
                  </p>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
