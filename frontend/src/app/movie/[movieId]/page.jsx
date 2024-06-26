"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import {
  FaPlus,
  FaRegHeart,
  FaHeart,
  FaCheck,
  FaStar,
  FaEye,
} from "react-icons/fa";
import { SlArrowLeft, SlUser, SlArrowDown } from "react-icons/sl";
import { useEffect, useState, useRef } from "react";
import {
  fetchWatchAndLikeList,
  host,
  postAddToLikeList,
  postAddToWatchList,
  postMovieToDatabase,
  postRemoveFromLikeList,
  postRemoveFromWatchList,
} from "../../utils";
import { checkLikeList } from "../../utils";
import SlideMenu from "../../components/SlideMenu";
import ProtectedRoute from "@/app/components/ProtectedRoute";

export default function MoviePage() {
  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likedMovies, setLikedMovies] = useState([]);
  const [noResult, setNoResult] = useState(false);
  const [toggleExpanded, setToggleExpanded] = useState(false);
  const [actorsToggle, setActorsToggle] = useState(false);
  const [likeButtonClicked, setLikeButtonClicked] = useState(false);
  const [seen, setSeen] = useState({});
  const [watches, setWatches] = useState(false);
  const [likes, setLikes] = useState(false);
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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const params = useParams();
  const movieId = params.movieId;
  const router = useRouter();

  const parallaxRef = useRef(null);

  const handleNavigation = () => {
    router.back();
  };

  const serviceLogos = {
    Netflix: "/Netflix.svg",
    Max: "/Max.svg",
    Viaplay: "/Viaplay.svg",
    "Amazon Prime Video": "/PrimeVideo.svg",
    "Disney Plus": "/Disney2.webp",
    "Tele2 Play": "/tele2play.png",
    "Apple TV": "/AppleTv.svg",
    SVT: "/SVTPlay.svg",
    TV4Play: "/TV4Play.svg",
    "Discovery+": "/Discovery+.svg",
    "Google Play Movies": "/Play.png",
    "Rakuten TV": "/Rakuten_logo.svg",
    Blockbuster: "/Blockbuster.png",
    "SF Anytime": "/SF.svg",
    "Amazon Video": "/PrimeVideo.svg",
    "Microsoft Store": "/Microsoft.svg",
    MUBI: "/Mubi.svg",
    SkyShowtime: "/SkyShowtime.svg",
    "Apple TV +": "/AppleTVPlus.svg",
  };

  function handleToggle() {
    setToggleExpanded(!toggleExpanded);
  }

  function handleActorsToggle() {
    setActorsToggle(!actorsToggle);
  }

  function handleButtonClicked(id) {
    
    /* setWatches((prevWatches) => ({
      ...prevWatches,
      [id]: !prevWatches[id],
    })); */
    setWatches(!watches);
  }
  function handleLikeButtonClicked(id) {
    setLikeButtonClicked(!likeButtonClicked);
    /* setLikes((prevLikes) => ({
      ...prevLikes,
      [id]: !prevLikes[id],
    })); */
    setLikes(!likes);
  }

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleToggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleAddMovieToList = async (listId) => {
    try {
      const response = await fetch(`${host}/api/me/lists/add/${listId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ movieId: movieDetails.id }),
      });
      const data = await response.json();
      console.log(`Added movie to list ${listId}:`, data);
      console.log(data.message);
    } catch (error) {
      console.error("Failed to add movie to list:", error);
    }
    handleCloseModal();
  };

  const fetchUserLists = async () => {
    try {
      const response = await fetch(`${host}/api/me/lists`);
      const data = await response.json();
      setUserLists(data);
      console.log("Fetcheded user lists:", data);
    } catch (error) {
      console.error("Failed to fetch user lists:", error);
    }
  };

  const handleCreateNewList = async () => {
    try {
      const response = await fetch(`${host}/api/me/lists/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newListName, movieId: movieDetails.id }),
      });
      const data = await response.json();
      console.log("Created new list:", data);
      setUserLists([...userLists, { id: data.listId, name: newListName }]);
      setNewListName("");
    } catch (error) {
      console.error("Failed to create new list:", error);
    }
    handleCloseModal();
  };

  const handleAddToSeenList = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${host}/api/api/toggleSeen`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, movieId }),
      });
      const data = await response.json();
      setSeen((prevSeen) => ({
        ...prevSeen,
        [movieId]: data.seen,
      }));
    } catch (error) {
      console.error("Error toggling seen status", error);
    }
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
        const tokenStorage = localStorage.getItem("token");
        const response = await fetch(`${host}/api/fetchingmoviepagedetails`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ movieId, token: tokenStorage }),
        });
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
          console.log("movieDetails are", movieDetails);
          setSimilar(data.movieDetails.similarMovies);
          console.log("similar movies are:", similar);
          console.log("actorImages:", actorImages);
          setActorImages(
            data.movieDetails.credits.actors.reduce((acc, actor) => {
              acc[actor.personId] = actor.imagePath;
              return acc;
            }, {})
          );
          setLikes(data.isLiked)
          setWatches(data.isInWatchList)
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
  //const [fetchedLikedMovies, setFetchedLikedMovies] = useState(false);
/* 
  useEffect(() => {
    const fetchLikeList = async () => {
      try {
        const movies = await fetchWatchAndLikeList();

        //console.log(movies[0].movie_id);

        setLikedMovies(movies);

       
      } catch (error) {
        console.error("Failed to fetch liked movies list");
      }
    };

    fetchLikeList();
  }, [movieId]); */

  //console.log(likeButtonClicked);

  /* useEffect(() => {
    console.log("likedmovies: ", likedMovies);
    if (likedMovies.length > 0) {
      likedMovies.map((movie) => {
        if (movie.movie_id === movieId) {
          setLikes(isLiked);
        }
      });
    }
  }, [likedMovies]); */

  /*  useEffect(() => {

    if (likedMovies.some((movie) => movie.movie_id === movieId)) {
      setLikeButtonClicked(true);
    }
  }, [fetchedLikedMovies])
  
 */

  useEffect(() => {
    fetchUserLists();
  }, []);

  /* const isMovieLiked = likedMovies.some(
    (movie) => movie.movie_id === movieDetails?.id
  ); */

  function LoadingIndicator() {
    return (
      <div className="loading-indicator ">
        {/* <h3 className="font-semibold text-3xl">Exciting stuff!</h3> */}
        <div className="loader m-10"></div>
        {/* <p className="font-semibold text-xl">Finding a movie match ... </p> */}
      </div>
    );
  }

  if (!movieDetails || likedMovies.length > 0) {
    return (
      <div className="h-lvh flex justify-center items-center">
        <LoadingIndicator />
      </div>
    );
  }

  if (likeButtonClicked === false) {
    <div>Loading...</div>;
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
              className="h-4"
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
              className="h-4"
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

  console.log("button clicked", likeButtonClicked);

  /*  <ProtectedRoute>
    </ProtectedRoute>
 */

  return (
    <div className=" flex flex-col justify-center items-center md:items-start pt-20  h-min-screen  bg-[#110A1A] text-slate-100 overflow-y">
      <button
        className="bg-transparent border-none absolute top-0 left-0 m-8 px-4 my-24 z-40 text-slate-100 text-xl hover:cursor-pointer"
        onClick={handleNavigation}
      >
        <SlArrowLeft />
      </button>

      {movieDetails.backdrop && (
        <div className="">
          <img
            id="img"
            className="absolute top-0 left-0 w-full object-cover z-0 "
            src={movieDetails.backdrop}
            alt="Movie Backdrop"
          />
          <div className="gradient"></div>
        </div>
      )}

      <div className="h-full flex flex-col justify-center items-center relative z-10 px-8">
        {movieDetails.title ? (
          <div className="flex flex-col justify-center items-center text-slate-400 ">
            <div className="flex flex-col  justify-center items-center ">
              <div
                className="w-full flex flex-row justify-center items-center parallax-container rounded-lg p-5"
                ref={parallaxRef}
              >
                <div className="w-full ">
                  <h2 className=" font-semibold  text-slate-50 ">
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
                      <span className={`mr-2 font-normal text-yellow-400`}>
                        <FaStar />
                      </span>
                      <span
                        className={`${
                          movieDetails.voteAverage === 0 ? "text-sm" : "text-xl"
                        } text-zinc-100`}
                      >
                        {movieDetails.voteAverage === 0
                          ? "NO RATING AVAILABLE"
                          : movieDetails.voteAverage.toFixed(1)}
                      </span>
                    </p>
                  </div>
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
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                      }}
                      onClick={() => {
                        handleLikeButtonClicked(movieDetails.id);
                        if (!likes) {
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
                      {!likes ? (
                        <div className="flex flex-col justify-center items-center">
                          <FaRegHeart className="h-5 w-5 text-slate-100 mb-1" />
                          <p className="text-slate-100 mb-1 text-sm">Like</p>
                        </div>
                      ) : (
                        <div className="flex flex-col justify-center items-center">
                          <FaHeart className="h-5 w-5 text-[#CFFF5E] mb-1" />
                          <p className="text-[#CFFF5E] mb-1 text-sm font-archivo font-semibold">
                            Liked
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleAddToSeenList}
                    className={`bg-transparent text-white border-none flex items-center ${
                      seen[movieId] ? "text-[#CFFF5E]" : "text-white"
                    }`}
                  >
                    {!seen[movieId] ? (
                      <div className="mb-8 flex justify-end items-center">
                        <FaEye color="white" size={24} />
                        <p className="font-semibold font-archivo ml-2">
                          Mark as seen
                        </p>
                      </div>
                    ) : (
                      <div className="mb-8 flex justify-center items-center ">
                        <FaEye color="#CFFF5E" size={24} />
                        <p className="font-semibold font-archivo ml-2 text-[#CFFF5E]">
                          Seen
                        </p>
                      </div>
                    )}
                  </button>
                  <div className="w-full flex flex-col justify-center items-center gap-4">
                    <div className="absolute left-4 right-4 mt-8 md:w-1/4 md:absolute md:left-[60%]">
                      <button
                        onClick={() => {
                          handleButtonClicked(movieDetails.id);
                          if (!watches) {
                            postAddToWatchList(
                              movieDetails.id,
                              "movie",
                              movieDetails.title
                            );
                          } else {
                            postRemoveFromWatchList(
                              movieDetails.id,
                              "movie",
                              movieDetails.title
                            );
                          }
                        }}
                        className={`w-full h-10 ${
                          !watches
                            ? "bg-transparent "
                            : "bg-[#CFFF5E] border-none"
                        } flex justify-center items-center rounded-full px-3  border-2 border-solid border-white`}
                      >
                        {!watches ? (
                          <FaPlus className="text-xl text-gray-200" />
                        ) : (
                          <FaCheck className="text-xl text-slate-950" />
                        )}
                        {!watches ? (
                          <p className="pl-2 w-full text-sm font-light text-white flex justify-between items-center">
                            <span className="pr-4 font-archivo font-bold">
                              WATCHLIST
                            </span>
                          </p>
                        ) : (
                          <p className="pl-2 w-full text-sm font-light text-slate-950 flex justify-between items-center">
                            <span className="pr-4 font-archivo font-bold">
                              ADDED
                            </span>
                          </p>
                        )}
                      </button>
                      <button
                        onClick={handleToggleDropdown}
                        className={`absolute right-0 border-l-2 w-12 border-t-0 border-b-0 border-r-0 rounded-tr-full rounded-br-full ${
                          !watches
                            ? "border-x-white"
                            : "border-x-black"
                        } top-0 h-10 flex items-center justify-center bg-transparent text-slate-950 ${
                          !watches && "text-white"
                        }  cursor-pointer px-3`}
                      >
                        <SlArrowDown fontFamily="archivo" fontWeight={600} />
                      </button>
                      {dropdownOpen && (
                        <div
                          className="absolute left-4 right-4 mt-2  bg-white border rounded shadow-lg z-50"
                          style={{
                            border: "0.9px solid grey",

                            backdropFilter: "blur(10px)",
                            backgroundColor: "rgba(0, 0, 0, 0.3)",
                          }}
                        >
                          <ul className="no-list-style">
                            {userLists.map((list) => (
                              <li
                                key={list.id}
                                className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                onClick={() => handleAddMovieToList(list.id)}
                              >
                                {list.name}
                              </li>
                            ))}
                            <li
                              className=" text-slate-50  text-xl font-semibold font-archivo px-4 py-2  cursor-pointer"
                              onClick={handleOpenModal}
                            >
                              Create New List
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-full mt-16 flex-col justify-start md:justify-center items-start  w-full md:w-full ">
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
                <div className=" grid grid-cols-3 gap-2 justify-center items-center mt-2  mb-16 ">
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
                <div className=" grid grid-cols-3 gap-2 justify-center items-center mt-2  mb-16">
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
      <div className="relative w-full  flex flex-col justify-center items-center  bg-[#1B1725] h-80 py-16 ">
        <iframe
          className="border-none z-10 rounded-md w-[90%] h-[90%] md:w-[30%]"
          src={`https://www.youtube-nocookie.com/embed/${videos}?rel=0&controls=0`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      <div className="w-full pb-5 text-xl pt-16 ">
        <h2 className="text-xl px-8 font-archivo font-extrabold">ACTORS</h2>
      </div>
      <div className="px-5 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-6">
        {credits.actors.map((actor, index) => (
          <div
            key={index}
            className="w-full flex flex-col justify-between items-center"
          >
            {actorImages[actor.personId] ? (
              <Link href={`/actor/${encodeURIComponent(actor.personId)}`}>
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-300 hover:border-4 hover:border-blue-500 transition-all duration-300">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${
                      actorImages[actor.personId]
                    }`}
                    alt={actor.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "path_to_default_image.jpg";
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
          <h2 className="px-8 text-xl uppercase font-archivo font-extrabold">
            You may also like
          </h2>
        </div>
        <div className=" flex justify-center items-center ">
          {similar && similar.length > 0 && (
            <SlideMenu>
              {similar
                .filter((movie) => movie.poster) // filtrera posters utan bild
                .map((movie, index) => (
                  <div
                    key={index}
                    className="inline-block justify-center items-center pl-8 pt-10 h-full  "
                  >
                    <Link href={`/movie/${encodeURIComponent(movie.id)}`}>
                      <img
                        style={{ border: "0.5px solid grey" }}
                        className="h-80  rounded-xl hover:cursor-pointer"
                        src={`https://image.tmdb.org/t/p/w500${movie.poster}`}
                        alt="poster"
                      />
                    </Link>
                    <p className=" w-full  text-wrap">{movie.title}</p>
                  </div>
                ))}
            </SlideMenu>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div
            className="flex flex-col justify-center items-start p-6 rounded-2xl shadow-lg w-96"
            style={{
              border: "0.9px solid grey",
              backdropFilter: "blur(30px)",

              background: "rgba(17, 10, 26, 0.9)",
            }}
          >
            <h2 className="text-xl text-left font-bold font-archivo mb-4 text-white">
              Create New List
            </h2>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="w-full pl-4 h-12 mb-4 border rounded-full font-semibold font-archivo text-lg"
              placeholder="List Name"
            ></input>
            <button
              onClick={handleCreateNewList}
              className="w-96  h-12 bg-[#CFFF5E] text-slate-950 rounded-full font-archivo font-bold text-lg border-none"
            >
              Create
            </button>
            <button
              onClick={handleCloseModal}
              className="w-96 h-12 mt-2 text-gray-600 rounded-full font-archivo font-bold text-lg border-none"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
