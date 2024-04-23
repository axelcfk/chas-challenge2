"use client";

import { useState, useEffect } from "react";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [movieDetails, setMovieDetails] = useState({});
  const movieAPI_KEY = "4e3dec59ad00fa8b9d1f457e55f8d473";

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (movieDetails.id) {
        console.log("Fetching movie details for ID:", movieDetails.id); // Debug log
        try {
          const url = `https://api.themoviedb.org/3/movie/${movieDetails.id}?api_key=${movieAPI_KEY}`;
          const response = await fetch(url);
          const data = await response.json();
          if (data.title) {
            // Check if data includes title
            setMovieDetails({
              ...movieDetails,
              title: data.title,
              overview: data.overview,
              poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
            });
          } else {
            console.error("No movie found with the given ID"); // Error log if no movie is found
          }
        } catch (error) {
          console.error("Error fetching movie details:", error);
        }
      }
    };

    fetchMovieDetails();
  }, [movieDetails.id]); // Make sure this dependency is correct

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleQuerySubmit = async () => {
    console.log("Submitting query for movie:", input); // Debug log
    try {
      const response = await fetch("http://localhost:3010/moviesuggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });
      const data = await response.json();
      if (data.tmdbId) {
        console.log("Received TMDB ID:", data.tmdbId); // Debug log
        setMovieDetails({ id: data.tmdbId });
      } else {
        console.error("No TMDB ID received or error in response");
        // Handle missing ID or error response
      }
    } catch (error) {
      console.error("Failed to fetch AI suggestion:", error);
      // Handle network or server error
    }
  };

  return (
    <div className="flex flex-col justify-center items-center pt-10 px-20">
      {movieDetails.title ? (
        <div className="flex flex-col justify-center items-center">
          <h2 className="text-5xl font-semibold mb-10">{movieDetails.title}</h2>
          <p className="mb-10">{movieDetails.overview}</p>
          <img
            className="h-60 mb-10"
            src={movieDetails.poster}
            alt="Movie Poster"
          />
        </div>
      ) : (
        <p>No movie details to display</p> // Added a placeholder for no data
      )}
      <input
        className="h-20 bg-slate-200 w-full px-5 rounded-xl"
        type="text"
        value={input}
        onChange={handleInputChange}
        placeholder="Describe the movie you want..."
      />
      <button
        className="h-20 bg-blue-700 text-slate-50 w-full rounded-full my-10"
        onClick={handleQuerySubmit}
      >
        Find Movie
      </button>
    </div>
  );
}

// import { useState, useEffect } from "react";

// export default function ChatPage() {
//   const [joke, setJoke] = useState("");
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);

//   const apiKey = "a97f158a2149d8f803423ee01dec4d83";

//   const [movieName, setMovieName] = useState("Batman");
//   const [movieOverview, setMovieOverview] = useState("");
//   const [movieId, setMovieId] = useState(null);
//   const [moviePoster, setMoviePoster] = useState(""); // State for movie poster URL

//   useEffect(() => {
//     const fetchMovieData = async () => {
//       if (movieName) {
//         try {
//           const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
//             movieName
//           )}&api_key=${apiKey}`;
//           const response = await fetch(url);
//           const data = await response.json();

//           if (data.results.length > 0) {
//             setMovieOverview(data.results[0].overview);
//             setMovieId(data.results[0].id);
//             setMoviePoster(
//               `https://image.tmdb.org/t/p/w500${data.results[0].poster_path}`
//             ); // Set full URL for movie poster

//             console.log("Detailed movie object:", data.results[0]);
//           } else {
//             setMovieOverview("No overview available for this movie.");
//             setMovieId(null);
//             setMoviePoster(""); // Clear poster URL
//           }
//         } catch (error) {
//           console.error("Error fetching movie data:", error);
//           setMovieOverview("Failed to fetch movie details.");
//           setMovieId(null);
//           setMoviePoster("");
//         }
//       }
//     };

//     fetchMovieData();
//   }, [movieName]);

//   function handleInputChange(e) {
//     setInput(e.target.value);
//   }

//   function handleSubmit() {
//     setMovieName(input); // Set movieName to trigger useEffect
//     setInput(""); // Clear the input field
//   }

//   function LoadingIndicator() {
//     return (
//       <div className="loading-indicator">
//         <h3 className="font-semibold text-3xl">Count your blessings</h3>
//         <div className="loader m-10"></div>
//         <p className="font-semibold">Loading Gratitude guru ...</p>
//       </div>
//     );
//   }

//   async function fetchJoke() {
//     setLoading(true);
//     try {
//       const response = await fetch("http://localhost:3010/joke", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ input }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       setJoke(data.joke);
//     } catch (error) {
//       console.error("Failed to fetch joke:", error);
//       setJoke("Failed to load a joke. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div
//       style={{
//         backgroundImage: "url('/water2.jpg')",
//         backgroundPosition: "center",
//         backgroundSize: "cover",
//         backgroundRepeat: "no-repeat",
//       }}
//       className="h-screen w-screen"
//     >
//       <div className="flex justify-between px-10 md:px-20 pt-10">
//         <p className="text-3xl">LOGO</p>
//         <p className="text-4xl font-medium">☰</p>
//       </div>
//       <div className="flex justify-center">
//         <h1 className="text-4xl mt-10 font-semibold">Gratitude</h1>
//       </div>
//       <div className="h-full flex flex-col items-start w-full md:px-20 px-10 border-solid border-1 border-slate-800">
//         <h2 className="font-semibold mt-14 mb-5 text-xl">
//           Daily Reflection Prompt
//         </h2>
//         <div className="h-1/3 w-full bg-slate-205 rounded-xl p-5 border-2 border-slate-500">
//           {movieOverview}
//           {moviePoster && (
//             <img src={moviePoster} alt="Movie Poster" className="mt-4" />
//           )}
//         </div>

//         <input
//           type="text"
//           className="h-16 text-2xl p-5 rounded-xl bg-slate-300 w-full mb-2 mt-8"
//           placeholder="Write here..."
//           value={input}
//           onChange={handleInputChange}
//         />

//         <button
//           onClick={handleSubmit}
//           disabled={!input.trim()}
//           className={`text-xl h-16 w-full bg-slate-200 rounded-3xl font-semibold ${
//             !input.trim() ? "text-gray-400" : "text-black"
//           }`}
//         >
//           Send to gratitude guru
//         </button>
//       </div>
//     </div>
//   );
// }
