"use client";
import { useEffect, useState } from "react";
import { fetchMovieObject, host } from "../utils";
import MovieCardWatchAndLike from "./MovieCardWatchAndLike";

export default function WatchListForProfile({ profilePage }) {
  //const [token, setToken] = useState(tokenStorage)

  const [movieWatchList, setMovieWatchList] = useState([]);
  const [listsFetched, setListsFetched] = useState(false);
  // const [likedSeriesList, setLikedSeriesList] = useState(null);
  //const [likedSeriesFetched, setLikedSeriesFetched] = useState(false); // bara en behövs
  const [movieWatchListDetails, setMovieWatchListDetails] = useState([]);

  const [likedMoviesList, setLikedMoviesList] = useState(null); // to check if a movie is liked...

  // TODO: flytta dessa useEffects till backend?
  useEffect(() => {
    fetchWatchAndLikeList();
  }, []);

  async function fetchWatchAndLikeList() {
    try {
      const token = localStorage.getItem("token");

      //const tokenStorage = localStorage.getItem("token");
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

  async function fetchMovieProviders(id) {
    try {
      const response = await fetch(`${host}/fetchmovieprovidersTMDB`, {
        // users sidan på backend! dvs inte riktiga sidan!
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,

          //token: tokenStorage, // "backend får in detta som en "request" i "body"... se server.js när vi skriver t.ex. const data = req.body "
        }),
      });

      const data = await response.json();

      if (data.movieId && data.movieProvidersObject) {
        return data;
      }
    } catch (error) {
      console.error("Error:", error);
    } /* finally {
      if (movieProvidersBackend.length === 20) {
        setFetchedMovieProviders(true);
      } else {
        return;
      }
    } */
  }

  useEffect(() => {
    if (
      movieWatchList &&
      movieWatchList.length > 0 // ||
      //(likedSeriesList && likedSeriesList.length > 0)
    ) {
      movieWatchList.forEach(async (watchListedMovie) => {
        // first check if movie in watchlist is liked
        let isLiked;
        if (likedMoviesList && likedMoviesList.length > 0) {
          isLiked = likedMoviesList.some((likedMovie) => {
            return likedMovie.movie_id === watchListedMovie.movie_id;
          });
        }

        // now fetching movie object from our database
        const movieObject = await fetchMovieObject(watchListedMovie.movie_id);

        const movieProviders = await fetchMovieProviders(
          watchListedMovie.movie_id
        );

        console.log("movieObject: ", movieObject);

        console.log("movieProvidersObject: ", movieProviders);

        if (movieObject.title && movieProviders.movieProvidersObject) {
          setMovieWatchListDetails((prevDetails) => [
            ...prevDetails,
            {
              id: movieObject.id, // or movi  e.id
              title: movieObject.title,
              overview: movieObject.overview,
              voteAverage: movieObject.vote_average,
              release: movieObject.release_date,
              tagline: movieObject.tagline,
              runtime: movieObject.runtime,
              backdrop: `https://image.tmdb.org/t/p/w500${movieObject.backdrop_path}`,
              poster: `https://image.tmdb.org/t/p/w500${movieObject.poster_path}`,
              isLiked: isLiked,
              flatrate: movieProviders.movieProvidersObject.flatrate,
            },
          ]);
        } else {
          console.log("data.title does not exist?");
        }
      });
    }
    //}, [showLikedDetails]);
  }, [listsFetched]);

  //if (likedMoviesList = = null || likedSeriesList == null) {
  if (likedMoviesList == null) {
    return (
      <>
        <div className="flex flex-col justify-center items-center md:items-start pb-10 px-8  md:px-20  bg-slate-950 text-slate-100">
          Loading Watchlist...
        </div>
      </>
    );
  }

  return (
    <>
      {listsFetched &&
      movieWatchListDetails &&
      movieWatchListDetails.length > 0 ? (
        <div className="grid-container mt-8">
          {movieWatchListDetails.map((movie, index) => (
            <MovieCardWatchAndLike
              key={index}
              voteAverage={movie.voteAverage}
              isLiked={movie.isLiked}
              isInWatchList={true}
              id={movie.id}
              title={movie.title}
              poster={movie.poster}
              overview={movie.overview}
              showRating={false} // false?
              profilePage={profilePage}
              className="movie-card"
              streamingServices={movie.flatrate}
            />
          ))}
        </div>
      ) : (
        <div className="inline-block w-full h-80 md:h-96 mx-4">
          <p className="text-2xl">No movies in watchlist yet</p>
        </div>
      )}
    </>
  );
}
