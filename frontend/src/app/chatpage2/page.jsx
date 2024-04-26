"use client";

import { useState, useEffect } from "react";
import MovieCard from "./moviecards";

// https://api.themoviedb.org/3/movie/550/watch/providers?api_key=a97f158a2149d8f803423ee01dec4d83

export default function ChatPage2() {
  const [input, setInput] = useState("");
  const [movieDetails, setMovieDetails] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noResult, setNoResult] = useState(false);
  const [movieDetailsFetched, setMovieDetailsFetched] = useState(false);
  const movieAPI_KEY = "4e3dec59ad00fa8b9d1f457e55f8d473"; // Use an appropriate API key

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleQuerySubmit = async () => {
    setLoading(true);
    setNoResult(false);
    try {
      const response = await fetch("http://localhost:3010/moviesuggest2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });
      const data = await response.json();
      console.log("Data received:", data);

      if (data.movieNames && data.movieNames.length > 0) {
        console.log("Received Movie Names:", data.movieNames);
        setMovies(data.movieNames);
      } else {
        setNoResult(true);
      }
    } catch (error) {
      console.error("Failed to fetch AI suggestion:", error);
      setNoResult(true);
    } finally {
      setLoading(false);
    }
  };

  // Example of setting multiple movie details (assuming you fetch each movie's details):
  useEffect(() => {
    async function fetchAllMovieDetails() {
      const allMovieDetails = await Promise.all(
        movies.map(async (title) => {
          try {
            const encodedTitle = encodeURIComponent(title);
            const response = await fetch(
              `https://api.themoviedb.org/3/search/movie?query=${encodedTitle}&api_key=${movieAPI_KEY}`
            );
            const data = await response.json();
            console.log(data.results);
            if (data.results.length > 0) {
              const movieId = data.results[0].id;
              const detailsResponse = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}?api_key=${movieAPI_KEY}`
              );
              const detailsData = await detailsResponse.json();
              const posterPath = detailsData.poster_path;
              const posterUrl = posterPath
                ? `https://image.tmdb.org/t/p/w500${posterPath}`
                : null;
              return {
                title: detailsData.title,
                id: movieId,
                poster: posterUrl,
                overview: detailsData.overview,
                // Add more details as needed
              };
            }
          } catch (error) {
            console.error(`Error fetching details for ${title}:`, error);
          }
        })
      );
      setMovieDetails(allMovieDetails.filter((detail) => detail !== undefined));
    }

    if (movies.length > 0) fetchAllMovieDetails();
  }, [movies]);

  console.log("movies:", movies);
  console.log("moviedetails :", movieDetails);

  return (
    <div className="flex flex-col justify-center items-center md:items-start  px-10 md:px-20 h-screen w-screen bg-slate-950 text-slate-100">
      <div className="flex justify-center items-center  h-full">
        <div
          className="flex flex-col
         justify-center items-center flex-wrap"
        >
          {movieDetails.map((movie, index) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 pb-10 px-8 md:px-20 bg-slate-950">
        <input
          style={{ border: "1px solid grey" }}
          className="h-14 bg-transparent w-full md:w-1/3 px-5 rounded-xl text-lg text-center text-slate-50"
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Describe the movie you want..."
        />
        <button
          className={`h-12 ${
            input
              ? "bg-slate-100 hover:bg-slate-300 text-slate-900"
              : "bg-slate-400 text-slate-900"
          } w-full md:w-1/3 rounded-full mt-5 font-semibold text-xl`}
          onClick={handleQuerySubmit}
          disabled={!input}
        >
          Find Movie
        </button>
      </div>
    </div>
  );
}

// const [input, setInput] = useState("");
// const [movieDetails, setMovieDetails] = useState({});
// const [movies, setMovies] = useState([]);
// const [loading, setLoading] = useState(false);
// const [noResult, setNoResult] = useState(false);
// const [movieDetailsFetched, setMovieDetailsFetched] = useState(false);
// const [toggleExpanded, setToggleExpanded] = useState(false);
// // const [chatGPTFetched, setChatGPTFetched] = useState(false);

// const movieAPI_KEY = "4e3dec59ad00fa8b9d1f457e55f8d473"; //AXEL
// // const movieAPI_KEY = "a97f158a2149d8f803423ee01dec4d83"; // MARCUS

// function handleToggle() {
//   setToggleExpanded(!toggleExpanded);
// }

// const resetState = () => {
//   setNoResult(false);
//   setInput("");
//   setMovieDetails({});
//   setLoading(false);
//   setMovieDetailsFetched(false);
//   // setChatGPTFetched(false);
// };

// useEffect(() => {
//   if (movieAPI_KEY != null && loading && movieDetails.titleFromGPT) {
//     console.log("title received from GPT: ", movieDetails.titleFromGPT);
//     const encodedMovieTitle = encodeURIComponent(movieDetails.titleFromGPT);
//     console.log("encoded movie title: ", encodedMovieTitle);

//     fetch(
//       `https://api.themoviedb.org/3/search/movie?query=${encodedMovieTitle}&api_key=${movieAPI_KEY}`
//     )
//       .then((response) => response.json())
//       .then((data) => {
//         // Extract movie ID from the response
//         console.log("id from API: ", data.results[0].id);

//         setMovieDetails({
//           ...movieDetails,
//           idFromAPI: data.results[0].id,
//         }); // Assuming we want the first result
//       })
//       .catch((error) => console.error("Error fetching data:", error));
//   }
// }, [movieDetails.titleFromGPT]);

// useEffect(() => {
//   //setLoading(true);

//   const fetchMovieDetails = async () => {
//     if (movieDetails.idFromAPI) {
//       console.log("Fetching movie details for ID:", movieDetails.idFromAPI);
//       try {
//         const url = `https://api.themoviedb.org/3/movie/${movieDetails.idFromAPI}?api_key=${movieAPI_KEY}`;
//         const response = await fetch(url);
//         const data = await response.json();
//         console.log(data);
//         console.log(data.vote_average);
//         if (data.title) {
//           // Check if data includes title
//           setMovieDetails({
//             ...movieDetails,
//             titleFromAPI: data.title, // om vi inte redan gjort detta via ChatGpts response
//             overview: data.overview,
//             voteAverage: data.vote_average,
//             release: data.release_date,
//             tagline: data.tagline,
//             runtime: data.runtime,
//             backdrop: `https://image.tmdb.org/t/p/w500${data.backdrop_path}`,
//             poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
//           });
//           setMovieDetailsFetched(true); // Mark that movie details have been fetched
//         } else {
//           console.error("No movie found with the given ID");
//         }
//       } catch (error) {
//         console.error("Error fetching movie details:", error);
//       }
//     }
//   };

//   fetchMovieDetails();
// }, [movieDetails.idFromAPI]);

// useEffect(() => {
//   //setLoading(true);

//   const fetchWatchProviders = async () => {
//     if (movieDetails.idFromAPI) {
//       console.log("Fetching movie providers for ID:", movieDetails.idFromAPI);
//       try {
//         const url = `https://api.themoviedb.org/3/movie/${movieDetails.idFromAPI}/watch/providers?api_key=${movieAPI_KEY}`;
//         const response = await fetch(url);
//         const data = await response.json();
//         //console.log(data); // MYCKET DATA
//         console.log("Watch Providers API Response:", data); // Log the API response
//         if (
//           data &&
//           data.results &&
//           data.results.SE &&
//           data.results.SE.flatrate
//         ) {
//           // Extract providers for 'SE' locale
//           const seProviders = data.results.SE.flatrate.map(
//             (provider) => provider.provider_name
//           );
//           // Update movieDetails state
//           console.log(seProviders);
//           setMovieDetails({
//             ...movieDetails,
//             SE: seProviders,
//           });
//         } else {
//           console.error("No movie found with the given ID");
//         }
//       } catch (error) {
//         console.error("Error fetching movie details:", error);
//       } finally {
//         setLoading(false); // Set loading to false after fetching providers
//       }
//     }
//   };

//   fetchWatchProviders();
// }, [movieDetailsFetched]);

// const handleInputChange = (e) => {
//   setInput(e.target.value);
// };

// const handleQuerySubmit = async () => {
//   setLoading(true);
//   console.log("Submitting query for movie:", input);
//   try {
//     const response = await fetch("http://localhost:3010/moviesuggest", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ query: input }),
//     });
//     const data = await response.json();
//     if (data.movieNames && data.movieNames.length > 0) {
//       console.log("Received Movie Names:", data.movieNames);
//       setMovies(data.movieNames); // Store the movie names in state
//       setLoading(false);
//     } else {
//       setNoResult(true);
//       setLoading(false);
//       console.error("No movie names received or error in response");
//     }
//   } catch (error) {
//     console.error("Failed to fetch AI suggestion:", error);
//     setLoading(false);
//   }
// };

// function LoadingIndicator() {
//   return (
//     <div className="loading-indicator ">
//       <h3 className="font-semibold text-3xl">Exciting stuff!</h3>
//       <div className="loader m-10"></div>
//       <p className="font-semibold text-xl">Finding a movie match ... </p>
//     </div>
//   );
// }

//   useEffect(() => {

//     async function fetchMovieID() {
//       if (movieDetails.titleFromGPT) {
//         try {
//           const encodedMovieTitle = encodeURIComponent(
//             movieDetails.titleFromGPT
//           );
//           const response = await fetch(
//             `https://api.themoviedb.org/3/search/movie?query=${encodedMovieTitle}&api_key=${movieAPI_KEY}`
//           );
//           const data = await response.json();
//           if (data.results && data.results.length > 0) {
//             setMovieDetails((prevDetails) => ({
//               ...prevDetails,
//               idFromAPI: data.results[0].id,
//             }));
//           } else {
//             console.error("No movie found with the given title");
//           }
//         } catch (error) {
//           console.error("Error fetching movie ID:", error);
//         }
//       }
//     }
//     fetchMovieID();
//   }, [movieDetails.titleFromGPT]);

//   useEffect(() => {
//     async function fetchMovieDetails() {
//       if (movieDetails.idFromAPI) {
//         try {
//           const response = await fetch(
//             `https://api.themoviedb.org/3/movie/${movieDetails.idFromAPI}?api_key=${movieAPI_KEY}`
//           );
//           const data = await response.json();
//           setMovieDetailsFetched(true);
//           setMovieDetails((prevDetails) => ({
//             ...prevDetails,
//             ...data,
//             backdrop: `https://image.tmdb.org/t/p/w500${data.backdrop_path}`,
//             poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
//           }));
//         } catch (error) {
//           console.error("Error fetching movie details:", error);
//         }
//       }
//     }
//     fetchMovieDetails();
//   }, [movieDetails.idFromAPI]);

//   useEffect(() => {
//     async function fetchWatchProviders() {
//       if (movieDetailsFetched && movieDetails.idFromAPI) {
//         try {
//           const response = await fetch(
//             `https://api.themoviedb.org/3/movie/${movieDetails.idFromAPI}/watch/providers?api_key=${movieAPI_KEY}`
//           );
//           const data = await response.json();
//           if (data.results && data.results.SE && data.results.SE.flatrate) {
//             setMovieDetails((prevDetails) => ({
//               ...prevDetails,
//               SE: data.results.SE.flatrate.map(
//                 (provider) => provider.provider_name
//               ),
//             }));
//           }
//         } catch (error) {
//           console.error("Error fetching watch providers:", error);
//         }
//       }
//     }
//     fetchWatchProviders();
//   }, [movieDetailsFetched]);
