"use client";
import { useState } from "react";
import { FaStar, FaHeart, FaRegHeart, FaCheck, FaPlus } from "react-icons/fa";
import Link from "next/link";
import {
  postRemoveFromLikeList,
  postRemoveFromWatchList,
  postAddToLikeList,
  postAddToWatchList,
} from "@/app/utils";

export function MovieCardMix({
  title,
  id,
  poster,
  overview,
  voteAverage,
  streamingServices,
  isInWatchList,
  isLiked,
}) {
  const [watched, setWatched] = useState(isInWatchList);
  const [liked, setLiked] = useState(isLiked);

  /*   const [watched, setWatched] = useState(false);
  const [liked, setLiked] = useState(true); */

  function handleLikeButtonClicked() {
    setLiked(!liked);
  }

  function handleButtonClicked() {
    setWatched(!watched);
  }

  //console.log(streamingServices);
  if (!streamingServices) {
    <div>Loading streaming services...</div>;
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
      className="flex h-36 w-80 gap-4 rounded-md bg-[#8D7EFF]"
      style={{ border: "0.5px solid grey" }}
    >
      {/* <Link href={`/movie/${encodeURIComponent(id)}`}>
        <img
            className="flex w-24 h-full mr-3 rounded-md"
            src={poster}
            alt={title}
          />
        
        </Link> */}

      <div className="h-full w-24 flex justify-center m-0 p-0 ">
        <div className="relative h-full">
          <Link href={`/movie/${encodeURIComponent(id)}`}>
            <img
              className="h-full w-auto box-border rounded-tl-md rounded-bl-md"
              src={poster}
              alt="Movie Poster"
              // style={{ border: "0.5px solid grey" }}
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
            className="box-border absolute top-0 right-0 rounded-bl-md h-8 w-8 flex justify-center items-center hover:cursor-pointer"
          >
            {!liked ? (
              <div className="flex flex-col justify-center items-center">
                <FaRegHeart className="h-4 w-4 text-slate-100" />
                <p className="text-slate-100 mb-1 text-xs"></p>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center">
                <FaHeart className="h-4 w-4 text-red-600" />
                <p className="text-red-600 mb-1 text-xs"></p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 ">
        <p>{title}</p>
        <div className="flex gap-2 justify-start items-center">
          <FaStar color="yellow" />
          <p>{voteAverage.toFixed(1)}</p>
        </div>
        <div className="h-6 flex pr-2">
          {/* {streamingServices && streamingServices.map((streamingService, index) => {
              return (
                <div key={index} className="bg-slate-50 rounded-xl ml-2 p-1">
                 
                    <img
                      className="h-full"
                      src={serviceLogos[streamingService.provider_name]}
                    />
                  </div>
              )
            })} */}
        </div>

        <button
          onClick={() => {
            handleButtonClicked(id); // Toggles like state
            if (!watched) {
              postAddToWatchList(id, "movie", title); // Adds to like list if not liked
            } else {
              postRemoveFromWatchList(id, "movie", title); // Removes from like list if liked
            }
          }}
          /*  className={`w-full h-auto ${
              !watched ? "bg-[#3D3B8E]" : "bg-green-600"
            } hover:cursor-pointer flex justify-center items-center rounded-full  box-border border-none`} */
          className={`w-32 h-12 bg-inherit border border-solid hover:cursor-pointer flex justify-center items-center rounded-full box-border ${
            !watched ? "border-[#3D3B8E]" : "border-green-600"
          }`}
        >
          {!watched ? (
            <div className="w-full flex gap-2 justify-center items-center leading-none font-light text-gray-200">
              <FaPlus className=" leading-none text-gray-200" />

              <p className="leading-none ">WATCHLIST</p>
            </div>
          ) : (
            <div className="w-full flex justify-center gap-2   items-center font-light text-gray-200">
              <FaCheck className=" leading-none text-gray-200" />

              <p className=" leading-none ">ADDED</p>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
