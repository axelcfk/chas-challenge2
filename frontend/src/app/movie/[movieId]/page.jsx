"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FaPlus,
  FaRegHeart,
  FaHeart,
  FaCheck,
  FaStar,
  FaImage,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import {
  postAddToLikeList,
  postAddToWatchList,
  postMovieToDatabase,
  postRemoveFromLikeList,
  postRemoveFromWatchList,
} from "@/app/utils";
import { checkLikeList } from "@/app/utils";
import BackButton from "@/app/components/BackButton";
import SlideMenu from "@/app/components/SlideMenu";

export default function MoviePage() {
  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likedMovies, setLikedMovies] = useState([]);
  const [noResult, setNoResult] = useState(false);
  const [toggleExpanded, setToggleExpanded] = useState(false);
  const [actorsToggle, setActorsToggle] = useState(false);
  const [likeButtonClicked, setLikeButtonClicked] = useState(false);
  const [seen, setSeen] = useState(false);
  const [watches, setWatches] = useState({});
  const [likes, setLikes] = useState({});
  const [actorImages, setActorImages] = useState({});
  const [videos, setVideos] = useState({});
  const [similar, setSimilar] = useState([]);
  const [credits, setCredits] = useState({
    director: "",
    actors: [],
    otherCrew: [],
  });

  const movieAPI_KEY = "4e3dec59ad00fa8b9d1f457e55f8d473";
  const params = useParams();
  const movieId = params.movieId; // Get movie ID from the URL parameter

  const serviceLogos = {
    Netflix: "/Netflix1.svg",
    "HBO Max": "/HBO1.svg",
    Viaplay: "/Viaplay1.svg",
    "Amazon Prime Video": "Prime1.svg",
    "Disney Plus": "/Disney1.svg",
    "Tele2 Play": "/tele2play.png",
    "Apple TV": "/AppleTV1.svg",
    SVT: "/SVTPlay.svg",
    TV4Play: "/TV4Play.svg",
    "Discovery+": "/Discovery+.svg",
  };

  function handleToggle() {
    setToggleExpanded(!toggleExpanded);
  }

  function handleActorsToggle() {
    setActorsToggle(!actorsToggle);
  }

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
  //FETCHA ALLA MOVIE DETAILS FRÅN BACKEND
  // useEffect(() => {
  //   const fetchMovieDetails = async () => {
  //     if (!movieId) return;

  //     setLoading(true);
  //     try {
  //       const response = await fetch(
  //         `https://api.themoviedb.org/3/movie/${movieId}?api_key=${movieAPI_KEY}`
  //       );
  //       const data = await response.json();

  //       // await postMovieToDatabase(data); // if it already exists it doesnt get added (see backend)

  //       setMovieDetails({
  //         id: data.id,
  //         title: data.title,
  //         overview: data.overview,
  //         voteAverage: data.vote_average,
  //         release: data.release_date,
  //         tagline: data.tagline,
  //         runtime: data.runtime,
  //         backdrop: `https://image.tmdb.org/t/p/w500${data.backdrop_path}`,
  //         poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
  //       });

  //       const creditsResponse = await fetch(
  //         `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${movieAPI_KEY}`
  //       );
  //       const creditsData = await creditsResponse.json();
  //       setCredits({
  //         director: creditsData.crew.find((person) => person.job === "Director")
  //           ?.name,
  //         actors: creditsData.cast.slice(0, 6).map((actor) => ({
  //           // Only take the first six actors
  //           name: actor.name,
  //           personId: actor.id,
  //           character: actor.character,
  //           imagePath: actor.profile_path, // Assuming direct path is available; adjust based on API
  //         })),
  //         otherCrew: creditsData.crew
  //           .filter((person) =>
  //             ["Producer", "Screenplay", "Music"].includes(person.job)
  //           )
  //           .map((crew) => ({
  //             name: crew.name,
  //             job: crew.job,
  //           })),
  //       });

  //       fetchActorsImages(creditsData.cast.slice(0, 6));
  //     } catch (error) {
  //       console.error("Error fetching movie details:", error);
  //       setMovieDetails(null); // Handle errors by setting details to null
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   credits.actors.forEach((actor) => {
  //     console.log(`Actor Name: ${actor.name}, Person ID: ${actor.personId}`);
  //     // You can use `actor.personId` to fetch the actor's images or more details
  //   });

  //   fetchMovieDetails();
  // }, [movieId]);
  useEffect(() => {
    async function fetchMoviePageDetails(movieId) {
      if (!movieId) {
        console.error("Missing required parameter: movieId");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:3010/fetchingmoviepagedetails",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ movieId }),
          }
        );
        const data = await response.json();

        console.log("fetched data:", data);

        if (data.error) {
          console.error(data.error);
        } else {
          setMovieDetails(data.movieDetails);
          setCredits(data.movieDetails.credits);
          setVideos(data.movieDetails.videoKey);
          console.log(
            "data.movidetails.videokey is:",
            data.movieDetails.videoKey
          );
          setSimilar(data.movieDetails.similarMovies);
          console.log("similar movies are:", similar);
          console.log("actorImages:", actorImages);
          setActorImages(
            data.movieDetails.credits.actors.reduce((acc, actor) => {
              acc[actor.personId] = actor.imagePath;
              return acc;
            }, {})
          );
        }
      } catch (error) {
        console.error("Error fetching movie page details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMoviePageDetails(movieId);
  }, [movieId]);

  //fetcha likelist

  useEffect(() => {
    const fetchLikeList = async () => {
      try {
        const movies = await checkLikeList();
        setLikedMovies(movies);
        if (movies.some((movie) => movie.id === movieId)) {
          setLikeButtonClicked(true);
        }
      } catch (error) {
        console.error("Failed to fetch liked movies list");
      }
    };

    fetchLikeList();
  }, [movieId]);

  const isMovieLiked = likedMovies.some(
    (movie) => movie.id === movieDetails?.id
  );

  function LoadingIndicator() {
    return (
      <div className="loading-indicator ">
        <h3 className="font-semibold text-3xl">Exciting stuff!</h3>
        <div className="loader m-10"></div>
        <p className="font-semibold text-xl">Finding a movie match ... </p>
      </div>
    );
  }

  if (!movieDetails) {
    return <div>No movie found. Try a different search!</div>;
  }

  console.log("similar object", similar);
  console.log(
    "providers are??:",
    movieDetails.providers.flatrate[0].provider_name
  );

  const providerName = movieDetails.providers.flatrate[0].provider_name;
  const flatrateProviders = movieDetails.providers.flatrate.map((provider) => {
    return (
      <div
        key={provider.provider_name}
        className="flex flex-row justify-start items-center "
      >
        <img
          className="h-8 "
          src={serviceLogos[provider.provider_name]}
          alt={provider.provider_name}
        />
      </div>
    );
  });

  return (
    <div className="flex flex-col justify-center items-center md:items-start pt-20 pb-10  px-8 md:px-20 h-min-screen  bg-[#110A1A] text-slate-100 overflow-y">
      {/* <BackButton /> */}
      {movieDetails.backdrop && (
        <div className="">
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
          {movieDetails.title ? (
            <div className="flex flex-col justify-center items-center text-slate-400">
              <div className="flex flex-col  justify-center items-center ">
                {" "}
                <div className="w-full flex flex-row justify-center items-center  ">
                  <div className="w-full">
                    <h2 className="text-2xl font-semibold  text-slate-50 mr-4">
                      {" "}
                      {movieDetails.title}
                    </h2>
                    <div className="flex text-sm">
                      <p>
                        {movieDetails.release.slice(0, 4)}
                        <span className="text-sm mx-2">●</span>
                      </p>
                      <p>{movieDetails.runtime.toString()} mins</p>
                    </div>
                    <p className="font-semibold text-lg">{credits.director}</p>
                    <div className=" h-10 flex items-end">
                      <p className="font-semibold  flex justify-center items-center">
                        <span className=" mr-2  font-normal text-xl text-yellow-400">
                          <FaStar />
                        </span>
                        <span className=" text-xl text-zinc-100">
                          {movieDetails.voteAverage.toFixed(1)}
                        </span>
                      </p>
                    </div>
                    {/* <p>{movieDetails.runtime.toString()} mins</p> */}
                  </div>
                  <div className="flex flex-col w-full justify-center items-center gap-4 ">
                    <div className="relative ">
                      <img
                        className=" h-52 md:h-96 rounded-md w-auto"
                        src={movieDetails.poster}
                        alt="Movie Poster"
                        style={{ border: "1px solid grey" }}
                      />
                      <div
                        style={{
                          // border: "1px solid grey",
                          backdropFilter: "blur(4px)",
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                        }}
                        onClick={() => {
                          handleLikeButtonClicked(movieDetails.id);
                          if (!likes[movieDetails.id]) {
                            postAddToLikeList(
                              movieDetails.id,
                              "movie",
                              movieDetails.title
                            );
                          } else {
                            postRemoveFromLikeList(
                              movieDetails.id,
                              "movie",
                              movieDetails.title
                            );
                          }
                        }}
                        className="absolute top-3 right-5 -m-4 rounded-xl h-16 w-10 flex justify-center items-center hover:cursor-pointer"
                      >
                        {!likes[movieDetails.id] ? (
                          <div className="flex flex-col justify-center items-center">
                            <FaRegHeart className="h-5 w-5 text-red-600 mb-1" />
                            <p className="text-red-600 mb-1 ">Like</p>
                          </div>
                        ) : (
                          <div className="flex flex-col justify-center items-center">
                            <FaHeart className="h-5 w-5 text-red-600 mb-1" />
                            <p className="text-red-600 mb-1 font-semibold">
                              Like
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-full flex justify-center gap-4">
                      <button
                        onClick={() => {
                          handleButtonClicked(movieDetails.id); // Toggles like state
                          if (!watches[movieDetails.id]) {
                            postAddToWatchList(
                              movieDetails.id,
                              "movie",
                              movieDetails.title
                            ); // Adds to like list if not liked
                          } else {
                            postRemoveFromWatchList(
                              movieDetails.id,
                              "movie",
                              movieDetails.title
                            ); // Removes from like list if liked
                          }
                        }}
                        className="w-full h-10 bg-[#FF506C] flex justify-center items-center rounded-xl px-3 border-none"
                      >
                        {!watches[movieDetails.id] ? (
                          <FaPlus className="text-2xl text-gray-200" />
                        ) : (
                          <FaCheck className="text-2xl text-gray-200" />
                        )}
                        {!watches[movieDetails.id] ? (
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
                <div className="h-full lex flex-col justify-start md:justify-center items-start  w-full md:w-full ">
                  <div className="h-full pb-5" onClick={handleToggle}>
                    {!toggleExpanded ? (
                      <div>
                        <p className="mt-10 mb-2 font-medium text-lg">
                          {movieDetails.tagline}
                        </p>
                        <div
                          className={`md:w-full text-base font-light ${
                            !toggleExpanded ? "fade-out" : ""
                          }`}
                        >
                          {movieDetails.overview.slice(0, 200)}...
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="mt-10 mb-2 font-medium text-lg">
                          {movieDetails.tagline}
                        </p>
                        <div className="md:w-full font-light text-base">
                          {movieDetails.overview.slice(0, 600)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full flex h-20 justify-start mt-8 bg-slate-100  ">
                  {flatrateProviders ? (
                    <>
                      <h3 className="text-base">Watch it on:</h3>
                      {flatrateProviders}
                    </>
                  ) : (
                    <p>No providers in your area</p>
                  )}
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
      <div className="w-full h-60">
        <iframe
          className="border-none"
          src={`https://www.youtube-nocookie.com/embed/${videos}?rel=0&controls=0`}
          width="100%" // Adjust the width as needed
          height="100%"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      <div className="w-full pb-5 text-xl pt-20">
        <p>Actors</p>
      </div>
      <div className="grid grid-cols-3 justify-center items-center w-full">
        {credits.actors.map((actor, index) => (
          <div
            key={index}
            className="flex flex-col justify-center items-center p-2"
          >
            {actorImages[actor.personId] ? (
              <div className="w-24 h-24 rounded-full  overflow-hidden bg-gray-300">
                <img
                  src={`https://image.tmdb.org/t/p/w500${
                    actorImages[actor.personId]
                  }`}
                  alt={actor.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null; // Prevent looping
                    e.target.src = "path_to_default_image.jpg"; // Fallback image
                  }}
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-300 flex justify-center items-center">
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            )}
            <div className="  h-20">
              <p className="text-sm text-center mt-1 mb-2 font-semibold ">
                {actor.name}
              </p>
              <p className="text-xs text-center ">{actor.character}</p>
            </div>
          </div>
        ))}
      </div>
      <div className=" w-full pt-16 pb-10">
        <h2 className="text-left">Similar to {movieDetails.title}</h2>
      </div>
      <div className=" flex justify-center items-center w-full  ">
        {similar && similar.length > 0 && similar.poster != "" && (
          <SlideMenu>
            {similar.map((movie, index) => (
              <div
                key={index}
                className="inline-block justify-center items-center p-2 "
              >
                <Link href={`/movie/${encodeURIComponent(movie.id)}`}>
                  <img
                    className="h-80 rounded-xl hover:cursor-pointer"
                    src={`https://image.tmdb.org/t/p/w500${movie.poster}`}
                    alt="poster"
                  />
                </Link>
                <p className="h-20">{movie.title}</p>
              </div>
            ))}
          </SlideMenu>
        )}
      </div>
    </div>
  );
}
