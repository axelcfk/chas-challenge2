"use client";
/* import dotenv from "dotenv";
dotenv.config(); */

export const host = process.env.NEXT_PUBLIC_HOST;

export async function postAddToLikeList(id, movieOrSeries, title) {
  //const [token, setToken] = useState(null);

  /* useEffect(() => {

    const tokenStorage = localStorage.getItem("token");
    //setToken(tokenStorage);
    console.log(
      "fetched token from localStorage: ",
      tokenStorage
    );
 
    setToken(tokenStorage);
  }, []) */


  try {
    const token = localStorage.getItem("token");
    //const response = await fetch("http://16.171.5.238:4000/sessions", {
    const response = await fetch(`${host}/api/me/likelists/addtolikelist`, {
      // users sidan på backend! dvs inte riktiga sidan!
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        movieId: id,
        title: title,
        movieOrSeries: movieOrSeries,
        token: token,
      }),
    });
  } catch (error) {
    console.error("Error posting like to backend:", error);
  }
}

export async function postRemoveFromLikeList(id, movieOrSeries, title) {
  console.log("test");
  try {
    const token = localStorage.getItem("token");

    //const response = await fetch("http://16.171.5.238:4000/sessions", {
    const response = await fetch(`${host}/api/me/likelists/removefromlikelist`, {
      // users sidan på backend! dvs inte riktiga sidan!
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        movieId: id,
        movieOrSeries: movieOrSeries,
        title: title,
        token: token,
      }),
    });
  } catch (error) {
    console.error("Error posting like to backend:", error);
  }
}

export async function postAddToWatchList(id, movieOrSeries, title) {
  try {
    const token = localStorage.getItem("token");

    //const response = await fetch("http://16.171.5.238:4000/sessions", {
    const response = await fetch(`${host}/api/me/watchlists/addtowatchlist`, {
      // users sidan på backend! dvs inte riktiga sidan!
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        movieId: id,
        movieOrSeries: movieOrSeries,
        title: title,
        token: token,
      }),
    });
  } catch (error) {
    console.error("Error posting like to backend:", error);
  }
}

//Remove from watchlist

export async function postRemoveFromWatchList(id, movieOrSeries, title) {
  try {
    const token = localStorage.getItem("token");

    //const response = await fetch("http://16.171.5.238:4000/sessions", {
    const response = await fetch(`${host}/api/me/watchlists/removefromwatchlist`, {
      // users sidan på backend! dvs inte riktiga sidan!
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        movieId: id,
        movieOrSeries: movieOrSeries,
        title: title,
        token: token,
      }),
    });
  } catch (error) {
    console.error("Error posting like to backend:", error);
  }
}

// from our database!!!!!!!!!!! (not api)
export async function fetchMovieObject(id) {
  //console.log("Fetching movie details from backend for ID:", id);

  const response = await fetch(`${host}/api/movieobject`, {
    // users sidan på backend! dvs inte riktiga sidan!
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      movieId: id,
      movieOrSeries: "movie",
    }),
  });

  /* if (!response.ok) {
    throw new Error("Failed to fetch '/movieobject' GET");
  } */

  const data = await response.json();
  //console.log("data.movieObject: ", data.movieObject);

  return data.movieObject; // RETURNERAR MOVIE-OBJEKTET
}

// api.js
export async function postMovieToDatabase(movieObject) {
  try {
    const responseBackend = await fetch(`${host}/api/addmovietodatabase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        movie: movieObject,
        movieOrSeries: "movie",
      }),
    });

    if (!responseBackend.ok) {
      throw new Error("Failed to fetch 'addmovietodatabase' POST");
    }

    return true; // Indicate success if the request was successful
  } catch (error) {
    console.error("Error posting movie to database:", error);
    return false; // Indicate failure if an error occurred, not used atm???
  }
}

export async function postMovieProvidersToDatabase(
  movieProvidersObject
) {
  try {
    const responseBackend = await fetch(`${host}/api/addmovieproviderstodatabase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        movieProvidersObject: movieProvidersObject,
      }),
    });

    if (!responseBackend.ok) {
      throw new Error("Failed to fetch 'addmovieproviderstodatabase' POST");
    }

    //return true; // Indicate success if the request was successful
  } catch (error) {
    console.error("Error posting movie-providers object to database: ", error);
   // return false; // Indicate failure if an error occurred,  not used atm???
  }
}

export async function checkLikeList() {
  try {
    const data = await fetch(`${host}/api/me/likelists`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await data.json();
    console.log("likedMovieList", result.likedMoviesList);

    return Array.isArray(result.likedMoviesList) ? result.likedMoviesList : [];
  } catch (error) {
    console.error("Error fetching likelist:", error);
    return [];
  }
}

export async function fetchWatchAndLikeList() {
  try {
    const token = localStorage.getItem("token");

    //const tokenStorage = localStorage.getItem("token");
    //setToken(tokenStorage);
    /* console.log(
      "fetched localStorage token for Account data: ",
      tokenStorage
    ); */
    const response = await fetch(`${host}/api/me/watchandlikelists`, {
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

    // TODO: lägg till data.movieWatchList
    if (data.likedMoviesList && data.movieWatchList) {
      //if (data.movieWatchList && data.likedMoviesList) {

      console.log(
        "fetched data.likedMoviesList from backend: ",
        data.likedMoviesList
      );
      // setMovieWatchList(data.movieWatchList);
      //setLikedMoviesList(data.likedMoviesList);

      return data;

      // setLikedSeriesList(data.likedSeriesList);
    } else {
      console.log("failed to fetch like-lists from backend, or it is empty");
    }
  } catch (error) {
    console.error("Error fetching likelist:", error);
  }
}

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function fetchTMDBMovieDetails(movieId) {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}?api_key=${"b0aa22976a88a1f9ab9dbcd9828204b5"}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch movie details from TMDB");
  }
  const data = await response.json();
  return data;
}

export const handleQuerySubmit = async () => {
  setLoading(true);
  setMovies([]);
  setShowVideo(true);
  changeSpeed(5);

  // Check localStorage for cached data
  const cachedData = JSON.parse(localStorage.getItem("latestSearch"));
  const token = localStorage.getItem("token");

  console.log("Cached Data from localStorage:", cachedData);

  if (cachedData && cachedData.input === input) {
    setMovies(cachedData.movies);
    console.log("Using cached movies:", cachedData.movies);
    setLoading(false);
    setShowVideo(false);
    return;
  }

  try {
    const response = await fetch(`${host}/api/moviesuggest2`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: input, token: token }),
    });
    const data = await response.json();

    if (data.movieNames && data.movieNames.length > 0) {
      // Store the movie names in localStorage without extra quotes
      const sanitizedMovieNames = data.movieNames.map((name) =>
        name.replace(/^"|"$/g, "")
      );
      localStorage.setItem(
        "latestSearch",
        JSON.stringify({ movies: sanitizedMovieNames, input })
      );
      console.log("Saving to localStorage:", {
        movies: sanitizedMovieNames,
        input,
      });

      setTimeout(() => {
        setMovies(sanitizedMovieNames);
        console.log("Fetched movie names:", sanitizedMovieNames);
        setLoading(false);
        setErrorMessage("");
        setShowVideo(false);
      }, 10);
    } else {
      setErrorMessage(data.suggestion);
      console.log("Error Message Set:", data.suggestion);
      setNoResult(true);
      setLoading(false);
      setShowVideo(false);
    }
  } catch (error) {
    console.error("Failed to fetch AI suggestion:", error);
    setNoResult(true);
    setLoading(false);
    setShowVideo(false);
    changeSpeed(1);
  }
};
