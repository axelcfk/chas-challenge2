"use client";
import { useEffect, useState } from "react";
import { fetchMovieObject, host } from "../utils";
import SlideMenu from "./SlideMenu";
import MovieCardWatchAndLike from "./MovieCardWatchAndLike";

export default function LikeListSlideMenu2() {
  const [likedMoviesList, setLikedMoviesList] = useState(null);
  const [listsFetched, setListsFetched] = useState(false);
  // const [likedSeriesList, setLikedSeriesList] = useState(null);
  //const [likedSeriesFetched, setLikedSeriesFetched] = useState(false); // bara en behövs
  const [likedMoviesListDetails, setLikedMoviesListDetails] = useState([]);

  const [movieWatchList, setMovieWatchList] = useState(null);

  // TODO: flytta dessa useEffects till backend?

  useEffect(() => {
    fetchWatchAndLikeList();
  }, []);

  async function fetchWatchAndLikeList() {
    try {
      const token = localStorage.getItem("token");
      //setToken(tokenStorage);
      /* console.log(
        "fetched localStorage token for Account data: ",
        tokenStorage
      ); */
      const response = await fetch(`${host}/me/watchandlikelists`, {
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

      if (data.movieWatchList && data.likedMoviesList) {
        //if (data.movieWatchList && data.movieWatchList.length > 0 && data.likedMoviesList && data.likedMoviesList.length > 0) {

        console.log(
          "fetched data.movieWatchList from backend: ",
          data.movieWatchList,
          " and fetched data.likedMoviesList from backend: ",
          data.likedMoviesList
        );
        setMovieWatchList(data.movieWatchList);
        setLikedMoviesList(data.likedMoviesList);

        // setLikedSeriesList(data.likedSeriesList);
      } else {
        console.log(
          "failed to fetch watch- and like-lists from backend, or they are empty"
        );
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      // setLikedSeriesFetched(true); // bara en behövs
      setListsFetched(true);
    }
  }

  useEffect(() => {
    if (
      likedMoviesList &&
      likedMoviesList.length > 0 // ||
      //(likedSeriesList && likedSeriesList.length > 0)
    ) {
      likedMoviesList.forEach(async (likedMovie) => {
        console.log("likedMovie: ", likedMovie);
        //const movieObject = await fetchMovieObject(movie.id); // from our database
        const movieObject = await fetchMovieObject(likedMovie.movie_id);
        console.log("movieObject: ", movieObject);

        let isInWatchList;
        if (movieWatchList && movieWatchList.length > 0) {
          isInWatchList = movieWatchList.some((watchListedMovie) => {
            return watchListedMovie.movie_id === likedMovie.movie_id;
          });
        }

        if (movieObject.title) {
          setLikedMoviesListDetails((prevDetails) => [
            ...prevDetails,
            {
              id: movieObject.id,
              title: movieObject.title,
              overview: movieObject.overview,
              voteAverage: movieObject.vote_average,
              release: movieObject.release_date,
              tagline: movieObject.tagline,
              runtime: movieObject.runtime,
              backdrop: `https://image.tmdb.org/t/p/w500${movieObject.backdrop_path}`,
              poster: `https://image.tmdb.org/t/p/w500${movieObject.poster_path}`,
              isInWatchList: isInWatchList,
            },
          ]);
        } else {
          console.log("data.title does not exist?");
        }
      });
    }
    //}, [showLikedDetails]);
  }, [listsFetched]);

  //if (likedMoviesList == null || likedSeriesList == null) {
  if (!listsFetched) {
    return (
      <>
        <div className="flex flex-col justify-center items-center md:items-start pb-10  bg-slate-950 text-slate-100">
          Loading like-lists...
        </div>
      </>
    );
  }

  return (
    <>
      {likedMoviesListDetails && likedMoviesListDetails.length > 0 ? (
        <SlideMenu>
          {likedMoviesListDetails.map((movie, index) => (
            <MovieCardWatchAndLike
              key={index}
              isLiked={true} // såklart är filmen liked eftersom den är i likelistan.... :)
              isInWatchList={movie.isInWatchList}
              id={movie.id}
              title={movie.title}
              poster={movie.poster}
              overview={movie.overview}
              voteAverage={movie.voteAverage}
            ></MovieCardWatchAndLike>
          ))}
        </SlideMenu>
      ) : (
        <div className="inline-block w-full h-80 md:h-96">
          <p>No movies in Likelist yet</p>{" "}
          {/*  TODO: detta visas i en millisekund när man refreshar... */}
        </div>
      )}
    </>
  );
}
