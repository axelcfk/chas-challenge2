"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";

import { FaStar, FaHeart, FaRegHeart, FaPlus, FaCheck } from "react-icons/fa";
import { postAddToLikeList } from "../utils";
import { postRemoveFromLikeList } from "../utils";
import { postAddToWatchList, postRemoveFromWatchList } from "../utils";

//! Dessa måste stavas exakt som dom gör på TMDB från api:et
// Annars blir det "unavailable"
const supportedServices = [
  "Netflix",
  "HBO Max",
  "Viaplay",
  "Amazon Prime Video",
  "Disney Plus",
  "Tele2 Play",
  "Apple TV",
  "SVT",
  "TV4 Play",
  "Discovery+",
];

//? dessa används inte??? var kommer länkarna ifrån då?
const streamingServiceLinks = {
  Netflix: "https://www.netflix.com/se", //visas //funkar
  "HBO Max": "https://play.hbomax.com/", //visas //?länk funkar ej
  Viaplay: "https://www.viaplay.com/se", //visas //funkar
  "Amazon Prime Video": "https://www.primevideo.com/", //visas //funkar
  "Disney Plus": "https://www.disneyplus.com/se", //visas //?länk funkar ej
  "Tele2 Play": "https://www.tele2play.se", //visas //?länk funkar ej
  "Apple TV": "https://www.apple.com/se/tv/",
  SVT: "https://www.svt.se/",
  "TV4 Play": "https://www.tv4play.se/",
  "Discovery+": "https://www.discoveryplus.se/",
};

const serviceLogos = {
  Netflix: "/Netflix1.svg",
  "HBO Max": "/HBO1.svg",
  Viaplay: "/Viaplay1.svg",
  "Amazon Prime Video": "Prime1.svg",
  "Disney Plus": "/Disney1.svg",
  "Tele2 Play": "/tele2play.png",
  "Apple TV": "/AppleTv.svg",
  SVT: "/SVTPlay.svg",
  TV4Play: "/TV4Play.svg",
  "Discovery+": "/Discovery+.svg",
};

