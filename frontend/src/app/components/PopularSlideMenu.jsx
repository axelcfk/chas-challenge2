"use client";
import { useEffect, useState } from "react";
import { fetchMovieObject, host, postMovieToDatabase } from "../utils";
import SlideMenu from "./SlideMenu";
import MovieCardWatchAndLike from "./MovieCardWatchAndLike";

export default function PopularSlideMenu() {
  const [movieWatchList, setMovieWatchList] = useState([]);
  const [likedMoviesList, setLikedMoviesList] = useState(null); // to check if a movie is liked...
  const [listsFetched, setListsFetched] = useState(false);
 // const [likedSeriesList, setLikedSeriesList] = useState(null);
  //const [likedSeriesFetched, setLikedSeriesFetched] = useState(false); // bara en behövs


  const [popularMovies, setPopularMovies] = useState([]);

  const [popularListDetails, setPopularListDetails] = useState([]);



  useEffect(() => {
    const apiKey = "71a2109e9f6fadaf14036ae6c29ac5b7";
    const fetchPopularMovies = async () => {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`
      );
      const data = await response.json();

      //postMovieToDatabase(data)

      setPopularMovies(data.results);
    };

    fetchPopularMovies();
  }, []);

  // TODO: mappa igenom popular movies och spara de i databas?



  // TODO: flytta dessa useEffects till backend?
  useEffect(() => {
    fetchWatchAndLikeList();
  }, [popularMovies]);

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
      (popularMovies && popularMovies.length > 0 ) // ||
      //(likedSeriesList && likedSeriesList.length > 0)
    ) {
      popularMovies.forEach(async (movie) => {

        await postMovieToDatabase(movie); 

        

        // first check if movie in watchlist is liked
        let isLiked = false;
        if (likedMoviesList && likedMoviesList.length > 0) {
          isLiked = likedMoviesList.find((likedMovie) => {
            return likedMovie.id === movie.id; 
          })
        }

        let isInWatchList = false;
        if (likedMoviesList && likedMoviesList.length > 0) {
          isInWatchList = movieWatchList.find((watchListedMovie) => {
            return watchListedMovie.id === movie.id; 
          })
        }


        // now fetching movie object from our database
       // const movieObject = await fetchMovieObject(movie.id); 
        //console.log("movieObject: ", movieObject);

        if (movie.title) {
          setPopularListDetails((prevDetails) => [
            ...prevDetails, 
            {
              id: movie.id, // or movi  e.id
              title: movie.title,
              overview: movie.overview,
              voteAverage: movie.vote_average,
              release: movie.release_date,
              tagline: movie.tagline,
              runtime: movie.runtime,
              backdrop: `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`,
              poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
              isLiked: isLiked, 
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


  //if (likedMoviesList = = null || likedSeriesList == null) {
  if (likedMoviesList == null) { 
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
      {listsFetched && popularListDetails && popularListDetails.length > 0 ? (
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
