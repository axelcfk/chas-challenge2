"use client";
import { useEffect, useState } from "react";
import { fetchMovieObject, host, postMovieToDatabase } from "../utils";
import SlideMenu from "./SlideMenu";
import MovieCardWatchAndLike from "./MovieCardWatchAndLike";

export default function PopularSlideMenu() {
  const [movieWatchList, setMovieWatchList] = useState([]);
  const [likedMoviesList, setLikedMoviesList] = useState(null); // to check if a movie is liked...
  const [listsFetched, setListsFetched] = useState(false);
  const [movieProvidersBackend, setMovieProvidersBackend] = useState([]);
 // const [likedSeriesList, setLikedSeriesList] = useState(null);
  //const [likedSeriesFetched, setLikedSeriesFetched] = useState(false); // bara en behövs
  const [fetchedMovieProviders, setFetchedMovieProviders] = useState(false);


  const [popularMovies, setPopularMovies] = useState([]);

  const [popularListDetails, setPopularListDetails] = useState([]);

   // TODO: flytta dessa useEffects till backend?
   useEffect(() => {
    fetchWatchAndLikeList();
  }, []);


  useEffect(() => {
    setPopularMovies([]);
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
  }, [listsFetched]);

  // TODO: mappa igenom popular movies och spara de i databas?

 

  useEffect(() => {

    popularMovies.forEach(async (movie) =>  {
      await fetchMovieProviders(movie.id);
    });
    /* if (movieProvidersBackend.length === 20 ){
      setFetchedMovieProviders(true);
    } */

  }, [popularMovies])

  useEffect(() => {

    if (movieProvidersBackend.length === 20 ){
      setFetchedMovieProviders(true);
    }
    
  }, [movieProvidersBackend])
  console.log("pop movies: ", popularMovies);
  console.log(movieProvidersBackend);

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

      if (movieProvidersBackend.movieId !== data.movieId) {

        setMovieProvidersBackend((prevDetails) => [
          ...prevDetails,
          {
            providers: data.movieProvidersObject,
            movieId: data.movieId,
          },
        ]);
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
      popularMovies &&
      popularMovies.length > 0 // ||
      //(likedSeriesList && likedSeriesList.length > 0)
    ) {
      popularMovies.forEach(async (movie) => {

        await postMovieToDatabase(movie); 

        let movieProvidersObject;
        console.log("movieProvidersBackend: ", movieProvidersBackend);
        if (movieProvidersBackend.length != 0) {

          movieProvidersObject = movieProvidersBackend.find(movieProviders => {
            return movieProviders.movieId === movie.id;
          })
        } else {
          console.log("failed to fetch movie providers? ");
        }
        console.log("movieProvidersObject: ", movieProvidersObject);

        let streamingProviders;
        if (movieProvidersObject.providers.flatrate) {
          streamingProviders = movieProvidersObject.providers.flatrate;
        } else if (movieProvidersObject.providers.noProviders) {
          streamingProviders = movieProvidersObject.providers.noProviders
        } else {
          console.log("failed to read movieProvidersObject.providers");
        }
         
        console.log("streaming providers of movie id ", movie.id, ": ", streamingProviders);
        
        
        // first check if movie in watchlist is liked
        let isLiked = false;
        if (likedMoviesList && likedMoviesList.length > 0) {
          isLiked = likedMoviesList.find((likedMovie) => {
            return likedMovie.id === movie.id;
          });
        }

        let isInWatchList = false;
        if (likedMoviesList && likedMoviesList.length > 0) {
          isInWatchList = movieWatchList.find((watchListedMovie) => {
            return watchListedMovie.id === movie.id;
          });
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
              flatrate: streamingProviders,
            },
          ]);
        } else {
          console.log("data.title does not exist?");
        }
      });
    }
    //}, [showLikedDetails]);
  }, [fetchedMovieProviders]);


  //if (likedMoviesList = = null || likedSeriesList == null) {
  if (popularListDetails.length === 0) { 
    return (
      <>
        <div className="inline-block w-full h-80 md:h-96 mx-4 bg-slate-950 text-slate-100">
          Loading watchlist...
        </div>
      </>
    );
  }

  return (
    <div>
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
              streamingServices={movie.flatrate}
            ></MovieCardWatchAndLike>
          ))}
        </SlideMenu>
      ) : (
        <div className="inline-block w-full h-80 md:h-96 mx-4">
          <p>No movies in watchlist yet</p>{" "}
          {/*  TODO: detta visas i en millisekund när man refreshar... */}
        </div>
      )}
    </div>
  );
}
