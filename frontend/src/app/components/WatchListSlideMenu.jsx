"use client";
import { useEffect, useState } from "react";
import { host } from "../utils";
import SlideMenu, { SlideMenuMovieCard } from "./SlideMenu";

export default function WatchListSlideMenu() {
  const [likedMoviesList, setLikedMoviesList] = useState(null);
  const [likedMoviesFetched, setLikedMoviesFetched] = useState(false);
  const [likedSeriesList, setLikedSeriesList] = useState(null);
  const [likedSeriesFetched, setLikedSeriesFetched] = useState(false);

  const [movieWatchList, setMovieWatchList] = useState(null);
  const [movieWatchListFetched, setMovieWatchListFetched] = useState(false);

  const [seriesWatchList, setSeriesWatchList] = useState(null);
  const [seriesWatchListFetched, setSeriesWatchListFetched] = useState(false);

  const [likedMoviesListDetails, setLikedMoviesListDetails] = useState([]);
  const [likedSeriesListDetails, setLikedSeriesListDetails] = useState(null);
  const [movieWatchListDetails, setMovieWatchListDetails] = useState([]);
  const [seriesWatchListDetails, setSeriesWatchListDetails] = useState(null);

  const [showLikedDetails, setShowLikedDetails] = useState(false);
  const [showWatchListDetails, setShowWatchListDetails] = useState(false);

  const movieAPI_KEY = "b0aa22976a88a1f9ab9dbcd9828204b5";

  useEffect(() => {
    postWatchLists();
  }, []);

  useEffect(() => {
    if (
      (movieWatchList && movieWatchList.length > 0) ||
      (seriesWatchList && seriesWatchList.length > 0)
    ) {
      movieWatchList.forEach((movie) => {
        fetchMovieWatchListDetails(movie.id);
      });
    }
    //}, [ movieWatchListFetched || seriesWatchListFetched])
  }, [showWatchListDetails]);

  async function fetchMovieWatchListDetails(id) {
    console.log("Fetching movie details for ID:", id);
    try {
      const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${movieAPI_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      console.log(data);
      console.log(data.vote_average);
      if (data.title) {
        // Check if data includes title
        // If not, update the state with the movie details
        setMovieWatchListDetails((prevDetails) => [
          ...prevDetails,
          {
            id: id,
            title: data.title,
            overview: data.overview,
            voteAverage: data.vote_average,
            release: data.release_date,
            tagline: data.tagline,
            runtime: data.runtime,
            backdrop: `https://image.tmdb.org/t/p/w500${data.backdrop_path}`,
            poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
          },
        ]);

        //  setMovieDetailsFetched(true); // Mark that movie details have been fetched
      } else {
        console.error("No movie found with the given ID");
      }
    } catch (error) {
      console.error("Error fetching movie details:", error);
    }
  }

  async function postWatchLists() {
    try {
      //const tokenStorage = localStorage.getItem("token");
      //setToken(tokenStorage);
      /* console.log(
        "fetched localStorage token for Account data: ",
        tokenStorage
      ); */
      const response = await fetch(`${host}/me/watchlists`, {
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
      if (data.movieWatchList && data.seriesWatchList) {
        console.log(
          "fetched data.movieWatchList: ",
          data.movieWatchList,
          " and fetched data.seriesWatchList: ",
          data.seriesWatchList
        );
        setMovieWatchList(data.movieWatchList);
        setSeriesWatchList(data.seriesWatchList);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setMovieWatchListFetched(true);
      setSeriesWatchListFetched(true);
    }
  }

  if (movieWatchList == null || seriesWatchList == null) {
    return (
      <div className="flex flex-col justify-center items-center md:items-start pb-10  px-8 md:px-20 bg-slate-950 text-slate-100">
        Loading watch-lists...
      </div>
    );
  }

  return (
    <>
      {/* <h2>Watchlist</h2>
      {movieWatchList && movieWatchList.length > 0 ? (
        <div className="flex">
          {" "}
          {movieWatchList.map((movie, index) => {
            return (
              <div className="pl-4" key={index}>
                ID: {movie.id}
              </div>
            );
          })}{" "}
        </div>
      ) : (
        "No movies in watchlist"
      )} */}

      <h2>Watchlist Detailed</h2>

      <button
        className="p-8 bg-slate-500"
        onClick={() => {
          setShowWatchListDetails(true);
          // setShowWatchListDetails(!showWatchListDetails); // fetchar varje gång
        }}
      >
        Show Details
      </button>

      {showWatchListDetails ? (
        movieWatchListDetails && movieWatchListDetails.length > 0 ? (
          <SlideMenu>
            {movieWatchListDetails.map((movie, index) => (
              <SlideMenuMovieCard
                key={index}
                title={movie.title}
                poster={movie.poster} // Assuming you have 'poster' and 'overview' properties in 'likedMoviesListDetails'
                overview={movie.overview}
              />
            ))}
          </SlideMenu>
        ) : (
          "No movies in watchlist yet"
        )
      ) : (
        ""
      )}
    </>
  );
}
