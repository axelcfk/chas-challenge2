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
import { FaArrowRight } from "react-icons/fa";
import ProtectedRoute from "../components/ProtectedRoute";

//TODO: texten i rutan ska var lite större
//TODO: fetcha populära filmer och rendera under popular today
//TODO: rend watchlist on this page
//? see what Friends watched on this page?

export default function Startpage() {
  //const [popularMovies, setPopularMovies] = useState([]);

  //const [tokenStorage, setTokenStorage] = useState(null)

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

  /* useEffect(() => {

    const tokenStorage = localStorage.getItem("token");
        //setToken(tokenStorage);
        console.log(
          "fetched token from localStorage: ",
          tokenStorage
        );
     
    setTokenStorage(tokenStorage);
    
    
  }, []) */

  return (
    <ProtectedRoute>
      <div className="px-4 pt-14">
        <div className=" pb-8 h-full w-full ">
          <main className="w-full flex flex-col text-slate-100 py-20 justify-center  md:items-start  md:px-24">
            <div className="w-full">
              {/* <h2 className="mb-10 md:text-left">AI-SEARCH</h2> */}
              <div
                className=" rounded-3xl p-8 h-72 flex flex-col justify-center items-start card-shadow"
                style={{
                  // border: "1px solid grey",
                  backgroundColor: "rgba(141, 126, 255, 0.1)",
                }}
                ref={parallaxRef}
              >
                <h2 className=" text-5xl w-full font-archivo font-extrabold uppercase">
                  Use AI to find a movie!
                </h2>
                <div className=" h-full flex justify-center items-center">
                  <Link href={"/chatpage2"}>
                    <button className="hover:cursor-pointer border-none text-xl bg-[#CFFF5E] hover:bg-[#CFFF5E] w-72 h-16 rounded-full font-extrabold font-archivo">
                      AI SEARCH
                    </button>
                  </Link>
                  {/* <img
                  className="h-64 -mt-40 -mr-9 z-10"
                  src="/image.png"
                  alt="AI"
                /> */}
                </div>
              </div>
            </div>
          </main>
          <div className="w-full md:px-24 ">
            <h2
              className="md:mt-4 mb-8 md:pl-0 uppercase text-xl font-archivo font-bold"
              tabIndex={0}
            >
              Popular today
              {/* (isLiked=false, isInWatchList=false) */}
            </h2>
            <div className="md:pl-0">
              <PopularSlideMenu2 />
            </div>
          </div>

          <div className="w-full md:px-24 ">
            <h2
              className="mt-14 mb-8 md:pl-0 uppercase text-xl  font-archivo font-bold"
              tabIndex={0}
            >
              My Mix
            </h2>

            <Link href={`/mymixes2/${"weekly"}`} className="no-underline">
              <div className="flex justify-center items-center pl-4 md:pl-0 h-40   bg-[#CFFF5E] rounded-3xl card-shadow2 p-8">
                <div className="  text-slate-950   flex flex-col justify-center items-start">
                  <h2 className=" text-5xl font-archivo font-extrabold uppercase">
                    Weekly
                  </h2>
                  <h2 className=" text-5xl font-archivo font-extrabold uppercase">
                    AI{" "}
                  </h2>

                  <h2 className=" text-5xl font-archivo font-extrabold uppercase">
                    Mix
                  </h2>
                </div>
                <div className="ml-20 ">
                  <FaArrowRight color="rgb(2 6 23)" size={"60px"} />
                </div>
              </div>
            </Link>
          </div>
          {/* <div className="w-full md:px24 bg-amber-500  "> */}
          {/* <h2 className="text-xl px-8 uppercase"> Watchlist</h2>
          <div className="pl-8">
            <WatchListSlideMenu2></WatchListSlideMenu2>
          </div> */}

          {/* <div className="w-full  md:px-24 ">
          <h2 className="mt-14 mb-8  pl-4 md:pl-0 uppercase" tabIndex={0}>
            Search history
          </h2>
          <div className=" pl-4 md:pl-0">
            <SlideMenuSearchHistoryCard
              searchName="Search 1"
              imgSrc={"/search-history-img.png"}
            />
          </div>
        </div> */}

          <div className="w-full  md:px-24 ">
            <div className="md:pl-0">
              <WatchListSlideMenu2 />
            </div>
          </div>

          <div className="w-full md:px-24 ">
            <h2 className="mt-14 mb-8 md:pl-0 uppercase">
              {" "}
              LIKELIST (remove in final product)
            </h2>
            <div className="w-full md:pl-0 ">
              <LikeListSlideMenu2 />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

{
  /* <SlideMenuSearchHistoryCard
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
              <SlideMenuSearchHistoryCard imgSrc={"/search-history-img.png"} /> */
}
{
  /* </SlideMenu> */
}

{
  /* <img
                  className="h-64 -mt-40 -mr-9 z-10"
                  src="/image.png"
                  alt="AI"
                /> */
}
