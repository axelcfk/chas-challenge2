"use client";

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
  const [credits, setCredits] = useState({
    director: "",
    actors: [],
    otherCrew: [],
  });

  const movieAPI_KEY = "4e3dec59ad00fa8b9d1f457e55f8d473";
  const params = useParams();
  const movieId = params.movieId; // Get movie ID from the URL parameter

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

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!movieId) return;

      setLoading(true);
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}?api_key=${movieAPI_KEY}`
        );
        const data = await response.json();

        await postMovieToDatabase(data); // if it already exists it doesnt get added (see backend)

        setMovieDetails({
          id: data.id,
          title: data.title,
          overview: data.overview,
          voteAverage: data.vote_average,
          release: data.release_date,
          tagline: data.tagline,
          runtime: data.runtime,
          backdrop: `https://image.tmdb.org/t/p/w500${data.backdrop_path}`,
          poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
        });

        const creditsResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${movieAPI_KEY}`
        );
        const creditsData = await creditsResponse.json();
        setCredits({
          director: creditsData.crew.find((person) => person.job === "Director")
            ?.name,
          actors: creditsData.cast.slice(0, 6).map((actor) => ({
            // Only take the first six actors
            name: actor.name,
            personId: actor.id,
            character: actor.character,
            imagePath: actor.profile_path, // Assuming direct path is available; adjust based on API
          })),
          otherCrew: creditsData.crew
            .filter((person) =>
              ["Producer", "Screenplay", "Music"].includes(person.job)
            )
            .map((crew) => ({
              name: crew.name,
              job: crew.job,
            })),
        });

        fetchActorsImages(creditsData.cast.slice(0, 6));
      } catch (error) {
        console.error("Error fetching movie details:", error);
        setMovieDetails(null); // Handle errors by setting details to null
      } finally {
        setLoading(false);
      }
    };

    credits.actors.forEach((actor) => {
      console.log(`Actor Name: ${actor.name}, Person ID: ${actor.personId}`);
      // You can use `actor.personId` to fetch the actor's images or more details
    });

    fetchMovieDetails();
  }, [movieId]);

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
  }, []);

  useEffect(() => {
    async function fetchVideo() {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${movieAPI_KEY}`
        );

        const data = await response.json();
        console.log("videodata:", data.results[0].key);
        setVideos(data.results[1].key);
        return data.results;
      } catch (error) {
        console.error("Error fetching streaming services:", error);
        return {};
      }
    }
    fetchVideo();
  }, []);

  async function fetchActorsImages(actors) {
    const imageFetchPromises = actors.map((actor) =>
      fetch(
        `https://api.themoviedb.org/3/person/${actor.id}/images?api_key=${movieAPI_KEY}`
      )
        .then((response) => response.json())
        .then((data) => ({
          id: actor.id,
          image: data.profiles[0] ? data.profiles[0].file_path : null,
        }))
    );

    try {
      const imagesResults = await Promise.all(imageFetchPromises);
      const newActorImages = imagesResults.reduce((acc, result) => {
        acc[result.id] = result.image;
        return acc;
      }, {});
      setActorImages(newActorImages);
    } catch (error) {
      console.error("Error fetching actor images:", error);
    }
  }

  const isMovieLiked = likedMovies.some(
    (movie) => movie.id === movieDetails?.id
  );

  // if (loading) {
  //   return <div>Loading movie details...</div>;
  // }

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
  // console.log(likeButtonClicked);
  // console.log("Credit are:", credits.actors);
  // console.log("Credit actors ids are:", credits.actors[0].name);

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
                        className="absolute top-0 right-5 -m-4  rounded-full h-10 w-10 flex justify-center items-center hover:cursor-pointer"
                      >
                        {!likes[movieDetails.id] ? (
                          <FaRegHeart className="h-5 w-5 text-red-600" />
                        ) : (
                          <FaHeart className="h-5 w-5 text-red-600" />
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
                        {/* <p className="text-green-500 text-2xl">
                          {isMovieLiked
                            ? "this movie is in the like list"
                            : "this movie is not in the like list"}
                        </p> */}
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
                  {/* <p>{credits.actors}</p> */}

                  {/* <p
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
                  ) : null} */}
                </div>
                <div className="w-full flex  justify-end mt-8">
                  {/* <p>{credits.actors}</p> */}

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
                  {/* <div className=" h-10 flex items-end">
                    <p className="font-semibold  flex justify-center items-center">
                      <span className=" mr-2  font-normal text-xl text-yellow-400">
                        <FaStar />
                      </span>
                      <span className=" text-xl text-zinc-100">
                        {movieDetails.voteAverage.toFixed(1)}
                      </span>
                    </p>
                  </div> */}
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
          src={`https://www.youtube-nocookie.com/embed/${videos}`}
          width="100%" // Adjust the width as needed
          height="100%"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          // allowfullscreen
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
    </div>
  );
}
