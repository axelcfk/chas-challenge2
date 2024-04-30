"use client"
import FetchedMovies from "../components/FetchedMovies";
import LikeListSlideMenu from "../components/LikeListSlideMenu";
import WatchListSlideMenu from "../components/WatchListSlideMenu";

export default function TestMyList() {

  return (
    <div className="relative flex flex-col justify-center items-center pb-10 px-8 md:px-20 h-screen bg-slate-950 text-slate-100">

      <LikeListSlideMenu></LikeListSlideMenu>
      
      <WatchListSlideMenu></WatchListSlideMenu>

      <FetchedMovies></FetchedMovies>
    </div>
  )
}