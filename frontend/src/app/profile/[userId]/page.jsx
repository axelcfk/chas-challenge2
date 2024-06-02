"use client";

import "./profile.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchTMDBMovieDetails } from "@/app/utils";
import SlideMenu, { SlideMenuMovieCard } from "@/app/components/SlideMenu";
import WatchListForProfile from "@/app/components/WatchListForProfile";
import Link from "next/link";
import ProtectedRoute from "@/app/components/ProtectedRoute";

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [userLists, setUserLists] = useState([]);
  const [seenMovies, setSeenMovies] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [activeTab, setActiveTab] = useState("Profile");
  const [loadingLists, setLoadingLists] = useState(true);
  const [loadingSeenMovies, setLoadingSeenMovies] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const router = useRouter();
  const tabNames = ["Profile", "Watchlist", "My lists"];
  const tabIndex = tabNames.indexOf(activeTab);
  const removeCustomList = async (listId) => {
    try {
      const response = await fetch(`http://localhost:3010/me/lists/${listId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }
      setUserLists(userLists.filter((list) => list.id !== listId));
    } catch (error) {
      console.error("Failed to delete list", error);
    }
  };

  const removeMovieFromCustomList = () => {};

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const userId = localStorage.getItem("userId");
      console.log("userId:", localStorage.getItem("userId"));
      console.log("token:", localStorage.getItem("token"));

      try {
        const response = await fetch(`http://localhost:3010/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP status ${response.status}`);
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    const fetchUserLists = async () => {
      setLoadingLists(true);
      try {
        const response = await fetch("http://localhost:3010/me/lists");
        const data = await response.json();

        const listsWithMovieDetails = await Promise.all(
          data.map(async (list) => {
            const moviesWithDetails = await Promise.all(
              list.movies.map(async (movieId) => {
                const movie = await fetchTMDBMovieDetails(movieId);
                return {
                  id: movie.id,
                  title: movie.title,
                  overview: movie.overview,
                  poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`, // Construct full URL
                };
              })
            );
            return { ...list, movies: moviesWithDetails };
          })
        );
        setUserLists(listsWithMovieDetails);
        console.log("Fetched user lists:", listsWithMovieDetails);
      } catch (error) {
        console.error("Failed to fetch user lists", error);
      } finally {
        setLoadingLists(false);
      }
    };

    fetchUserLists();
  }, []);

  useEffect(() => {
    const fetchSeenMovies = async () => {
      setLoadingSeenMovies(true);
      try {
        const userId = localStorage.getItem("userId");
        const response = await fetch(
          `http://localhost:3010/api/seen/${userId}`
        );
        const data = await response.json();
        console.log("Fetched seen list:", data);

        const moviesWithDetails = await Promise.all(
          data.map(async (movieEntry) => {
            console.log("Fetching details for movie ID:", movieEntry.movie_id);
            const movie = await fetchTMDBMovieDetails(movieEntry.movie_id);
            return {
              id: movie.id,
              title: movie.title,
              overview: movie.overview,
              poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            };
          })
        );
        setSeenMovies(moviesWithDetails);
        console.log("Fetched seen movies:", moviesWithDetails);
      } catch (error) {
        console.error("Failed to fetch seen movies", error);
      } finally {
        setLoadingSeenMovies(false);
      }
    };

    fetchSeenMovies();
  }, []);

  // Hämta favoritfilmerna
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const response = await fetch(
          `http://localhost:3010/favorites/${userId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP status ${response.status}`);
        }
        const data = await response.json();
        console.log("Favorite movie IDs fetched from DB:", data);
  
        const moviesWithDetails = await Promise.all(
          data.map(async (movie) => {
            try {
              const movieDetails = await fetchTMDBMovieDetails(movie.movie_id);
              console.log("Fetched details for movie ID:", movie.movie_id, movieDetails);
              return {
                ...movie,
                title: movieDetails.title,
                poster: `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`,
                overview: movieDetails.overview,
              };
            } catch (error) {
              console.error(`Failed to fetch details for movie ID ${movie.movie_id}:`, error);
              return null;
            }
          })
        );
  
        setFavorites(moviesWithDetails.filter(movie => movie !== null));
      } catch (error) {
        console.error("Failed to fetch favorites", error);
      }
    };
    fetchFavorites();
  }, []);

  useEffect(() => {
    const storedTab = localStorage.getItem("activeTab");
    if (storedTab) {
      setActiveTab(storedTab);
    }
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("activeTab", tab);
  };

  const handleCreateNewList = async () => {
    try {
      const response = await fetch(`http://localhost:3010/me/lists/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newListName, movieId: null }),
      });
      const data = await response.json();
      setUserLists([
        ...userLists,
        { id: data.listId, name: newListName, movies: [] },
      ]);
      setNewListName("");
    } catch (error) {
      console.error("Failed to create new list:", error);
    }
  };

  return (
    <ProtectedRoute>
      <main className="mt-8">
        <div className="flex items-center flex-col pb-12 bg-bg-[#110A1A]">
          {userData ? (
            <div className="flex items-center flex-col space-y-5 mt-12">
              <button className="bg-transparent border-none hover:cursor-pointer">
                <img
                  src="/profile-user.svg"
                  className="h-28"
                  alt="User Profile"
                />
              </button>
              <h1>{userData.username}</h1>
            </div>
          ) : (
            <p>Loading user data...</p>
          )}
        </div>
        <div className="menu flex flex-row justify-between px-8 items-center">
          {tabNames.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`  hover:cursor-pointer h-16 w-28 rounded-full text-lg font-semibold  ${
                activeTab === tab
                  ? "bg-slate-100 text-slate-950 border-none"
                  : "bg-transparent text-slate-200 border-2 border-solid box-border border-[#3D3B8E]"
              }`}
            >
              <h4>{tab}</h4>
            </button>
          ))}
        </div>
        <div
          className="tabs-container"
          style={{ transform: `translateX(${tabIndex * -100}%)` }}
        ></div>
        {activeTab === "Profile" && (
          <div className="gradient-border-top bg-[#201430] p-8 mt-8">
            <div className="my-8">
              <div className="flex flex-row justify-between">
                <h3 className="text-2xl">My favorites</h3>
                <button
                  onClick={() =>
                    router.push("http://localhost:3000/choose-favorites")
                  }
                >
                  Edit
                </button>
              </div>
              <SlideMenu>
                {favorites.map((movie) => (
                  <SlideMenuMovieCard
                    key={movie.id}
                    id={movie.id}
                    title={movie.title}
                    poster={movie.poster}
                    overview={movie.overview}
                  />
                ))}
              </SlideMenu>
            </div>
            <div className="mb-8">
              <h3 className="text-2xl">Recent activity</h3>
              <p className="text-sm"></p>
              <SlideMenu>
                {seenMovies.map((movie) => (
                  <SlideMenuMovieCard
                    key={movie.id}
                    id={movie.id}
                    title={movie.title}
                    poster={movie.poster}
                    overview={movie.overview}
                  />
                ))}
              </SlideMenu>
            </div>
          </div>
        )}
        {activeTab === "Watchlist" && (
          <div className="gradient-border-top bg-[#201430] p-8 mt-8">
            <div className="py-8">
              <WatchListForProfile profilePage={true} />
            </div>
          </div>
        )}
        {activeTab === "My lists" && (
          <div className="gradient-border-top bg-[#201430] p-8 mt-8">
            <div className="py-8">
              {/* {/* <button
                onClick={handleCreateNewList}
                className="py-2 px-4 bg-slate-100 border-none text-slate-900 font-semibold h-12 rounded-full text-lg"
              >
                Create new list
              </button> */}

              {loadingLists ? (
                <p>Loading lists...</p>
              ) : (
                <div className="mt-4">
                  {userLists.length === 0 ? (
                    <p className="text-2xl">No lists created</p>
                  ) : (
                    userLists.map((list) => (
                      <div key={list.id} className="mb-10">
                        <div className="my-4 flex flex-row justify-between">
                          <Link
                            href={`/my-customlist/${list.id}`}
                            className="no-underline text-white"
                          >
                            <h2 className="text-xl font-bold hover:underline">
                              {list.name}
                            </h2>
                          </Link>
                          <div className="h-8 float-end">
                            <button
                              onClick={() => removeCustomList(list.id)}
                              className=""
                            >
                              Delete list
                            </button>
                          </div>
                        </div>
                        {list.movies.length === 0 ? (
                          <p className="text-2xl">No movies in this list</p>
                        ) : (
                          <SlideMenu>
                            {list.movies.map((movie) => (
                              <SlideMenuMovieCard
                                key={movie.id}
                                id={movie.id}
                                title={movie.title}
                                poster={movie.poster}
                                overview={movie.overview}
                              />
                            ))}
                          </SlideMenu>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
