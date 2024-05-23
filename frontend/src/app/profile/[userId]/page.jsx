"use client";

import "./profile.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchTMDBMovieDetails } from "@/app/utils";
import SlideMenu, { SlideMenuMovieCard } from "@/app/components/SlideMenu";
import WatchListForProfile from "@/app/components/WatchListForProfile";
import Link from "next/link";

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [userLists, setUserLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [activeTab, setActiveTab] = useState("Profile");
  const [loadingLists, setLoadingLists] = useState(true);
  const router = useRouter();
  const tabNames = ["Profile", "Watchlist", "My lists"];
  const tabIndex = tabNames.indexOf(activeTab);

  const removeCustomList = () => {};

  const removeMovieFromCustomList = () => {};

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const userId = localStorage.getItem("userId");

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

  const handleTabClick = (tab) => {
    setActiveTab(tab);
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
    <main>
      <div className="bg-[#110A19] flex items-center flex-col pb-12">
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
      <div className="menu bg-[#110A19] flex flex-row justify-between items-center">
        {tabNames.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`text-white border-none hover:cursor-pointer h-16 w-28 ${
              activeTab === tab ? "active-tab" : "bg-transparent"
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
            <h3 className="text-2xl">My favorites</h3>
            <p className="text-sm">
              Här ska man kunna trycka på en knapp så man får upp alla filmer
              som ligger i sin "seen lista" och välja 3st favoriter som visas
              nedan.
            </p>
            <SlideMenu>
              <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
              <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
              <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
            </SlideMenu>
          </div>
          <div className="mb-8">
            <h3 className="text-2xl">Recent activity</h3>
            <p className="text-sm">
              Här visas dom senaste filmerna man har kollat på (=lagt till i sin
              seen list)
            </p>
            <SlideMenu>
              <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
              <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
              <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
              <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
              <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
              <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
              <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
              <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
              <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
              <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
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
            <button
              onClick={handleCreateNewList}
              className="py-2 px-4 bg-blue-500 text-white rounded"
            >
              Create new list
            </button>
            {loadingLists ? (
              <p>Loading lists...</p>
            ) : (
              <div className="mt-4">
                {userLists.length === 0 ? (
                  <p>No lists created</p>
                ) : (
                  userLists.map((list) => (
                    <div key={list.id} className="my-4">
                      <Link href={`/my-customlist/${list.id}`}>
                        <h4 className="text-lg font-bold hover:underline">
                          {list.name}
                        </h4>
                      </Link>
                      <button>ta bort lista</button>
                      {list.movies.length === 0 ? (
                        <p>No movies in this list</p>
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
  );
}
