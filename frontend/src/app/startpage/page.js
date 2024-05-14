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

//TODO: texten i rutan ska var lite större
//TODO: fetcha populära filmer och rendera under popular today
//TODO: rend watchlist on this page
//? see what Friends watched on this page?

export default function Startpage() {
  const [popularMovies, setPopularMovies] = useState([]);

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

  useEffect(() => {
    const apiKey = "71a2109e9f6fadaf14036ae6c29ac5b7";
    const fetchPopularMovies = async () => {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`
      );
      const data = await response.json();
      setPopularMovies(data.results);
    };

    fetchPopularMovies();
  }, []);

  const parallaxRef = useRef(null);

  return (
    <>
      <div className=" pb-8   ">
        <main className="flex flex-col text-slate-100 py-20  justify-center px-8">
          <h2 className="mb-10 ">AI-SEARCH</h2>
          <div
            className="bg-[#3D348B] rounded-3xl p-8 h-40 "
            ref={parallaxRef}

            // style={{ border: "0.8px solid grey" }}
          >
            <p className="pb-2 font-semibold">Don't know what to watch?</p>
            <h3 className="text-2xl font-light">
              {" "}
              Let our AI blow <br /> your mind!
            </h3>
            <div className=" h-2/3 flex justify-between items-center">
              <button className="border-none bg-slate-100 w-40 h-10 rounded-full font-semibold">
                Find a movie
              </button>
              <img
                className="h-64 -mt-40 -mr-9 z-50"
                src="/image.png"
                alt="AI"
              />
            </div>
          </div>

          {/* <div className="flex align-items-center justify-center pt-28 px-4 container">
            <div className="hero-container">
              <div className="flex flex-col">
                <p className="hero-p">
                 <span>Don't know </span>
                  what to watch?
                </p>
                <p className="hero-p">
                  Let CinemAI <br />
                  help you!
                </p>
                <Link href={"/chatpage2"}>
                  <button className="hero-btn">FIND A MOVIE</button>
                </Link>
              </div>
            </div>
          </div> */}
        </main>
        <div className=" flex justify-center flex-col text-white space-y-8">
          <h2 className="text-xl px-8 uppercase"> Watchlist</h2>
          {/* <LikeListSlideMenu2></LikeListSlideMenu2> */}
          <WatchListSlideMenu2></WatchListSlideMenu2>
          {/* <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
          <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
          <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
          <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
          <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
          <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
          <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
          <SlideMenuMovieCard poster={"/troll-poster.jpg"} /> */}
          <h2 className=" text-xl px-8 uppercase">Search history</h2>
          <div className="pl-8">
            <SlideMenu>
              <SlideMenuSearchHistoryCard
                searchName="Search 1"
                imgSrc={"/search-history-img.png"}
              ></SlideMenuSearchHistoryCard>
              <SlideMenuSearchHistoryCard
                searchName="Search 2"
                imgSrc={"/search-history-img.png"}
              ></SlideMenuSearchHistoryCard>
              <SlideMenuSearchHistoryCard
                searchName="Search 3"
                imgSrc={"/search-history-img.png"}
              ></SlideMenuSearchHistoryCard>
              <SlideMenuSearchHistoryCard
                imgSrc={"/search-history-img.png"}
              ></SlideMenuSearchHistoryCard>
              <SlideMenuSearchHistoryCard
                imgSrc={"/search-history-img.png"}
              ></SlideMenuSearchHistoryCard>
              <SlideMenuSearchHistoryCard
                imgSrc={"/search-history-img.png"}
              ></SlideMenuSearchHistoryCard>
              <SlideMenuSearchHistoryCard
                imgSrc={"/search-history-img.png"}
              ></SlideMenuSearchHistoryCard>
            </SlideMenu>
          </div>
          <h2 className=" text-xl mb-5 pl-8 uppercase">
            Popular today
            {/* (isLiked=false, isInWatchList=false) */}
          </h2>
          <div className="pl-8">
            <SlideMenu>
              {/* {popularMovies.map(movie => (
            <SlideMenuMovieCard
              key={movie.id}
              id={movie.id}
              poster={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            />
          ))} */}

              {popularMovies.map((movie) => (
                <div className=" inline-block pr-4">
                  <MovieCardWatchAndLike
                    key={movie.id}
                    isLiked={false}
                    isInWatchList={false}
                    id={movie.id}
                    title={movie.title}
                    poster={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    overview={movie.overview}
                    voteAverage={movie.vote_average}
                  />
                </div>
              ))}
            </SlideMenu>
          </div>
          <h2 className="text-xl pl-8 uppercase">Movie mixes</h2>
          <div className="pl-8">
            <SlideMenu>
              <SlideMenuMixCard
                mixName={"Weekly"}
                imgSrc={"/mix-img.png"}
              ></SlideMenuMixCard>
              <SlideMenuMixCard
                mixName={"Horror"}
                imgSrc={"/mix-img.png"}
              ></SlideMenuMixCard>
              <SlideMenuMixCard
                mixName={"Sunday"}
                imgSrc={"/mix-img.png"}
              ></SlideMenuMixCard>
              <SlideMenuMixCard imgSrc={"/mix-img.png"}></SlideMenuMixCard>
              <SlideMenuMixCard imgSrc={"/mix-img.png"}></SlideMenuMixCard>
              <SlideMenuMixCard imgSrc={"/mix-img.png"}></SlideMenuMixCard>
              <SlideMenuMixCard imgSrc={"/mix-img.png"}></SlideMenuMixCard>
            </SlideMenu>
          </div>

          {/* <div className="text-xl pl-8">Likes (ta bort?)</div>
          <LikeListSlideMenu2></LikeListSlideMenu2> */}
        </div>
      </div>
    </>
  );
}
