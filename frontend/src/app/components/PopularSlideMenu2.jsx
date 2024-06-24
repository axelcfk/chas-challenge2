"use client";
import { useEffect, useState } from "react";
import { host } from "../utils";
import SlideMenu from "./SlideMenu";
import MovieCardWatchAndLike from "./MovieCardWatchAndLike";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function PopularSlideMenu2() {
  const [popularMoviesData, setPopularMoviesData] = useState(null);
  const [popularListDetails, setPopularListDetails] = useState([]);

  useEffect(() => {
    fetchPopularMoviesAndDetailsFromTMDB();
  }, []);

  async function fetchPopularMoviesAndDetailsFromTMDB() {
    try {
      const token = localStorage.getItem("token");

      console.log("token: ", token);
      //setToken(tokenStorage);
      /* console.log(
        "fetched localStorage token for Account data: ",
        tokenStorage
      ); */
      const response = await fetch(`${host}/api/popularmovies`, {
        // users sidan på backend! dvs inte riktiga sidan!
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          //token: tokenStorage, // "backend får in detta som en "request" i "body"... se server.js när vi skriver t.ex. const data = req.body "
        }),
      });

      const data = await response.json();


     /*  const filteredData = data.filter(movieData => {
        return movieData.movie.vote_average > 0;
      }); */

      //setPopularMoviesData(filteredData);
      setPopularMoviesData(data);
    } catch (error) {
      console.error("Error:", error);
    }
  }
    
    /* finally {
      // setLikedSeriesFetched(true); // bara en behövs
     // setListsFetched(true);
    } */
  

  //console.log("movie ", movie);

  /* useEffect(() => {
    if (
      (popularMoviesData && popularMoviesData.length > 0 ) // ||
      //(likedSeriesList && likedSeriesList.length > 0)
    ) {
      setPopularListDetails([]);
      popularMoviesData.forEach(async (movieData) => {

       

        if (movieData.movie.title) {
          setPopularListDetails((prevDetails) => [
            ...prevDetails, 
            {
              id: movieData.movie.id, // or movi  e.id
              title: movieData.movie.title,
              //overview: movieData.movie.overview,
              voteAverage: movieData.movie.vote_average,
              release: movieData.movie.release_date,
              //tagline: movieData.movie.tagline,
              //runtime: movie.runtime,
              backdrop: `https://image.tmdb.org/t/p/w500${movieData.movie.backdrop_path}`,
              poster: `https://image.tmdb.org/t/p/w500${movieData.movie.poster_path}`,
              isLiked: movieData.isLiked, 
              isInWatchList: movieData.isInWatchList, 
              flatrate: movieData.streamingProviders,
            },
          ]);
        } else {
          console.log("data.title does not exist?");
        }

        
        
      });
    }
    //}, [showLikedDetails]);
  }, [popularMoviesData]); */

  useEffect(() => {
    if (popularMoviesData && popularMoviesData.length > 0) {
      setPopularListDetails((prevDetails) => {
        return popularMoviesData.map((movieData) => ({
          id: movieData.movie.id,
          title: movieData.movie.title,
          voteAverage: movieData.movie.vote_average,
          release: movieData.movie.release_date,
          backdrop: `https://image.tmdb.org/t/p/w500${movieData.movie.backdrop_path}`,
          poster: `https://image.tmdb.org/t/p/w500${movieData.movie.poster_path}`,
          isLiked: movieData.isLiked,
          isInWatchList: movieData.isInWatchList,
          flatrate: movieData.movieProvidersObject.flatrate, // skips this if flatrate doesnt exist
        }));
      });
    }
  }, [popularMoviesData]);

  if (popularListDetails.length === 20) {
    console.log(popularListDetails);
  }

  if (popularListDetails.length === 0) {
    return (
      <>
        {/*  <div
          className="flex flex-col justify-center items-center md:items-start pb-10 h-80 px-8 md:px-20  bg-slate-950 text-slate-100"
          tabIndex={0}
        >
          <p>Loading popular movies...</p>
         */}
        <div className="flex gap-2 w-full h-[391px]">
          <SkeletonTheme
            baseColor="#535157"
            highlightColor="#7b8085"
            height={391}
            width={160}
            borderRadius={20}
          >
            <Skeleton containerClassName="flex-1"></Skeleton>
            <Skeleton containerClassName="flex-1"></Skeleton>
            <Skeleton containerClassName="flex-1"></Skeleton>
          </SkeletonTheme>
        </div>

        {/*   </div> */}
      </>
    );
  }
  return (
    <>
      <SlideMenu>
        {popularListDetails.map((movie, index) => (
          <MovieCardWatchAndLike
            key={index}
            //isLiked={true} // såklart är filmen liked eftersom den är i likelistan.... :)
            voteAverage={movie.voteAverage}
            isLiked={movie.isLiked}
            isInWatchList={movie.isInWatchList}
            id={movie.id}
            title={movie.title}
            poster={movie.poster}
            overview={movie.overview}
            streamingServices={movie.flatrate}
          ></MovieCardWatchAndLike>
        ))}
      </SlideMenu>

      {/*  {popularListDetails && popularListDetails.length > 0 ? (
        <SlideMenu>
          {popularListDetails.map((movie, index) => (
            <MovieCardWatchAndLike
              key={index}
              //isLiked={true} // såklart är filmen liked eftersom den är i likelistan.... :)
              voteAverage={movie.voteAverage}
              isLiked={movie.isLiked}
              isInWatchList={movie.isInWatchList}
              id={movie.id}
              title={movie.title}
              poster={movie.poster}
              overview={movie.overview}
              streamingServices={movie.flatrate}
            ></MovieCardWatchAndLike>
          ))}
        </SlideMenu>
      ) : (
        <div className="inline-block w-full h-80 md:h-96 mx-4" tabIndex={0}>
          <p>No Popular Movies found</p>{" "}
          
        </div> 
      )}
     */}
    </>
  );
}