export default function FetchedMovies({
  movieDetails,
  movieCredits,
  isAvailableOnSupportedServices,
  streamingServiceLinks,
}) {
  const [watches, setWatches] = useState({});
  const [likes, setLikes] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [animationClass, setAnimationClass] = useState("");

  useEffect(() => {
    if (showToast) {
      setAnimationClass("animate-slide-up-fade-in");
      setTimeout(() => {
        setAnimationClass("animate-fade-out");
        setTimeout(() => {
          setShowToast(false);
          setAnimationClass("");
        }, 800); // Fade-out duration
      }, 1000); // Display duration before fade-out
    }
  }, [showToast]);

  function handleButtonClicked(id) {
    setWatches((prevWatches) => ({
      ...prevWatches,
      [id]: !prevWatches[id],
    }));
    if (!watches[id]) {
      postAddToWatchList(
        id,
        "movie",
        movieDetails.find((movie) => movie.id === id)?.title
      );
    } else {
      postRemoveFromWatchList(
        id,
        "movie",
        movieDetails.find((movie) => movie.id === id)?.title
      );
    }
  }

  function handleLikeButtonClicked(id) {
    const newLikes = !likes[id];
    setLikes((prevLikes) => ({
      ...prevLikes,
      [id]: newLikes,
    }));

    if (newLikes) {
      // Only proceed if the movie is being liked (not unliked)
      postAddToLikeList(
        id,
        "movie",
        movieDetails.find((movie) => movie.id === id)?.title
      );
      if (!localStorage.getItem("thankYouShown")) {
        showToastMessage();
        localStorage.setItem("thankYouShown", "true"); // Set flag in local storage
      }
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
  }

  console.log("fetched är", movieDetails);
  return (
    <>
      <div className="flex flex-col w-full justify-center items-start py-10">
        <h2 className="text-2xl font-semibold pb-3">Lights, Camera, Action!</h2>
        <p className="font-semibold">
          See something you like? Liking it helps the AI deliver even better
          recommendations tailored just for you.
        </p>
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
                      border: "0.9px solid grey",
                      backdropFilter: "blur(4px)",
                      backgroundColor: "rgba(0, 0, 0, 0.3)",
                    }}
                    onClick={() => handleLikeButtonClicked(movie.id)}
                    className="absolute top-0 right-0 rounded-tr-lg rounded-bl-lg h-16 w-12 flex justify-center items-center hover:cursor-pointer"
                  >
                    {!likes[movie.id] ? (
                      <div className="flex flex-col justify-center items-center">
                        <FaRegHeart className="h-5 w-5 text-slate-100 mb-1" />
                        <p className="text-slate-100 mb-1 text-sm">Like</p>
                      </div>
                    ) : (
                      <div className="flex flex-col justify-center items-center">
                        <FaHeart className="h-5 w-5 text-red-600 mb-1" />
                        <p className="text-red-600 mb-1 text-sm">Unlike</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-full h-full py-5 ">
                {showToast && (
                  <div
                    className={`fixed bottom-20 left-5 w-auto max-w-full whitespace-nowrap p-3 bg-midnight text-white rounded-lg ${animationClass}`}
                  >
                    Thank you for enhancing the AI!
                  </div>
                )}
                <p className="flex pb-4 justify-start items-center px-2">
                  <span>
                    <FaStar color="yellow" />
                  </span>
                  <span className="pl-1"> {movie.voteAverage.toFixed(1)}</span>
                </p>
                <h2 className="text-base h-14 font-semibold  px-2">
                  {movie.title}
                </h2>
                {movie.streaming?.flatrate?.some((provider) =>
                  supportedServices.includes(provider.provider_name)
                ) ? (
                  <>
                    <p className="text-sm px-2 h-5 font-semibold">
                      Watch it now on:
                    </p>

                    <div className="flex justify-start items-center gap-2 mt-4 bg-slate-100 px-2 h-10">
                      {movie.streaming.flatrate
                        .filter((provider) =>
                          supportedServices.includes(provider.provider_name)
                        )
                        .map((provider) => (
                          <a
                            key={provider.provider_id}
                            href={streamingServiceLinks[provider.provider_name]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center"
                          >
                            <img
                              src={serviceLogos[provider.provider_name]}
                              alt={provider.provider_name}
                              className="h-7"
                            />
                          </a>
                        ))}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm px-2 h-5"></p>

                    <div className="text-slate-950 font-semibold flex justify-start items-center gap-2 mt-4 bg-slate-100 px-2 h-10">
                      Not available in your area
                    </div>
                  </>
                )}
                <div className="w-auto flex justify-center items-center pt-5 px-2 ">
                  <button
                    onClick={() => {
                      handleButtonClicked(movie.id); // Toggles like state
                      if (!watches[movie.id]) {
                        postAddToWatchList(movie.id, "movie", movie.title); // Adds to like list if not liked
                      } else {
                        postRemoveFromWatchList(movie.id, "movie", movie.title); // Removes from like list if liked
                      }
                    }}
                    className={`w-full h-10 ${
                      !watches[movie.id] ? "bg-[#3D3B8E]" : "bg-green-600"
                    } flex justify-center items-center rounded-full px-3 border-none`}
                  >
                    {!watches[movie.id] ? (
                      <FaPlus className="text-2xl text-gray-200" />
                    ) : (
                      <FaCheck className="text-2xl text-gray-200" />
                    )}
                    {!watches[movie.id] ? (
                      <span className="pl-2 w-full text-sm font-light text-gray-200">
                        ADD TO LIST
                      </span>
                    ) : (
                      <span className="pl-2 w-full text-sm font-light text-gray-200">
                        ADDED
                      </span>
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
