"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import WatchListSlideMenu2 from "../components/WatchListSlideMenu2";
import PopularSlideMenu2 from "../components/PopularSlideMenu2";
import { FaArrowRight, FaHeart } from "react-icons/fa";
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

  /*  <ProtectedRoute> </ProtectedRoute> */
  return (
    <div className=" bg-[#110A1A] w-full ">
      <div className=" pb-8 h-full w-full ">
        <main className="w-full flex flex-col text-slate-100 py-12 justify-center items-center md:items-start  ">
          <div className="w-[90%] md:w-2/4 md:ml-12 ">
            {/* <h2 className="mb-10 md:text-left">AI-SEARCH</h2> */}
            <div
              className=" rounded-3xl p-8 h-72 flex flex-col justify-center items-start card-shadow"
              style={{
                // border: "1px solid grey",
                backgroundColor: "#1D1631", //rgba(141, 126, 255, 0.1)
              }}
              ref={parallaxRef}
            >
              <h2 className=" text-5xl w-full font-archivo font-extrabold uppercase md:mt-20">
                Use AI to find a movie!
              </h2>
              <div className=" h-full flex justify-center items-center">
                <Link className="no-underline text-black" href={"/chatpage2"}>
                  <button className="flex items-center justify-center gap-4 hover:cursor-pointer border-none text-2xl bg-[#CFFF5E] hover:bg-gray-100 w-72 h-16 rounded-full font-extrabold font-archivo">
                    AI SEARCH <FaArrowRight color="rgb(2 6 23)" size={"24px"} />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </main>
        <div className="w-full md:ml-12 md:w-[90%]">
          <div className="flex gap-2 items-center mb-8 md:pl-0">
            <div className="flex h-full justify-center items-center sectionTitleUnderline bg-[#CFFF5E] ml-4 md:ml-0"></div>
            <h2
              className="md:pl-0 uppercase text-2xl font-archivo font-bold"
              tabIndex={0}
            >
              Popular today
              {/* (isLiked=false, isInWatchList=false) */}
            </h2>
          </div>
          <div className="md:pl-0 ml-4 md:h-full md:ml-0">
            <PopularSlideMenu2 />
          </div>
        </div>

        <div className="md:ml-12 md:flex md:w-full] ">
          <div className="  mt-14 md:mr-14">
            <div className="flex gap-2 items-center mb-8 md:pl-0">
              <div className="flex h-full  justify-center items-center sectionTitleUnderline bg-[#CFFF5E] ml-4 md:ml-0"></div>
              <h2
                className="uppercase text-2xl font-archivo font-bold"
                tabIndex={0}
              >
                My Mix
              </h2>
            </div>

            <Link href={`/mymixes2/${"weekly"}`} className="no-underline">
              <div className="flex justify-center items-center h-52 bg-[#CFFF5E] rounded-3xl card-shadow2 p-8 md:h-64 md:w-[80%] ml-4 mr-4 md:ml-0 ">
                {" "}
                <div className="text-slate-950 flex flex-col justify-center items-start md:items-center">
                  <h2 className="text-6xl md:text-6xl font-archivo font-extrabold uppercase">
                    Weekly AI Mix
                  </h2>

                  <p className="whitespace-nowrap font-archivo font-extrabold md:text-2xl">
                    Based on your
                    <FaHeart className="h-3 w-3 pt-4 mx-1 text-[#EA3546]"></FaHeart>{" "}
                    movies
                  </p>
                </div>
                {/* <div className="md:hidden">
                  <FaArrowRight color="rgb(2 6 23)" size={"60px"} />
                </div> */}
              </div>
            </Link>
          </div>

          <div className="w-full  mt-14 md:w-2/4 ">
            <div className="flex gap-2 items-center mb-8 md:pl-0">
              <div className="flex h-full justify-center items-center sectionTitleUnderline bg-[#CFFF5E] ml-4"></div>
              <h2
                className="uppercase text-2xl  font-archivo font-bold "
                tabIndex={0}
              >
                Watchlist
              </h2>
            </div>

            <div className=" md:w-full  md:mx-0">
              <WatchListSlideMenu2 />
            </div>
          </div>
        </div>
      </div>
    </div>
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
