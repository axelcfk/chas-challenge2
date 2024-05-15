"use client";

import "./profile.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SlideMenu, { SlideMenuMovieCard } from "@/app/components/SlideMenu";
import WatchListForProfile from "@/app/components/WatchListForProfile";

export default function Profile() {
  const [userData, setUserData] = useState(null);
  //standard menyn som visas när man besöker sidan är "profile"
  const [activeTab, setActiveTab] = useState("Profile");
  const router = useRouter();

  const tabNames = ["Profile", "Watchlist", "My lists"];
  const tabIndex = tabNames.indexOf(activeTab);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const userId = localStorage.getItem("userId");

    console.log("Current userId:", userId);
    console.log("Current userData:", userData);

    fetch(`http://localhost:3010/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP status ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setUserData(data))
      .catch((error) => console.error("Failed to fetch user data", error));
  }, []);

  console.log("second userdata: ", userData);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };



  return (
    <main>
      <div className="bg-[#110A19] flex items-center flex-col pb-12 ">
        {userData ? (
          <div className="flex items-center flex-col space-y-5 mt-12">
            <button className="bg-transparent border-none hover:cursor-pointer">
              <img src="/profile-user.svg" className="h-28"></img>
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
            className={`text-white border-none hover:cursor-pointer h-16 w-28 ${activeTab === tab ? 'active-tab' : 'bg-transparent'
          }`} 
          >
            <h4>{tab}</h4>
          </button>
        ))}
      </div>
      <div 
      className="tabs-container" 
      style={{ transform: `translateX(${tabIndex * -100}%)`}}
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
          <div classame="py-8 ">
          <WatchListForProfile profilePage={true}/>
          </div>
        </div>
      )}
      {activeTab === "My lists" && (
        <div className="gradient-border-top bg-[#201430] p-8 mt-8">
          <button className="py-8">Create new list</button>
        </div>
      )}
    </main>
  );
}