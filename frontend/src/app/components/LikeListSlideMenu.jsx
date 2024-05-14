"use client";
import { useEffect, useState } from "react";
import { host } from "../utils";
import SlideMenu, { SlideMenuMovieCard } from "./SlideMenu";

export default function LikeListSlideMenu() {
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
    postLikeLists();
  }, []);

  useEffect(() => {
    if (
      (likedMoviesList && likedMoviesList.length > 0) ||
      (likedSeriesList && likedSeriesList.length > 0)
    ) {
      likedMoviesList.forEach((movie) => {
        fetchLikedMovieDetails(movie.id);
      });
    }
    //}, [likedMoviesFetched || likedSeriesFetched])
  }, [showLikedDetails]);

  async function fetchLikedMovieDetails(id) {
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
        setLikedMoviesListDetails((prevDetails) => [
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

  /*  console.log("likedmovies: ", likedMoviesList);
    console.log(likedMoviesListDetails); */

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
      setLikedSeriesFetched(true);
      setLikedMoviesFetched(true);
    }
  }

  // Loading... when just loading in data AND length > 0
  if (likedMoviesList == null || likedSeriesList == null) {
    return (
      <div className="flex flex-col justify-center items-center md:items-start pb-10  px-8 md:px-20  bg-slate-950 text-slate-100">
        Loading like-lists...
      </div>
    );
  }

  return (
    <>
      {/* <h2>Liked</h2>

      {likedMoviesList && likedMoviesList.length > 0 ? (
        <ul>
          {" "}
          {likedMoviesList.map((movie, index) => {
            return (
              <div className="pl-4" key={index}>
                ID: {movie.id}
              </div>
            );
          })}{" "}
        </ul>
      ) : (
        "No movies liked yet"
      )} */}

      <h2>Liked Movies (api fetch)</h2>
      <button
        className="p-8 bg-slate-500"
        onClick={() => {
          // setShowLikedDetails(!showLikedDetails); // fetchar varje gång du open/close...
          setShowLikedDetails(true);
        }}
      >
        Show Details
      </button>

      {showLikedDetails ? (
        likedMoviesListDetails && likedMoviesListDetails.length > 0 ? (
          <SlideMenu>
            {likedMoviesListDetails.map((movie, index) => (
              <SlideMenuMovieCard
                key={index}
                title={movie.title}
                poster={movie.poster} // Assuming you have 'poster' and 'overview' properties in 'likedMoviesListDetails'
                overview={movie.overview}
              />
            ))}
          </SlideMenu>
        ) : (
          "No movies liked yet"
        )
      ) : (
        ""
      )}
    </>
  );
}
