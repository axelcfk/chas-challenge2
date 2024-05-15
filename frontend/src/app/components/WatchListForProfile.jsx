"use client";
import { useEffect, useState } from "react";
import { fetchMovieObject, host } from "../utils";
import MovieCardWatchAndLike from "./MovieCardWatchAndLike";

export default function WatchListForProfile({ profilePage }) {
  const [movieWatchList, setMovieWatchList] = useState([]);
  const [listsFetched, setListsFetched] = useState(false);
  const [movieWatchListDetails, setMovieWatchListDetails] = useState([]);
  const [likedMoviesList, setLikedMoviesList] = useState(null);

  useEffect(() => {
    fetchWatchAndLikeList();
  }, []);

  async function fetchWatchAndLikeList() {
    try {
      const response = await fetch(`${host}/me/watchandlikelists`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.movieWatchList && data.likedMoviesList) {
        console.log(
          "fetched data.movieWatchList from backend: ",
          data.movieWatchList,
          " and fetched data.likedMoviesList from backend: ",
          data.likedMoviesList
        );
        setMovieWatchList(data.movieWatchList);
        setLikedMoviesList(data.likedMoviesList);
      } else {
        console.log(
          "failed to fetch watch- and like-lists from backend, or they are empty"
        );
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setListsFetched(true);
    }
  }

  useEffect(() => {
    if (listsFetched && movieWatchList.length > 0) {
      const fetchMovieDetails = async () => {
        const movieDetails = await Promise.all(
          movieWatchList.map(async (movie) => {
            let isLiked = false;
            if (likedMoviesList && likedMoviesList.length > 0) {
              isLiked = likedMoviesList.some(
                (likedMovie) => likedMovie.id === movie.id
              );
            }

            const movieObject = await fetchMovieObject(movie.id);
            console.log("movieObject: ", movieObject);

            if (movieObject.title) {
              return {
                id: movieObject.id,
                title: movieObject.title,
                overview: movieObject.overview,
                voteAverage: movieObject.vote_average,
                release: movieObject.release_date,
                tagline: movieObject.tagline,
                runtime: movieObject.runtime,
                backdrop: `https://image.tmdb.org/t/p/w500${movieObject.backdrop_path}`,
                poster: `https://image.tmdb.org/t/p/w500${movieObject.poster_path}`,
                isLiked: isLiked,
              };
            } else {
              console.log("data.title does not exist?");
              return null;
            }
          })
        );

        setMovieWatchListDetails(
          movieDetails.filter((detail) => detail !== null)
        );
      };

      fetchMovieDetails();
    }
  }, [listsFetched, likedMoviesList, movieWatchList]);

  if (likedMoviesList == null) {
    return (
      <div className="inline-block w-full h-80 md:h-96 mx-4 bg-slate-950 text-slate-100">
        Loading watchlist...
      </div>
    );
  }

  return (
    <>
      {listsFetched && movieWatchListDetails.length > 0 ? (
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
              showRating={false}
              profilePage={profilePage}
              className="movie-card"
            />
          ))}
        </div>
      ) : (
        <div className="inline-block w-full h-80 md:h-96 mx-4">
          <p>No movies in watchlist yet</p>
        </div>
      )}
    </>
  );
}
