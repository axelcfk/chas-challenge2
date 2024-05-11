"use client";
import { useEffect, useState } from "react";
import { fetchMovieObject, host } from "../utils";
import SlideMenu from "./SlideMenu";
import { SlideMenuMovieCard } from "./SlideMenu";
import MovieCardWatchAndLike from "./MovieCardWatchAndLike";

export default function LikeListSlideMenu2() {
  const [likedMoviesList, setLikedMoviesList] = useState(null);
  const [likedMoviesFetched, setLikedMoviesFetched] = useState(false);
  const [likedSeriesList, setLikedSeriesList] = useState(null);
  //const [likedSeriesFetched, setLikedSeriesFetched] = useState(false); // bara en behövs

  const [likedMoviesListDetails, setLikedMoviesListDetails] = useState([]);

  const [showLikedDetails, setShowLikedDetails] = useState(false);

  // TODO: flytta dessa useEffects till backend?
  useEffect(() => {
    postLikeLists();
  }, []);

  async function postLikeLists() {
    try {
      //const tokenStorage = localStorage.getItem("token");
      //setToken(tokenStorage);
      /* console.log(
        "fetched localStorage token for Account data: ",
        tokenStorage
      ); */
      const response = await fetch(`${host}/me/likelists`, {
        // users sidan på backend! dvs inte riktiga sidan!
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          //token: tokenStorage, // "backend får in detta som en "request" i "body"... se server.js när vi skriver t.ex. const data = req.body "
        }),
      });

      const data = await response.json();
      if (data.likedMoviesList && data.likedSeriesList) {
        console.log(
          "fetched data.likedMoviesList from backend: ",
          data.likedMoviesList,
          " and fetched data.likedSeriesList from backend: ",
          data.likedSeriesList
        );
        setLikedMoviesList(data.likedMoviesList);

        setLikedSeriesList(data.likedSeriesList);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      // setLikedSeriesFetched(true); // bara en behövs
      setLikedMoviesFetched(true);
    }
  }

  useEffect(() => {
    if (
      (likedMoviesList && likedMoviesList.length > 0) ||
      (likedSeriesList && likedSeriesList.length > 0)
    ) {
      likedMoviesList.forEach(async (movie) => {
        const movieObject = await fetchMovieObject(movie.id); // from our database
        console.log("movieObject: ", movieObject);

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
            },
          ]);
        } else {
          console.log("data.title does not exist?");
        }
      });
    }
    //}, [showLikedDetails]);
  }, [likedMoviesFetched]);

  //if (likedMoviesList == null || likedSeriesList == null) {
  if (likedMoviesList == null) {
    return (
      <div className="flex flex-col justify-center items-center md:items-start pb-10  px-8 md:px-20 h-screen w-screen bg-slate-950 text-slate-100">
        Loading like-lists...
      </div>
    );
  }

  return (
    <>
      {/* <h2>Liked Movies (backend fetch)</h2>
      <button
        className="p-8 bg-slate-500"
        onClick={() => {
          // setShowLikedDetails(!showLikedDetails); // fetchar varje gång du open/close...
          setShowLikedDetails(true);
        }}
      >
        Show Details
      </button>
 */}
      {/* <SlideMenuMovieCard
                key={index}
                id={movie.id}
                title={movie.title}
                poster={movie.poster} // Assuming you have 'poster' and 'overview' properties in 'likedMoviesListDetails'
                overview={movie.overview}
              /> */}

      {likedMoviesListDetails && likedMoviesListDetails.length > 0 ? (
        <SlideMenu>
          {likedMoviesListDetails.map((movie, index) => (
            <MovieCardWatchAndLike
              key={index}
              isLiked={true}
              id={movie.id}
              title={movie.title}
              poster={movie.poster}
              overview={movie.overview}
              likedMoviesList={likedMoviesList}
            ></MovieCardWatchAndLike>
          ))}
        </SlideMenu>
      ) : (
        "No movies liked yet"
      )}
    </>
  );
}
