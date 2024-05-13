"use client";
import { useEffect, useState } from "react";
import { fetchMovieObject, host } from "../utils";
import SlideMenu from "./SlideMenu";
import MovieCardWatchAndLike from "./MovieCardWatchAndLike";

export default function WatchListSlideMenu2() {
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
      //const tokenStorage = localStorage.getItem("token");
      //setToken(tokenStorage);
      /* console.log(
        "fetched localStorage token for Account data: ",
        tokenStorage
      ); */
      const response = await fetch(`${host}/me/watchandlikelists`, {
        // users sidan på backend! dvs inte riktiga sidan!
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      
      const data = await response.json();


      
      if (data.movieWatchList && data.likedMoviesList) {
        //if (data.movieWatchList && data.movieWatchList.length > 0 && data.likedMoviesList && data.likedMoviesList.length > 0) {
        
        console.log(
          "fetched data.movieWatchList from backend: ",
          data.movieWatchList, " and fetched data.likedMoviesList from backend: ",
          data.likedMoviesList)
        setMovieWatchList(data.movieWatchList);
        setLikedMoviesList(data.likedMoviesList);

       // setLikedSeriesList(data.likedSeriesList);
      } else {
        console.log("failed to fetch watch- and like-lists from backend, or they are empty");
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
      (movieWatchList && movieWatchList.length > 0 ) // ||
      //(likedSeriesList && likedSeriesList.length > 0)
    ) {
      movieWatchList.forEach(async (movie) => {

        // first check if movie in watchlist is liked
        let isLiked;
        if (likedMoviesList && likedMoviesList.length > 0) {
          isLiked = likedMoviesList.find((likedMovie) => {
            return likedMovie.id === movie.id; 
          })
        }

        // now fetching movie object from our database
        const movieObject = await fetchMovieObject(movie.id); 
        console.log("movieObject: ", movieObject);

        if (movieObject.title) {
          setMovieWatchListDetails((prevDetails) => [
            ...prevDetails, 
            {
              id: movieObject.id, // or movie.id
              title: movieObject.title,
              overview: movieObject.overview,
              voteAverage: movieObject.vote_average,
              release: movieObject.release_date,
              tagline: movieObject.tagline,
              runtime: movieObject.runtime,
              backdrop: `https://image.tmdb.org/t/p/w500${movieObject.backdrop_path}`,
              poster: `https://image.tmdb.org/t/p/w500${movieObject.poster_path}`,
              isLiked: isLiked,
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
  if (!listsFetched) { 
    return (
      <>
        <div className="inline-block w-full h-80 md:h-96 mx-4 bg-slate-950 text-slate-100">
          Loading watchlist...
        </div>
      </>
    );
  }

  return (
    <>
      {listsFetched && movieWatchListDetails && movieWatchListDetails.length > 0 ? (
        <SlideMenu>
          {movieWatchListDetails.map((movie, index) => (
            <MovieCardWatchAndLike
              key={index}
              //isLiked={true} // såklart är filmen liked eftersom den är i likelistan.... :)
              voteAverage={movie.voteAverage}
              isLiked={movie.isLiked}
              isInWatchList={true}
              id={movie.id}
              title={movie.title}
              poster={movie.poster}
              overview={movie.overview}
            ></MovieCardWatchAndLike>
          ))}
        </SlideMenu>
      ) : (
        <div className="inline-block w-full h-80 md:h-96 mx-4">
          <p>No movies in watchlist yet</p>  {/*  TODO: detta visas i en millisekund när man refreshar... */}
        </div>
      )}
    </>
  );
}
