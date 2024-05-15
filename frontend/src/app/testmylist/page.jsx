"use client"
import DailyMixBasedOnLikesSlideMenu from "../components/DailyMixSlideMenu";
import LikeListSlideMenu from "../components/LikeListSlideMenu";
import LikeListSlideMenu2 from "../components/LikeListSlideMenu2";
import PopularSlideMenu2 from "../components/PopularSlideMenu2";
import WatchListSlideMenu from "../components/WatchListSlideMenu";

export default function TestMyList() {

  return (
    <div className="relative flex flex-col justify-center items-center pb-10 px-8 md:px-20 h-screen bg-slate-950 text-slate-100">

      <LikeListSlideMenu></LikeListSlideMenu>
      
      <WatchListSlideMenu></WatchListSlideMenu>

      <LikeListSlideMenu2></LikeListSlideMenu2>

      <DailyMixBasedOnLikesSlideMenu></DailyMixBasedOnLikesSlideMenu>

      <PopularSlideMenu2></PopularSlideMenu2>
    </div>
  )
}