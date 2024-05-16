"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FaPlus, FaRegHeart, FaHeart, FaCheck, FaStar } from "react-icons/fa";
import { SlArrowLeft, SlUser, SlArrowDown } from "react-icons/sl";

import { useEffect, useState, useRef } from "react";
import {
  postAddToLikeList,
  postAddToWatchList,
  postMovieToDatabase,
  postRemoveFromLikeList,
  postRemoveFromWatchList,
} from "../../utils";
import { checkLikeList } from "../../utils";
import SlideMenu from "../../components/SlideMenu";
import ListModal from "@/app/components/ListModal";

export default function MoviePage() {
  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likedMovies, setLikedMovies] = useState([]);
  const [noResult, setNoResult] = useState(false);
  const [toggleExpanded, setToggleExpanded] = useState(false);
  const [actorsToggle, setActorsToggle] = useState(false);
  const [likeButtonClicked, setLikeButtonClicked] = useState(false);
  // const [seen, setSeen] = useState(false);
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
  const [userLists, setUserLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);

  const params = useParams();
  const movieId = params.movieId;
  const router = useRouter();

  const parallaxRef = useRef(null);

  const handleNavigation = () => {
    router.back();
  };

  const serviceLogos = {
    Netflix: "/Netflix.svg",
    "HBO Max": "/HBO1.svg",
    Viaplay: "/Viaplay.svg",
    "Amazon Prime Video": "/PrimeVideo.svg",
    "Disney Plus": "/Disney2.webp",
    "Tele2 Play": "/tele2play.png",
    "Apple TV": "/AppleTv.svg",
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

  const handleOpenModal = () => {
    setModalOpen(!isModalOpen);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const speed = 0.2;
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translateY(${
          scrollTop * speed
        }px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  //FETCHA ALLA MOVIE DETAILS FRÅN BACKEND

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
        {/* <h3 className="font-semibold text-3xl">Exciting stuff!</h3> */}
        <div className="loader m-10"></div>
        {/* <p className="font-semibold text-xl">Finding a movie match ... </p> */}
      </div>
    );
  }

  if (!movieDetails) {
    return (
      <div className="h-lvh flex justify-center items-center">
        <LoadingIndicator />
      </div>
    );
  }

  console.log("similar object", similar);
  // console.log(
  //   "providers are??:",
  //   movieDetails.providers.flatrate[0].provider_name
  // );

  const flatrateProviders = movieDetails.providers?.flatrate
    ? movieDetails.providers.flatrate
        .filter((provider) => provider.provider_name)
        .map((provider) => (
          <div
            key={provider.provider_id}
            className="bg-slate-200 rounded-full h-12 w-full flex justify-evenly items-center"
          >
            <img
              className="h-6"
              src={serviceLogos[provider.provider_name]}
              alt={provider.provider_name}
            />
          </div>
        ))
    : null;

  const rentProviders = movieDetails.providers?.rent
    ? movieDetails.providers.rent
        .filter((provider) => provider.provider_name)
        .map((provider) => (
          <div
            key={provider.provider_id}
            className="bg-slate-200 rounded-full h-12 w-full flex justify-evenly items-center"
          >
            <img
              className="h-6"
              src={serviceLogos[provider.provider_name]}
              alt={provider.provider_name}
            />
          </div>
        ))
    : null;

  const buyProviders = movieDetails.providers?.buy
    ? movieDetails.providers.buy
        .filter((provider) => provider.provider_name)
        .map((provider) => (
          <div
            key={provider.provider_id}
            className="bg-slate-200 rounded-full h-12 w-full flex justify-evenly items-center"
          >
            <img
              className="h-6"
              src={serviceLogos[provider.provider_name]}
              alt={provider.provider_name}
            />
          </div>
        ))
    : null;

  const handleAddMovieToList = async (listId) => {
    try {
      const response = await fetch(
        `http://localhost:3010/me/lists/add/${listId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ movieId: movieDetails.id }),
        }
      );
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error("Failed to add movie to list:", error);
    }
    handleCloseModal();
  };

  const handleCreateNewList = async () => {
    try {
      const response = await fetch(`http://localhost:3010/me/lists/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newListName, movieId: movieDetails.id }),
      });
      const data = await response.json();
      setUserLists([...userLists, { id: data.listId, name: newListName }]);
      setNewListName("");
    } catch (error) {
      console.error("Failed to create new list:", error);
    }
    handleCloseModal();
  };

  return (
    <div className=" flex flex-col justify-center items-center md:items-start pt-20  h-min-screen  bg-[#110A1A] text-slate-100 overflow-y">
      {/* <BackButton /> */}
      <button
        className="bg-transparent border-none absolute top-0 left-0 m-8 px-4 py-2 z-10 text-slate-100 text-xl hover:cursor-pointer"
        onClick={handleNavigation}
      >
        <SlArrowLeft />
      </button>

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
      ) : (
        <div className="h-full flex flex-col justify-center items-center  relative z-10 px-8">
          {movieDetails.title ? (
            <div className="flex flex-col justify-center items-center text-slate-400 ">
              <div className="flex flex-col  justify-center items-center ">
                {" "}
                <div
                  className="w-full flex flex-row justify-center items-center parallax-container rounded-lg p-5"
                  // style={{
                  //   backdropFilter: "blur(15px)",
                  //   backgroundColor: "rgba(0, 0, 0, 0.1)",
                  // }}
                  ref={parallaxRef}
                >
                  <div className="w-full ">
                    <h2 className=" font-semibold  text-slate-50 ">
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
                    <p className="font-semibold uppercase text-sm">
                      {credits.director}
                    </p>
                    <div className=" h-10 flex items-end">
                      <p className="font-semibold  flex justify-center items-center">
                        <span className={`mr-2  font-normal  text-yellow-400`}>
                          <FaStar />
                        </span>
                        <span
                          className={`${
                            movieDetails.voteAverage === 0
                              ? "text-sm"
                              : "text-xl"
                          } text-zinc-100`}
                        >
                          {movieDetails.voteAverage === 0
                            ? "NO RATING AVAILABLE"
                            : movieDetails.voteAverage.toFixed(1)}
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
                        style={{ border: "0.5px solid grey" }}
                      />
                      <div
                        style={{
                          border: "0.9px solid grey",
                          backdropFilter: "blur(4px)",
                          backgroundColor: "rgba(0, 0, 0, 0.3)",
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
                        className="absolute top-0 right-0 rounded-tr-md rounded-bl-md h-16 w-12 flex justify-center items-center hover:cursor-pointer"
                      >
                        {!likes[movieDetails.id] ? (
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
                    <div className="w-full flex flex-col justify-center items-center gap-4 ">
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
                        className={`w-full h-10 ${
                          !watches[movieDetails.id]
                            ? "bg-[#3D3B8E]"
                            : "bg-green-600"
                        } flex justify-center items-center rounded-full px-3 border-none`}
                      >
                        {!watches[movieDetails.id] ? (
                          <FaPlus className="text-2xl text-gray-200" />
                        ) : (
                          <FaCheck className="text-2xl text-gray-200" />
                        )}
                        {!watches[movieDetails.id] ? (
                          <p className="pl-2 w-full text-sm font-light text-gray-200 flex justify-between items-center">
                            <span className="pr-4">ADD TO WATCHLIST</span>
                            <span
                              onClick={handleOpenModal}
                              className="pl-4 border-l-2 border-slate-200 flex items-center"
                            >
                              <SlArrowDown />
                            </span>
                          </p>
                        ) : (
                          <p className="pl-2 w-full text-sm font-light text-gray-200 flex justify-between items-center">
                            <span className="pr-4">ADDED</span>
                            <span
                              onClick={handleOpenModal}
                              className="pl-4 border-l-2 border-slate-200 flex items-center"
                            >
                              <SlArrowDown />
                            </span>
                          </p>
                        )}
                      </button>

                      {/* <div
                        className={`w-40 -mt-5  bg-[#3D3B8E] flex justify-center items-center rounded-b-xl border-none  ${
                          isModalOpen ? "h-40" : "h-0"
                        }`}
                      ></div> */}
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
                <div className=" w-full mt-10 mb-10 ">
                  <div className="w-full  ">
                    {flatrateProviders && (
                      <h3 className="text-sm text-slate-100 uppercase">
                        STREAM ON:
                      </h3>
                    )}
                  </div>
                  <div className=" grid grid-cols-2 gap-2 justify-center items-center mt-2  mb-16 ">
                    {flatrateProviders ? (
                      <>{flatrateProviders}</>
                    ) : (
                      <p className="uppercase">
                        No streaming providers in your area
                      </p>
                    )}
                  </div>
                  <div className="w-full  ">
                    {rentProviders && (
                      <h3 className="text-sm text-slate-100 uppercase">
                        BUY AND RENT ON:
                      </h3>
                    )}
                  </div>
                  <div className=" grid grid-cols-3 justify-center items-center mt-2  mb-16">
                    {rentProviders ? (
                      <>{rentProviders}</>
                    ) : (
                      <p>No providers in your area</p>
                    )}
                  </div>
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
      {/* <div className=" w-screen  flex justify-center items-center"> */}
      <div className="relative w-full flex flex-col justify-center items-center bg-[#1B1725] h-80 py-16 ">
        {/* <div className="absolute inset-x-0 top-0 h-16 gradient-top"></div>
        <div className="absolute inset-x-0 bottom-0 h-16 gradient-bottom"></div> */}
        <iframe
          className="border-none z-10 rounded-md w-[90%] h-[90%] md:w-[30%]"
          src={`https://www.youtube-nocookie.com/embed/${videos}?rel=0&controls=0`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      {/* </div> */}

      <div className="w-full pb-5 text-xl pt-16 ">
        <h2 className="text-xl px-8 font-normal">ACTORS</h2>
      </div>
      <div className="px-5 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-6">
        {credits.actors.map((actor, index) => (
          <div
            key={index}
            className="w-full flex flex-col justify-between items-center "
          >
            {actorImages[actor.personId] ? (
              <Link href={`/actor/${encodeURIComponent(actor.personId)}`}>
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-300">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${
                      actorImages[actor.personId]
                    }`}
                    alt={actor.name}
                    className="w-full h-full object-cover "
                    onError={(e) => {
                      e.target.onerror = null; // Prevent looping
                      e.target.src = "path_to_default_image.jpg"; // Fallback image
                    }}
                  />
                </div>
              </Link>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-300 flex justify-center items-center">
                <span className=" text-gray-500 text-6xl ">
                  <SlUser />
                </span>
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
      <div className="bg-[#1B1725] w-full py-16 ">
        <div className=" w-full ">
          <h2 className="px-8 text-xl uppercase font-normal">
            SIMILAR TO {movieDetails.title}
          </h2>
        </div>
        <div className=" flex justify-center items-center ">
          {similar && similar.length > 0 && similar.poster != "" && (
            <SlideMenu>
              {similar.map((movie, index) => (
                <div
                  key={index}
                  className="inline-block justify-center items-center pl-8 pt-10 "
                >
                  <Link href={`/movie/${encodeURIComponent(movie.id)}`}>
                    <img
                      style={{ border: "0.5px solid grey" }}
                      className="h-80 rounded-xl hover:cursor-pointer"
                      src={`https://image.tmdb.org/t/p/w500${movie.poster}`}
                      alt="poster"
                    />
                  </Link>
                  <p className="">{movie.title}</p>
                </div>
              ))}
            </SlideMenu>
          )}
        </div>
      </div>
    </div>
  );
}
