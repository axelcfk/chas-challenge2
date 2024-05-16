"use client";

import React, { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import Link from "next/link";
import SlideMenu, {
  SlideMenuMixCard,
  SlideMenuMovieCard,
  SlideMenuSearchHistoryCard,
} from "../components/SlideMenu";
import DailyMixBasedOnLikesSlideMenu from "../components/DailyMixSlideMenu";
import LikeListSlideMenu2 from "../components/LikeListSlideMenu2";
import WatchListSlideMenu2 from "../components/WatchListSlideMenu2";
import MovieCardWatchAndLike from "../components/MovieCardWatchAndLike";
import PopularSlideMenu2 from "../components/PopularSlideMenu2";

//TODO: texten i rutan ska var lite större
//TODO: fetcha populära filmer och rendera under popular today
//TODO: rend watchlist on this page
//? see what Friends watched on this page?

export default function Startpage() {
  //const [popularMovies, setPopularMovies] = useState([]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const speed = 0.1;
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

  const parallaxRef = useRef(null);

  return (
    <div className="px-4">
      <div className=" pb-8 h-full w-full md:w-1/2">
        <main className="w-full flex flex-col text-slate-100 py-20 justify-center  md:items-start  md:px-24">
          <div className="w-full">
            <h2 className="mb-10 md:text-left">AI-SEARCH</h2>
            <div
              className="bg-[#29274C] rounded-3xl p-8 h-40"
              ref={parallaxRef}
            >
              <p className="pb-2 font-semibold z-50 relative">
                Don't know what to watch?
              </p>
              <h2 className="font-light text-xl">
                {" "}
                Let our AI blow <br /> your mind!
              </h2>
              <div className=" h-2/3 flex justify-between items-center">
                <Link href={"/chatpage2"}>
                  <button className="hover:cursor-pointer border-none bg-slate-100 w-40 h-10 rounded-full font-semibold">
                    Find a movie
                  </button>
                </Link>
                <img
                  className="h-64 -mt-40 -mr-9 z-10"
                  src="/image.png"
                  alt="AI"
                />
              </div>
            </div>
          </div>
        </main>
        <div className="w-full  md:px-24 ">
          <h2 className="mt-14 md:mt-4 mb-8 pl-4  md:pl-0 uppercase">
            Popular today
            {/* (isLiked=false, isInWatchList=false) */}
          </h2>
          <div className="pl-4 md:pl-0">
           <PopularSlideMenu2/>
          </div>
        </div>

        <div className="w-full md:px-24 ">
          <h2 className="mt-14 mb-8 pl-4 md:pl-0 uppercase">Movie mixes</h2>
          <div className="pl-4 md:pl-0">
            <SlideMenu>
              <SlideMenuMixCard mixName={"Weekly"} imgSrc={"/mix-img.png"} />
              <SlideMenuMixCard mixName={"Horror"} imgSrc={"/mix-img.png"} />
              <SlideMenuMixCard mixName={"Sunday"} imgSrc={"/mix-img.png"} />
              <SlideMenuMixCard imgSrc={"/mix-img.png"} />
              <SlideMenuMixCard imgSrc={"/mix-img.png"} />
              <SlideMenuMixCard imgSrc={"/mix-img.png"} />
              <SlideMenuMixCard imgSrc={"/mix-img.png"} />
            </SlideMenu>
          </div>
        </div>
        {/* <div className="w-full md:px24 bg-amber-500  "> */}
        {/* <h2 className="text-xl px-8 uppercase"> Watchlist</h2>
          <div className="pl-8">
            <WatchListSlideMenu2></WatchListSlideMenu2>
          </div> */}
        <div className="w-full  md:px-24 ">
          <h2 className="mt-14 mb-8  pl-4 md:pl-0 uppercase">Search history</h2>
          <div className=" pl-4 md:pl-0">
            <SlideMenu>
              <SlideMenuSearchHistoryCard
                searchName="Search 1"
                imgSrc={"/search-history-img.png"}
              />
              <SlideMenuSearchHistoryCard
                searchName="Search 2"
                imgSrc={"/search-history-img.png"}
              />
              <SlideMenuSearchHistoryCard
                searchName="Search 3"
                imgSrc={"/search-history-img.png"}
              />
              <SlideMenuSearchHistoryCard imgSrc={"/search-history-img.png"} />
              <SlideMenuSearchHistoryCard imgSrc={"/search-history-img.png"} />
              <SlideMenuSearchHistoryCard imgSrc={"/search-history-img.png"} />
              <SlideMenuSearchHistoryCard imgSrc={"/search-history-img.png"} />
            </SlideMenu>
          </div>
        </div>
        <div className="w-full  md:px-24 ">
          <h2 className="mt-14 mb-8 pl-4 md:pl-0 uppercase"> Watchlist</h2>
          <div className="w-full pl-4 md:pl-0 ">
            <WatchListSlideMenu2 />
          </div>
        </div>
      </div>
    </div>
  );
}
