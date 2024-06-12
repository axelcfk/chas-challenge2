// TODO:
//? FIXME:
//? Question:
//* IMPORTANT INFORMATION:
//! This is an alert
// Regular

import express from "express";
import cors from "cors";
import OpenAI from "openai";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import crypto from "crypto";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const port = 3010;
const host = process.env.HOST;


app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// CORS-konfiguration
const corsOptions = {
  origin: [
    "http://16.171.5.238:3000",
    "https://ludi-app.com",
    "https://www.ludi-app.com",
    "http://ludi-app.com:3000",
    "http://localhost",
    "http://localhost:3000"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "INSERT"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.options("*", cors(corsOptions)); // Handle preflight requests

// app.use(cors(corsOptions));
// app.use(bodyParser.json());

// // Middleware for setting headers (applied globally)
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", req.headers.origin);
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   next();
// });

// // CORS-konfiguration
// const corsOptions = {
//   origin: "http://16.171.5.238:3000",
//   credentials: true,
// };

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Middleware för att sätta CORS-rubriker korrekt
/* app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", `${host}:3000`);
  res.header("Access-Control-Allow-Credentials", "true");
  next();
}); */

const movieAPI_KEY = "4e3dec59ad00fa8b9d1f457e55f8d473";

let poolConfig = {
  //host: "mysql",
  host: process.env.DB_HOST,
  user: "root",
  password: "root",
  database: "movie-app-sql"
};

// if working locally we add the port. On AWS it should be an empty line
if (process.env.ENVIRONMENT === 'local') {
  poolConfig.port = process.env.DB_PORT;
}

const pool = mysql.createPool(poolConfig);

// connect to DB
/* const pool = mysql.createPool({
  host: "mysql",
  user: "root",
  password: "root",
  database: "movie-app-sql",
  //port: process.env.DB_PORT,
  // port: 3306 || 8889,
});
 */


let likedMoviesList = []; // TA BORT NÄR VI HAR FIXAT MYSQL
let likedMoviesListId = 1;
let likedSeriesList = []; // TA BORT NÄR VI HAR FIXAT MYSQL
let movieWatchList = []; // TA BORT NÄR VI HAR FIXAT MYSQL
let movieWatchListId = 1;
let seriesWatchList = []; // TA BORT NÄR VI HAR FIXAT MYSQL
//let dailyMixBasedOnLikes = [];

function generateOTP() {
  return crypto.randomBytes(16).toString("hex"); // Generera ett OTP med crypto
}

// help function to make code look nicer
async function query(sql, params) {
  const [results] = await pool.execute(sql, params); // får en array, så måste vara [results]...?
  return results;
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// CREATE ACCOUNT
app.post("/users", async (req, res) => {
  const { username, password } = req.body;
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  try {
    const userExists = await query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (userExists.length > 0) {
      return res
        .status(400)
        .json({ message: "This username is already taken" });
    }

    const insertResult = await query(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword]
    );
    const userId = insertResult.insertId;
    // TODO: TA BORT NÄR MYSQL ÄR REDO (behöver inte skapa tomma listor med mysql):
    likedMoviesList.push({
      likedMoviesListId: likedMoviesListId++,
      userId: userId,
      myLikedMoviesList: [],
    });

    // create empty watchlist for new user
    movieWatchList.push({
      movieWatchListId: movieWatchListId++,
      userId: userId,
      myMovieWatchList: [],
    });

    res.status(201).json({
      message: "User created successfully",
      userId: userId,
      username: username,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user" });
  }
});

// SESSION
app.post("/sessions", async (req, res) => {
  console.log("Login attempt:", req.body);

  const { username, password } = req.body;
  try {
    const user = await query(
      "SELECT id, password FROM users WHERE username = ?",
      [username]
    );
    console.log("User fetch result:", user);

    if (user.length > 0) {
      const userData = user[0];
      const passwordIsValid = await bcrypt.compare(password, userData.password);
      console.log("Password validation result:", passwordIsValid);

      if (passwordIsValid) {
        const token = generateOTP();
        console.log("Generated Token:", token);

        await query("INSERT INTO sessions (user_id, token) VALUES (?, ?)", [
          userData.id,
          token,
        ]);
        console.log("Session saved in database with token:", token);

        // Sätt token i cookies
        res.cookie("token", token, {
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        });
        console.log("Cookie set with token:", token);

        res.json({
          message: "Login successful",
          token,
          user: { id: userData.id, username: userData.username },
          // user: { userId: userData.id, username: userData.username },
        });
      } else {
        console.log("Invalid password");
        res.status(401).json({ message: "Invalid credentials" });
      }
    } else {
      console.log("User not found");
      res.status(401).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Error logging in user");
  }
});

app.post("/logout", async (req, res) => {
  const token = req.cookies.token;
  console.log("Logout attempt, receiced token:", token);

  if (!token) {
    return res.status(400).json({ message: "No token found" });
  }

  try {
    // Remove session from database
    await query("DELETE FROM sessions WHERE token = ?", [token]);
    console.log("Sessions deleted for token:", token);

    // Clear cookie
    res.clearCookie("token");
    console.log("Cookie cleared for token:", token);

    res.json({ message: "Logout succesful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Error during logout" });
  }
});

// Endpoint for authentication
app.get("/session-status", async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ loggedIn: false });
  }

  try {
    const session = await query(
      "SELECT user_id FROM sessions WHERE token = ?",
      [token]
    );

    if (session.length > 0) {
      const user = await query("SELECT * FROM users WHERE id = ?", [
        session[0].user_id,
      ]);

      if (user.length > 0) {
        return res.json({ loggedIn: true, user: user[0] });
      } else {
        return res.status(401).json({ loggedIn: false });
      }
    } else {
      return res.status(401).json({ loggedIn: false });
    }
  } catch (error) {
    res.status(500).json({ loggedIn: false });
  }
});

//let movieIds = [];

async function fetchMovieIdFromTMDB(movieNameFromGPT) {
  try {
    // Extract movie name from the request body
    // const { movieName } = req.body;

    // Check if movieName is provided
    if (!movieNameFromGPT) {
      return res
        .status(400)
        .json({ error: "Movie name is required from ChatGPT" });
    }

    // Make API call to TMDB
    const encodedMovieTitle = encodeURIComponent(movieNameFromGPT);
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodedMovieTitle}&api_key=${movieAPI_KEY}`
    );
    const data = await response.json();

    // Check if there are results and extract movie ID
    if (data.results && data.results.length > 0) {
      const movieId = data.results[0].id;
      // Push movie ID into the array
      //setMovieIdsFromAPI((prevIds) => [...prevIds, data.results[0].id]);

      //movieIds.push(movieId); // TODO: should this ID be deleted later on when we have fetched the whole movie object? to preserve storage?
      return movieId;
    } else {
      console.error(
        "Error fetching movie ID in fetchMovieIdFromTMDB() function"
      );
      return null;
    }
  } catch (error) {
    console.error("Error fetching movie ID:", error);
  }
}

// fetch movie id after chatgpt has provided a moviename
/* app.post("/fetchmovieidTMDB", async (req, res) => {
  try {
    // Extract movie name from the request body
    const { movieName } = req.body;

    // Check if movieName is provided
    if (!movieName) {
      return res.status(400).json({ error: 'Movie name is required from ChatGPT' });
    }

    // Make API call to TMDB
    const encodedMovieTitle = encodeURIComponent(movieName);
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodedMovieTitle}&api_key=${movieAPI_KEY}`);
    const data = await response.json();

    // Check if there are results and extract movie ID
    if (data.results && data.results.length > 0) {
      const movieId = data.results[0].id;
      // Push movie ID into the array
      //setMovieIdsFromAPI((prevIds) => [...prevIds, data.results[0].id]); 
      movieIds.push(movieId); // TODO: should this ID be deleted later on when we have fetched the whole movie object? to preserve storage?
      return res.status(200).json({ message: 'Movie ID fetched successfully', movieId });
    } else {
      return res.status(404).json({ error: 'Movie not found' });
    }
  } catch (error) {
    console.error('Error fetching movie ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}) */

const fetchAllMovieIdsFromTMDB = async (movieNamesFromGPT) => {
  //setLoading(true);

  // Create an array to store all the promises
  console.log("all movienames suggested by GPT: ", movieNamesFromGPT);

  const fetchPromises = movieNamesFromGPT.map(async (movieName) => {
    // Await each fetch inside the map function
    return await fetchMovieIdFromTMDB(movieName);
  });

  // Wait for all the fetches to complete
  const fetchedMovieIds = await Promise.all(fetchPromises); // array within array
  console.log("fetchedMovieIds: ", fetchedMovieIds);
  return fetchedMovieIds;

  // Once all fetches are complete, set idsReceivedFromAPI to true
  //setIdsReceivedFromAPI(true); // just to trigger the useEffect below
};

/* app.post("/fetchallmovieidsTMDB", async (req, res) => {
  try {
    const { movieNamesFromGPT } = req.body;

    if (!movieNamesFromGPT || movieNamesFromGPT.length === 0) {
      return res.status(400).json({ error: 'No movie names provided by ChatGPT' });
    }

    const fetchPromises = movieNamesFromGPT.map(async (movieName) => {
      // Make a request to /fetchmovieidTMDB endpoint for each movie name
      const response = await fetch(`${host}/fetchmovieidTMDB`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ movieName })
      });

      const data = await response.json();
      if (response.ok) {
        // If the response is successful, you can do something with the data
        console.log('Movie ID fetched successfully:', data.movieId);
      } else {
        // Handle errors
        console.error('Error fetching movie ID:', data.error);
      }
    });

    // Wait for all the fetches to complete
    await Promise.all(fetchPromises);

    res.status(200).json({ message: 'All movie IDs fetched successfully' });
  } catch (error) {
    console.error('Error fetching all movie IDs:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}) */

/* app.post("/fetchmoviedetailsTMDB", async (req, res) => {
  try {
    const { id } = req.body;

    const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${movieAPI_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
   
    await postMovieToDatabase(data); // TODO: sometimes these two functions occur after all other code is complete, so the page does not have time to populate mixDetails?
    await postAddToMixOnBackend(data.id, data.title);


  } catch (error) {
    console.error("Error fetching movie details:", error);
  } finally {
    //setFetchedAndSavedDetailsFromAPI(true);

  }

})
 */

//streaming tjänster
app.post("/fetchmovieprovidersTMDB", async (req, res) => {
  try {
    const { id } = req.body;

    const movieProvidersObject = await fetchMovieProvidersObjectTMDB(id);

    res.json({ movieProvidersObject, movieId: id });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});
//streaming tjänster

// fetch and return providers (in sweden) of movieId, also posts this data to our "database"-array fetchedProvidersOfMovie
async function fetchMovieProvidersObjectTMDB(id) {
  try {
    const url = `https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${movieAPI_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    // ändra så att vi skickar alla data till addProvidersOfMovieToDatabase funktionen

    await addProvidersOfMovieToDatabase(data); // lägger endast till om Sverige finns med

    if (data.results.SE) {
      return data.results.SE;
    } else if (!data.results.SE) {
      console.log("No providers in sweden for movie id ", id);

      return { noProviders: "no providers in sweden", id };
    } else {
      console.log("failed to fetch providers of movie from TMDB");
    }

    //await postMovieToDatabase(data);
    // await postAddToMixOnBackend(data.id, data.title);
  } catch (error) {
    console.error("Error fetching movie providers:", error);
  } finally {
    //setLoading(false);
    //setFetchedAndSavedDetailsFromAPI(!fetchedAndSavedDetailsFromAPI);
  }
}

// also saves whole Movie object to fetchedmovies
async function fetchMovieObjectTMDB(id) {
  // console.log("Fetching movie details for ID:", id);

  // TODO: check fetchedMovies first, else run the code below?

  try {
    const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${movieAPI_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    /* console.log(data);
    console.log(data.vote_average); */

    //await postMovieToDatabase(data);
    // await postAddToMixOnBackend(data.id, data.title);
    if (data.title) {
      await addMovieToDatabase(data, "movie"); // STORES FETCHED MOVIE OBJECT TO DATABASE
    } else {
      console.log("failed to fetch movie object from TMDB");
    }

    return data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
  }
}

async function addMovieToDatabase(movie, movieOrSeries) {
  try {
    if (!movie.id || !movieOrSeries) {
      console.log(
        "Received movie does not contain an id, and/or need to define if movie or series."
      );
      return;
    }

    // Check if the movie or series already exists in the fetched_movies or fetched_series tables
    let idExistsInMovies;
    let idExistsInSeries;

    if (movieOrSeries === "movie") {
      idExistsInMovies = await query(
        "SELECT id FROM fetched_movies WHERE JSON_EXTRACT(data, '$.id') = ?",
        [movie.id]
      );
    } else if (movieOrSeries === "series") {
      idExistsInSeries = await query(
        "SELECT id FROM fetched_series WHERE JSON_EXTRACT(data, '$.id') = ?",
        [movie.id]
      );
    }

    if (
      (idExistsInMovies && idExistsInMovies.length > 0) ||
      (idExistsInSeries && idExistsInSeries.length > 0)
    ) {
      console.log("movie/series ID ", movie.id, " has already been fetched.");
      return;
    }

    // Insert the movie or series into the appropriate table
    if (movieOrSeries === "movie") {
      await query("INSERT INTO fetched_movies (data) VALUES (?)", [
        JSON.stringify(movie),
      ]);
      console.log("Added movie ID ", movie.id, " to fetched_movies");
    } else if (movieOrSeries === "series") {
      await query("INSERT INTO fetched_series (data) VALUES (?)", [
        JSON.stringify(movie),
      ]);
      console.log("Added series ID ", movie.id, " to fetched_series");
    } else {
      console.log("Could not determine if movie or series");
    }

    /*   res.status(201).json({
      message: "Movie/Series saved to fetched_movies/fetched_series",
    });
 */
    console.log("Movie/Series saved to fetched_movies/fetched_series");
  } catch (error) {
    console.error(
      "1:Error adding movie/series to fetched_movies/fetched_series:",
      error
    );
  }
}

// One movie is an array of two objects, one object movie's providers and the other object is just the id of the movie
const fetchedProvidersOfMovie = [];

app.get("/fetchedProvidersOfMovie", (req, res) => {
  const data = {
    fetchedProvidersOfMovie: fetchedProvidersOfMovie,
  };

  res.json(data);
});

app.post("/addmovieproviderstodatabase", async (req, res) => {
  try {
    const { movieProvidersObject } = req.body;

    if (!movieProvidersObject) {
      return res
        .status(400)
        .json({ error: "No object of providers or movie ID provided" });
    }

    await addProvidersOfMovieToDatabase(movieProvidersObject);
  } catch (error) {
    console.error(
      "1:Error attempting to use endpoint /addmovieproviderstodatabase: ",
      error
    );
    res.status(500).json({
      error:
        "Internal server error, Error attempting to use endpoint /addmovieproviderstodatabase",
    });
  }
});

// WHEN USING THIS FUNCTION, set movieProvidersObject = 0 if SE has no provider...
// e.g. addProvidersOfMovieToDatabase(0, id)
/* function addProvidersOfMovieToDatabase(movieProvidersObject) {
  if (!movieProvidersObject) {
    console.log(
      "movie providers object or id not provided when attempting to add to our database."
    );
    return; //exit code // TODO: ändra att den returnerar något annat? typ error?
  }

  const idExistsAlready = fetchedProvidersOfMovie.some(
    (fetchedMovie) => fetchedMovie.id === movieProvidersObject.id
  );
  //  const idExistsInSeries = fetchedSeries.some(
  //  (fetchedSerie) => fetchedSerie.id === movieObject.id
  //); 

  if (idExistsAlready) {
    console.log(
      "Providers of movie ID ",
      movieProvidersObject.id,
      " has already been fetched."
    );
    return; // TODO: return nothing?
  } else {
    // fortsätt kod...
  }
  
  if (!movieProvidersObject.results?.SE) {
    // TODO: check
    fetchedProvidersOfMovie.push({
      noProviders: "no providers in sweden",
      id: movieProvidersObject.id,
    });
  } else {
    // added movie id to the object so it is easier to find later...
    const movieProvidersObjectWithID = {
      ...movieProvidersObject.results.SE,
      id: movieProvidersObject.id,
    };

    // One movie is an array of two objects, one object movie's providers and the other object is just the id of the movie
    fetchedProvidersOfMovie.push(movieProvidersObjectWithID); // UPDATE LATER TO SQL
    console.log(
      "Added providers of movie ID ",
      movieProvidersObject.id,
      " into array fetchedProvidersOfMovie"
    );
  }
} */

async function addProvidersOfMovieToDatabase(movieProvidersObject) {
  if (!movieProvidersObject) {
    console.log(
      "Movie providers object or id not provided when attempting to add to our database."
    );
    return { error: "Movie providers object or id not provided." };
  }
  try {
    const movieId = movieProvidersObject.id;
    // Check if providers for this movie ID already exist in the database
    const result = await query(
      "SELECT id FROM fetched_movie_providers WHERE JSON_EXTRACT(data, '$.id') = ?",
      [movieId]
    );
    if (result.length > 0) {
      console.log(
        "Providers of movie ID",
        movieId,
        "have already been fetched."
      );
      return { message: "Providers already exist." };
    }
    let movieProvidersData;
    if (!movieProvidersObject.results?.SE) {
      // No providers in Sweden
      movieProvidersData = JSON.stringify({
        noProviders: "no providers in Sweden",
        id: movieId,
      });
    } else {
      // Providers in Sweden
      movieProvidersData = JSON.stringify({
        ...movieProvidersObject.results.SE,
        id: movieId,
      });
    }
    // Update the providers column for the specific movie ID
    await query(
      "INSERT INTO fetched_movie_providers (movie_id, data) VALUES (?, ?)",
      [movieId, movieProvidersData]
    );
    console.log(
      "Added providers of movie ID",
      movieId,
      "into fetched_movie_providers table"
    );
    return { message: "Providers added to the database." };
  } catch (error) {
    console.error("Error adding providers to database:", error);
    return { error: "Internal server error" };
  }
}

const fetchPopularMovies = async () => {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${movieAPI_KEY}&language=en-US&page=1`
  );
  const data = await response.json();

  //postMovieToDatabase(data)

  return data.results;
};

async function checkIfLiked(movieId, userId) {
  //  let isLiked = false;

  try {
    // Check if the movie is in the user's like list
    const checkResults = await query(
      "SELECT * FROM liked_movies WHERE user_id = ? AND movie_id = ?",
      [userId, movieId]
    );

    if (checkResults.length === 0) {
      //console.log("Movie id ", movieId, ", is not liked by user id ", userId);
      return false;
    } else if (checkResults.length > 0) {
      // maybe should have more precise check?
      return true;
    }
  } catch (error) {
    console.error(
      "checkIfLiked: Error trying to find if a movie is liked by user in checkIfLiked function ",
      error
    );
    return res
      .status(500)
      .send(
        "checkIfLiked: Error trying to find if a movie is liked by user in checkIfLiked function"
      );
  }

  // before likedMoviesList is in mySQL:
  /*  const userLikedMoviesList = likedMoviesList.find((list) => { // go through the lists (one likelist per user)
      return list.userId === currentUserId;
    }); 

    if (!userLikedMoviesList) {
      console.log("Empty like list or CheckIfLiked function failed finding likedMoviesList of user id: ", currentUserId);


      //return res.status(500).send("CheckIfLiked function failed finding user's likedMoviesList");
      return isLiked;
    } else {
      //continue code...
    }

  if (userLikedMoviesList && userLikedMoviesList.myLikedMoviesList.length > 0) {
    isLiked = userLikedMoviesList.myLikedMoviesList.some((likedMovie) => {
      return likedMovie.id === movieId;
    });
  }
  console.log("movieId: ", movieId, " isLiked: ", isLiked);

  return isLiked; */
}

async function checkIfWatchListed(movieId, userId) {
  //let isInWatchList = false;

  try {
    // Check if the movie is in the user's like list
    const checkResults = await query(
      "SELECT * FROM watchlist WHERE user_id = ? AND movie_id = ?",
      [userId, movieId]
    );

    if (checkResults.length === 0) {
      //console.log("Movie id ", movieId, ", is not liked by user id ", userId);
      return false;
    } else if (checkResults.length > 0) {
      // maybe should have more precise check?
      return true;
    }
  } catch (error) {
    console.error(
      "checkIfWatchListed: Error trying to find if a movie is in watchlist in checkIfWatchListed function ",
      error
    );
    return res
      .status(500)
      .send(
        "checkIfWatchListed: Error trying to find if a movie is in watchlist in checkIfWatchListed function"
      );
  }
  /* 

  const userMoviesWatchList = movieWatchList.find((list) => {
    return list.userId === currentUserId;
  });

  if (!userMoviesWatchList) {
    console.log("Empty watchlist or checkIfWatchListed function failed finding userMoviesWatchList of user id: ", currentUserId);
    //return res.status(500).send("checkIfWatchListed function failed finding user's movieWatchList");

    return isInWatchList;
  } else {
    //continue code...
    console.log("userMoviesWatchList: ", userMoviesWatchList);
  }



  if (userMoviesWatchList && userMoviesWatchList.myMovieWatchList.length > 0) {
    isInWatchList = userMoviesWatchList.myMovieWatchList.some(
      (watchListedMovie) => {
        return watchListedMovie.id === movieId;
      }
    );
  }

  console.log("movieId: ", movieId, " isInWatchList: ", isInWatchList);

  return isInWatchList; */
}

app.post("/popularmovies", async (req, res) => {
  try {
    const { token } = req.body;

    console.log("token: ", token);

    let sessionSearchResult;

    let loggedIn;
    try {
      // use the token to find the current session (user_id that is logged in)
      sessionSearchResult = await query(
        "SELECT * FROM sessions WHERE token = ?",
        [token]
      );
      console.log("sessionSearchResult: ", sessionSearchResult);
    } catch (error) {
      loggedIn = false;
      console.log("Not logged in or Error finding session", error);
    }

    let currentSession;
    let currentUserId;
    if (sessionSearchResult.length === 0) {
      loggedIn = false;
    } else {
      currentSession = sessionSearchResult[0];
      currentUserId = currentSession.user_id;
      loggedIn = true;
      // loggedIn = false;
    }
    //return res.status(500).send("2:Error finding session");

    const popularMovies = await fetchPopularMovies();

    // const popularMoviesProviders = []

    const popularMoviesAndProviders = [];

    if (popularMovies.length > 0) {
      for (const movie of popularMovies) {
        if (!movie.id) {
          return res
            .status(400)
            .json({ error: "No movie id found in popular movie?" });
        }

        await addMovieToDatabase(movie, "movie"); // doesnt add if already added

        // first check if movieproviders exists in our database
        let movieProvidersObject = await getProvidersOfMOvieObjectOurDatabase(
          movie.id
        );

        // if it doesnt exist we fetch providers from tmdb
        if (movieProvidersObject == null) {
          console.log(
            "movie providers not in our database, fetching from TMDB"
          );

          // fetches movie's providers and adds to our database
          movieProvidersObject = await fetchMovieProvidersObjectTMDB(movie.id);
        } else {
          console.log(
            "Providers of movie id ",
            movieProvidersObject.id,
            " exists in our database, skipping fetch from TMDB."
          );
        }

        //console.log("streaming providers of movie id ", movie.id, ": ", movieProvidersObject);
        let isLiked;
        let isInWatchList;
        if (loggedIn) {
          isLiked = await checkIfLiked(movie.id, currentUserId);
          isInWatchList = await checkIfWatchListed(movie.id, currentUserId); // TODO: check currentUserId !!!
        } else {
          console.log("Not online so will NOT check like and watchlist ");
          isLiked = false;
          isInWatchList = false;
        }

        if (movieProvidersObject) {
          popularMoviesAndProviders.push({
            movie,
            movieProvidersObject,
            isLiked,
            isInWatchList,
          });
        } else {
          console.log(
            "failed to read movieProvidersObject in /popularmovies endpoint, did not push values into array popularMoviesAndProviders"
          );
        }
      }
    } else {
      console.log("failed to map through popular movies, length === 0 ?");
    }

    if (popularMoviesAndProviders.length > 0) {
      // console.log(popularMoviesAndProviders);
      res.json(popularMoviesAndProviders);
    } else {
      console.log("popularMoviesAndProviders failed to populate");
    }
  } catch (error) {
    console.log("failed to run /popularmovies endpoint");
  }
});


const fetchedMovies = []; //! TA BORT NÄR VI HAR FIXAT MYSQL
const fetchedSeries = []; //! TA BORT NÄR VI HAR FIXAT MYSQL

// BARA FÖR ATT SE VAD SOM HAR SPARATS, VI SKA INTE ANVÄNDA DENNA
app.get("/allfetchedmoviesorseries", async (req, res) => {
  res.status(200).json({
    message: "GET data for /allfetchedmoviesorseries: ",
    fetchedMovies: fetchedMovies,
    fetchedSeries: fetchedSeries,
  });
});
/* 
function getMovieObjectOurDatabase(id, movieOrSeries) {
  let searchResult;
  try {
    if (movieOrSeries === "movie") {
      searchResult = fetchedMovies.find((movie) => {
        return id === movie.id;
      });
      //console.log("Movie-Search result: ", searchResult);
    } else if (movieOrSeries === "series") {
      searchResult = fetchedSeries.find((series) => {
        return id === series.id;
      });
      console.log("Series-Search result: ", searchResult);
    } else {
      console.log("Find function in fetchedMovies or fetchedSeries failed?");
    }
  } catch (error) {
    console.error("2:Error finding movie/series", error);
    return res.status(500).send("2:Error finding movie/series"); // exit code
  }

  return searchResult;
} */

async function getMovieObjectOurDatabase(id, movieOrSeries) {
  let searchResult;
  try {
    if (movieOrSeries === "movie") {
      searchResult = await query(
        "SELECT data FROM fetched_movies WHERE JSON_EXTRACT(data, '$.id') = ?",
        [id]
      );
    } else if (movieOrSeries === "series") {
      searchResult = await query(
        "SELECT data FROM fetched_series WHERE JSON_EXTRACT(data, '$.id') = ?",
        [id]
      );
    } else {
      console.log("movieOrSeries is not 'movie' or 'series'?");
    }
  } catch (error) {
    console.error("2:Error finding movie/series", error);
    return; // exit code
  }

  if (searchResult.length > 0) {
    //const movieObject = JSON.parse(searchResult[0].data);
    let movieObject = searchResult[0].data;

    // If data is a string, parse it into a JavaScript object
    if (typeof movieObject === "string") {
      movieObject = JSON.parse(movieObject);
    }
    //console.log(movieObject);

    return movieObject;
  } else {
    console.log("Movie not found");
  }

  // return searchResult;
}

/* 
app.post("/movieobject", async (req, res) => {
  try {
    console.log("/movieobject req.body: ", req.body);
    const { movieID, movieOrSeries } = req.body;

    if (!movieID || !movieOrSeries) {
      return res.status(400).json({
        error:
          "movieID not received, and/or need to define if movie or series.",
      }); // exit code
    }

    //console.log("Current fetchedMovies: ", fetchedMovies);
    let searchResult;
    try {
      if (movieOrSeries === "movie") {
        searchResult = fetchedMovies.find((movie) => {
          return movieID === movie.id;
        });
        //console.log("Movie-Search result: ", searchResult);
      } else if (movieOrSeries === "series") {
        searchResult = fetchedSeries.find((series) => {
          return movieID === series.id;
        });
        console.log("Series-Search result: ", searchResult);
      } else {
        console.log("Find function in fetchedMovies or fetchedSeries failed?");
      }
    } catch (error) {
      console.error("2:Error finding movie/series", error);
      return res.status(500).send("2:Error finding movie/series"); // exit code
    }

    res
      .status(200)
      .json({ message: "GET data for movie/series: ", searchResult });
  } catch (error) {
    console.error("1:Error attempting to GET movie/series object", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
 */

// get movie object from our database
app.post("/movieobject", async (req, res) => {
  try {
    console.log("/movieobject req.body: ", req.body);
    const { movieId, movieOrSeries } = req.body;

    if (!movieId || !movieOrSeries) {
      return res.status(400).json({
        error:
          "movieID not received, and/or need to define if movie or series.",
      }); // exit code
    }

    //console.log("Current fetchedMovies: ", fetchedMovies);
    let searchResult;
    try {
      if (movieOrSeries === "movie") {
        searchResult = await query(
          "SELECT data FROM fetched_movies WHERE JSON_EXTRACT(data, '$.id') = ?",
          [movieId]
        );
      } else if (movieOrSeries === "series") {
        searchResult = await query(
          "SELECT data FROM fetched_series WHERE JSON_EXTRACT(data, '$.id') = ?",
          [movieId]
        );
      } else {
        console.log("movieOrSeries is not 'movie' or 'series'?");
      }
    } catch (error) {
      console.error("2:Error finding movie/series in /movieobject", error);
      return res
        .status(500)
        .send("2:Error finding movie/series in /movieobject"); // exit code
    }

    if (searchResult.length > 0) {
      //const movieObject = JSON.parse(searchResult[0].data);
      let movieObject = searchResult[0].data;

      // If data is a string, parse it into a JavaScript object
      if (typeof movieObject === "string") {
        movieObject = JSON.parse(movieObject);
      }
      // console.log(movieObject);

      return res
        .status(200)
        .json({ message: "GET data for movie/series: ", movieObject });
    } else {
      console.log("Movie not found");
    }
  } catch (error) {
    console.error("1:Error attempting to GET movie/series object", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function getProvidersOfMOvieObjectOurDatabase(movieId) {
  let searchResult;
  try {
    searchResult = await query(
      "SELECT data FROM fetched_movie_providers WHERE movie_id = ?",
      [movieId]
    ); // JSON EXTRACT isnt need here because id is outside of the providers-object in a seperate column

    //console.log("Movie-Search result: ", searchResult);

    //console.log("Series-Search result: ", searchResult);
  } catch (error) {
    console.error("Error finding providers of movie from our database", error);
    return null;
  }

  if (searchResult.length > 0) {
    //const movieObject = JSON.parse(searchResult[0].data);
    let providersObject = searchResult[0].data;

    // If data is a string, parse it into a JavaScript object
    if (typeof providersObject === "string") {
      providersObject = JSON.parse(providersObject);
    }
    //console.log(movieObject);

    return providersObject;
  } else {
    console.log("Movie providers not found in our database");
    return null;
  }
}

//////////////////////ADD MOVIE TO DATABASE //////////////////////////////////

app.post("/addmovietodatabase", async (req, res) => {
  const { movie, movieOrSeries } = req.body;

  try {
    if (!movie.id || !movieOrSeries) {
      return res.status(400).json({
        error:
          "Received movie does not contain an id, and/or need to define if movie or series.",
      });
    }

    // Check if the movie or series already exists in the fetched_movies or fetched_series tables
    let idExistsInMovies;
    let idExistsInSeries;

    if (movieOrSeries === "movie") {
      idExistsInMovies = await query(
        "SELECT id FROM fetched_movies WHERE JSON_EXTRACT(data, '$.id') = ?",
        [movie.id]
      );
    } else if (movieOrSeries === "series") {
      idExistsInSeries = await query(
        "SELECT id FROM fetched_series WHERE JSON_EXTRACT(data, '$.id') = ?",
        [movie.id]
      );
    }

    if (
      (idExistsInMovies && idExistsInMovies.length > 0) ||
      (idExistsInSeries && idExistsInSeries.length > 0)
    ) {
      console.log("movie/series ID ", movie.id, " has already been fetched.");
      return res.status(200).json({
        // exit code
        message: "Liked movie OR Liked series has already been fetched.",
      });
    }

    // Insert the movie or series into the appropriate table
    if (movieOrSeries === "movie") {
      await query("INSERT INTO fetched_movies (data) VALUES (?)", [
        JSON.stringify(movie),
      ]);
      console.log("Added movie ID ", movie.id, " to fetched_movies");
    } else if (movieOrSeries === "series") {
      await query("INSERT INTO fetched_series (data) VALUES (?)", [
        JSON.stringify(movie),
      ]);
      console.log("Added series ID ", movie.id, " to fetched_series");
    } else {
      console.log("Could not determine if movie or series");
      return res.status(400).json({
        error: "Could not determine if movie or series",
      });
    }

    res.status(201).json({
      message: "Movie/Series saved to fetched_movies/fetched_series",
    });
  } catch (error) {
    console.error(
      "1:Error adding movie/series to fetched_movies/fetched_series:",
      error
    );
    res.status(500).json({ error: "Internal server error" });
  }
});

////////////////////////////////////////////////////////

// post the lists
app.post("/me/likelists", async (req, res) => {
  //const
  // const { token } = req.body; // token from current session

  /* if (!data.token ) {
    return res.status(400).json({ error: 'Token not found.' });
  }
 */

  /* const currentSession = sessions.find(session => {
    return token === session.token;
  }) */

  // TODO: hitta likedMoviesList och likedSeriesList som är kopplade till inloggade Användaren!
  /* let userAccount; // multiple?
  let currentUser;
  if (currentSession) { // something has been found, not undefined
    userAccount = accounts.find(account => {
      return account.userId === currentSession.userId;
    })
    currentUser = users.find(user => {
      return user.userId === currentSession.userId;
    })
  } else {
    console.log("user account not found");
  }
 */

  res.status(200).json({
    message: "Post data for /me/likelists received: ",
    likedMoviesList: likedMoviesList,
    likedSeriesList: likedSeriesList,
  });
});

app.post("/me/watchlists", async (req, res) => {
  res.status(200).json({
    message: "Post data for /me/watchlist received: ",
    movieWatchList: movieWatchList,
    seriesWatchList: seriesWatchList,
  });
});

// FOR US, if we want to see data here: http://16.171.5.238:3010/me/likelists
app.get("/me/likelists", (req, res) => {
  const data = {
    likedMoviesList: likedMoviesList,
    likedSeriesList: likedSeriesList,
  };

  res.json(data);
});

// FOR US, if we want to see data here: http://16.171.5.238:3010/me/watchlists
app.get("/me/watchlists", (req, res) => {
  const data = {
    movieWatchList: movieWatchList,
    seriesWatchList: seriesWatchList,
  };

  res.json(data);
});

// usually use both watchlist and likelist in movie cards...
app.get("/watchandlikelists", (req, res) => {
  const data = {
    movieWatchList: movieWatchList,
    likedMoviesList: likedMoviesList,
  };

  res.json(data);
});

async function getWatchAndLikeList(token) {
  try {
    if (!token) {
      return res.status(400).json({
        error: "Failed receiving token to getWatchAndLikeList()",
      });
    }

    let sessionSearchResult;
    try {
      sessionSearchResult = await query(
        "SELECT * FROM sessions WHERE token = ?",
        [token]
      );
    } catch (error) {
      console.error("2:Error finding session", error);
      return res.status(500).send("2:Error finding session");
    }

    if (sessionSearchResult.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    const currentSession = sessionSearchResult[0];
    const userId = currentSession.user_id;

    let userLikedMoviesList = [];
    let userMoviesWatchList = [];

    try {
      const userLikedMoviesResult = await query(
        "SELECT * FROM liked_movies WHERE user_id = ?",
        [userId]
      );
      if (userLikedMoviesResult.length > 0) {
        userLikedMoviesList = userLikedMoviesResult;
      }
    } catch (error) {
      console.error("Error fetching liked movies", error);
    }

    try {
      const userWatchListResult = await query(
        "SELECT * FROM watchlist WHERE user_id = ?",
        [userId]
      );
      if (userWatchListResult.length > 0) {
        userMoviesWatchList = userWatchListResult;
      }
    } catch (error) {
      console.error("Error fetching watchlist", error);
    }

    const data = {
      likedMoviesList: userLikedMoviesList,
      movieWatchList: userMoviesWatchList,
    };

    if (userMoviesWatchList.length > 0 || userLikedMoviesList.length > 0) {
      return data;
    } else {
      console.log("userMoviesWatchList and/or userLikedMoviesList not defined");
    }
  } catch (error) {
    console.log("Internal server error in getWatchAndLikeList()");
  }
}

// user-specific watchandlikelists
app.post("/me/watchandlikelists", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: "Failed receiving token to /me/watchandlikelists.",
      });
    }

    let sessionSearchResult;
    try {
      // use the token to find the current session (user_id that is logged in)
      sessionSearchResult = await query(
        "SELECT * FROM sessions WHERE token = ?",
        [token]
      );
    } catch (error) {
      console.error("2:Error finding session", error);
      return res.status(500).send("2:Error finding session");
    }
    if (sessionSearchResult.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    const currentSession = sessionSearchResult[0];
    const userId = currentSession.user_id;

    // before likedMoviesList is in mySQL:
    /*  const userLikedMoviesList = likedMoviesList.find((list) => {
      return list.userId === currentSession.user_id;
    });

    if (userLikedMoviesList == null) {
      console.log("1:Couldn't find likelist of user id: ", currentSession.user_id);
      return res.status(500).send("Error finding user's likedMoviesList");
    } else {
      //continue code...
    } */

    let userLikedMoviesList;
    let hasMoviesInLikeList = false;
    try {
      const userLikedMoviesResult = await query(
        "SELECT * FROM liked_movies WHERE user_id = ?",
        [userId]
      );

      if (userLikedMoviesResult.length === 0) {
        //console.log("Movie id ", movieId, ", is not liked by user id ", userId);
        console.log("1:User has no liked movies or Failed to find: ", userId);
      } else if (userLikedMoviesResult.length > 0) {
        //
        //return true;
        hasMoviesInLikeList = true;
        //console.log("userLikedMoviesResult: ", userLikedMoviesResult);
        userLikedMoviesList = userLikedMoviesResult;
      }

      //const likedMoviesList = userLikedMoviesResult[0]
    } catch (error) {
      console.error(
        "Error trying to find if a movie is liked by user in checkIfLiked function ",
        error
      );
      return res
        .status(500)
        .send(
          "Error trying to find if a movie is liked by user in checkIfLiked function"
        );
    }

    let hasMoviesInWatchlist = false;
    let userMoviesWatchList;
    try {
      // Check if the movie is in the user's like list
      const userWatchListResult = await query(
        "SELECT * FROM watchlist WHERE user_id = ?",
        [userId]
      );

      if (userWatchListResult.length === 0) {
        //console.log("Movie id ", movieId, ", is not liked by user id ", userId);
        console.log("1:User has no liked movies or Failed to find: ", userId);
        //   return res.status(500).send("User has no liked movies or Failed to find");
      } else if (userWatchListResult.length > 0) {
        //
        //return true;
        hasMoviesInWatchlist = true;
        // console.log("userMoviesWatchList: ", userWatchListResult);
        userMoviesWatchList = userWatchListResult;
      }

      //const likedMoviesList = userLikedMoviesResult[0]
    } catch (error) {
      console.error(
        "Error trying to find if a movie is liked by user in checkIfLiked function ",
        error
      );
      return res
        .status(500)
        .send(
          "Error trying to find if a movie is liked by user in checkIfLiked function"
        );
    }

    /* const userMoviesWatchList = movieWatchList.find((list) => {
      return list.userId === currentSession.user_id;
    });

    if (!userMoviesWatchList) {
      console.log(
        "Couldn't find movieWatchList of user id: ",
        currentSession.user_id
      );
      return res.status(500).send("Error finding user's moviesWatchList");
    } else {
      //continue code...
    } */
    if (!hasMoviesInLikeList) {
      userLikedMoviesList = [];
    }
    if (!hasMoviesInWatchlist) {
      userMoviesWatchList = [];
    }

    const data = {
      //likedMoviesList: userLikedMoviesList.myLikedMoviesList,
      likedMoviesList: userLikedMoviesList,
      // movieWatchList: userMoviesWatchList.myMovieWatchList,
      movieWatchList: userMoviesWatchList,
    };

    if (userMoviesWatchList && userLikedMoviesList) {
      //if (userMoviesWatchList && userLikedMoviesList) {
      res.json(data);
    } else {
      console.log(
        "userMoviesWatchList and/or userLikedMoviesList not defined, can't send to frontend"
      );
    }
  } catch (error) {
    res.status(500).json({
      error: "Internal server error when trying to run /me/watchandlikelists",
    });
  }

  /* const data = {
    movieWatchList: movieWatchList,
    likedMoviesList: likedMoviesList,
  };

  res.json(data); */
});

app.post("/me/likelists/addtolikelist", async (req, res) => {
  try {
    const { movieId, movieOrSeries, title, token } = req.body;

    if (!movieId || !movieOrSeries || !title || !token) {
      return res.status(400).json({
        error:
          "token and id (of movie) is required, and need to define if movie or series, and need movie title",
      });
    }

    let sessionSearchResult;
    try {
      // use the token to find the current session (user_id that is logged in)
      sessionSearchResult = await query(
        "SELECT * FROM sessions WHERE token = ?",
        [token]
      );
    } catch (error) {
      console.error("2:Error finding session", error);
      return res.status(500).send("2:Error finding session");
    }
    if (sessionSearchResult.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }
    const currentSession = sessionSearchResult[0];

    const userId = currentSession.user_id;

    // before likedMoviesList is in mySQL, when every user had its own 'likeList':
    /*  const userLikedMoviesList = likedMoviesList.find((list) => {
      return list.userId === currentSession.user_id;
    });

    if (!userLikedMoviesList) {
      console.log(
        "Couldn't find likelist of user id: ",
        currentSession.user_id
      );
      return res.status(500).send("Error finding user's likedMoviesList");
    } else {
      //continue code...
    } 

     console.log("userLikedMoviesList: ", userLikedMoviesList);
    
    */

    try {
      // Check if the movie is already liked by the user
      const checkResults = await query(
        "SELECT * FROM liked_movies WHERE user_id = ? AND movie_id = ?",
        [userId, movieId]
      ); // movieid

      //console.log();

      // if already exist we exit the code
      if (checkResults.length > 0) {
        console.log("movie/series ID ", movieId, " is already liked.");
        return res
          .status(409)
          .json({ message: `Movie ${movieId} is already liked.` });
      }

      // If no we Insert the movieId and userId into liked_movies table

      const insertQuery = await query(
        "INSERT INTO liked_movies (user_id, movie_id, movie_title) VALUES (?, ?, ?)",
        [userId, movieId, title]
      );

      console.log(
        "Added movie ID ",
        movieId,
        "with name:",
        title,
        "to likedMoviesList"
      );
      return res.status(201).send(`Movie ${movieId} liked successfully`);
    } catch (error) {
      console.error("Error liking movie", error);
      res.status(500).send("Error liking movie");
    }

    /* const idExistsInMovies = userLikedMoviesList.myLikedMoviesList.some(
      (likedMovie) => likedMovie.id === id
    ); 
    
    if (idExistsInMovies) {
      console.log("movie/series ID ", id, " is already liked.");
      return res
        .status(200)
        .json({ message: "Liked movie OR Liked series is already liked." });
    }
    */

    /* if (movieOrSeries === "movie") {
     
      userLikedMoviesList.myLikedMoviesList.push({ id, title }); // UPDATE LATER TO SQL
      console.log(
        "Added movie ID ",
        id,
        "with name:",
        title,
        "to likedMoviesList"
      );
    }
 */
    /* if (movieOrSeries === "series") {
      likedSeriesList.push({ id, title }); // UPDATE LATER TO SQL
      console.log("Added series ID ", id, " to likedSeriesList");
    } */

    /* res.status(201).json({
      message: "Movie/Series saved to like list succesfully",
    }); */
  } catch (error) {
    console.error("1:Error adding like:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// TODO: fix so it removes from the user's likelist
app.post("/me/likelists/removefromlikelist", async (req, res) => {
  //console.log("halla");

  try {
    const { movieId, movieOrSeries, title, token } = req.body;

    if (!movieId || !token) {
      return res.status(400).json({
        error: "token and id (of movie) are required",
      });
    }
    //console.log("hej");

    let sessionSearchResult;
    try {
      // Use the token to find the current session (user_id that is logged in)
      sessionSearchResult = await query(
        "SELECT * FROM sessions WHERE token = ?",
        [token]
      );
    } catch (error) {
      console.error("2:Error finding session", error);
      return res.status(500).send("2:Error finding session");
    }

    if (sessionSearchResult.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    const currentSession = sessionSearchResult[0];
    const userId = currentSession.user_id;

    try {
      // Check if the movie is in the user's like list
      const checkResults = await query(
        "SELECT * FROM liked_movies WHERE user_id = ? AND movie_id = ?",
        [userId, movieId]
      );

      // If it does not exist, we exit the code
      if (checkResults.length === 0) {
        console.log(
          "Can't delete movie ID ",
          movieId,
          ", it is not in the like list?."
        );
        return res.status(404).json({
          message: `Can't delete movie ID ${movieId}, it is not in the like list?.`,
        });
      }

      // If yes, delete the movieId and userId from liked_movies table
      await query(
        "DELETE FROM liked_movies WHERE user_id = ? AND movie_id = ?",
        [userId, movieId]
      );

      console.log(
        "Removed movie ID ",
        movieId,
        "from user ID ",
        userId,
        " like list"
      );

      return res.status(200).send(`Movie ${movieId} removed successfully`);
    } catch (error) {
      console.error("Error removing movie", error);
      return res.status(500).send("Error removing movie");
    }
  } catch (error) {
    console.error("1:Error removing like:", error);
    return res.status(500).json({ error: "Internal server error" });
  }

  /* try {
    const { id, movieOrSeries, token } = req.body;

    if (!id || !movieOrSeries || !token) {
      return res
        .status(400)
        .json({ error: "Token and/or Liked movie/series is required." });
    }

    // const idExistsInMovies = likedMoviesList.some(
    //   (likedMovie) => likedMovie.id === id
    // );
    // const idExistsInSeries = likedSeriesList.some(
    //   (likedSeries) => likedSeries.id === id
    // );

    // if (idExistsInMovies || idExistsInSeries) {
    //   console.log("movie/series ID ", id, " is already liked.");
    //   return res
    //     .status(200)
    //     .json({ message: "Liked movie OR Liked series is already liked." });
    // }

    if (movieOrSeries === "movie") {
      likedMoviesList = likedMoviesList.filter((movie) => movie.id !== id);
      console.log("Removed movie ID ", id, " from likedMoviesList");
    }

    if (movieOrSeries === "series") {
      likedSeriesList = likedSeriesList.filter((serie) => serie.id !== id);
      console.log("Removed series ID ", id, " from likedSeriesList");
    }

    res.status(201).json({
      message: "Movie/Series removed from like list succesfully",
    });
  } catch (error) {
    console.error("1:Error removing like:", error);
    res.status(500).json({ error: "Internal server error" });
  }
 */
});

// TODO: fix so it removes from the user's watchlist
app.post("/me/watchlists/removefromwatchlist", async (req, res) => {
  try {
    const { movieId, movieOrSeries, title, token } = req.body;

    if (!movieId || !token) {
      return res.status(400).json({
        error:
          "token and id (of movie) are required in /me/watchlists/removefromwatchlist",
      });
    }
    //console.log("hej");

    let sessionSearchResult;
    try {
      // Use the token to find the current session (user_id that is logged in)
      sessionSearchResult = await query(
        "SELECT * FROM sessions WHERE token = ?",
        [token]
      );
    } catch (error) {
      console.error("2:Error finding session", error);
      return res.status(500).send("2:Error finding session");
    }

    if (sessionSearchResult.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    const currentSession = sessionSearchResult[0];
    const userId = currentSession.user_id;

    try {
      // Check if the movie is in the user's like list
      const checkResults = await query(
        "SELECT * FROM watchlist WHERE user_id = ? AND movie_id = ?",
        [userId, movieId]
      );

      // If it does not exist, we exit the code
      if (checkResults.length === 0) {
        console.log(
          "Can't delete movie ID ",
          movieId,
          ", it is not in the watch list?."
        );
        return res.status(404).json({
          message: `Can't delete movie ID ${movieId}, it is not in the watchlist?.`,
        });
      }

      // If yes, delete the movieId and userId from liked_movies table
      await query("DELETE FROM watchlist WHERE user_id = ? AND movie_id = ?", [
        userId,
        movieId,
      ]);

      console.log(
        "Removed movie ID ",
        movieId,
        "from user ID ",
        userId,
        " watchlist"
      );

      return res.status(200).send(`Movie ${movieId} removed successfully`);
    } catch (error) {
      console.error("Error removing movie", error);
      return res.status(500).send("Error removing movie");
    }

    /*  const { id, movieOrSeries } = req.body;

    if (!id || !movieOrSeries) {
      return res
        .status(400)
        .json({ error: "Watched movie OR watched series is required." });
    }

    

    // const idExistsInMovies = likedMoviesList.some(
    //   (likedMovie) => likedMovie.id === id
    // );
    // const idExistsInSeries = likedSeriesList.some(
    //   (likedSeries) => likedSeries.id === id
    // );

    // if (idExistsInMovies || idExistsInSeries) {
    //   console.log("movie/series ID ", id, " is already liked.");
    //   return res
    //     .status(200)
    //     .json({ message: "Liked movie OR Liked series is already liked." });
    // }

    if (movieOrSeries === "movie") {
      movieWatchList = movieWatchList.filter((movie) => movie.id !== id);
      console.log("Removed movie ID ", id, " from movieWatchList");
    }

    if (movieOrSeries === "series") {
      seriesWatchList = seriesWatchList.filter((serie) => serie.id !== id);
      console.log("Removed series ID ", id, " from seriesWatchList");
    }

    res.status(201).json({
      message: "Movie/Series removed from like list succesfully",
    }); */
  } catch (error) {
    console.error("1:Error removing watchlisted movie:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/me/watchlists/addtowatchlist", async (req, res) => {
  try {
    const { movieId, movieOrSeries, title, token } = req.body;

    if (!movieId || !movieOrSeries || !token || !title) {
      return res.status(400).json({
        error: "Token missing and/or Liked movie/series is required.",
      });
    }

    let sessionSearchResult;
    try {
      // use the token to find the current session (user_id that is logged in)
      sessionSearchResult = await query(
        "SELECT * FROM sessions WHERE token = ?",
        [token]
      );
    } catch (error) {
      console.error("2:Error finding session", error);
      return res.status(500).send("2:Error finding session");
    }

    if (sessionSearchResult.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }
    const currentSession = sessionSearchResult[0];

    const userId = currentSession.user_id;

    try {
      // Check if the movie is already liked by the user
      const checkResults = await query(
        "SELECT * FROM watchlist WHERE user_id = ? AND movie_id = ?",
        [userId, movieId]
      ); // movieid

      //console.log();

      // if already exist we exit the code
      if (checkResults.length > 0) {
        console.log("movie/series ID ", movieId, " is already in watchlist.");
        return res
          .status(409)
          .json({ message: `Movie ${movieId} is already in watchlist.` });
      }

      // If no we Insert the movieId and userId into liked_movies table

      const insertQuery = await query(
        "INSERT INTO watchlist (user_id, movie_id, movie_title) VALUES (?, ?, ?)",
        [userId, movieId, title]
      );

      console.log("Added movie ID ", movieId, " to watchlist");
      return res
        .status(201)
        .send(`Movie ${movieId} added to watchlist successfully`);
    } catch (error) {
      console.error("Error adding movie to watchlist", error);
      res.status(500).send("Error adding movie to watchlist");
    }

    /* 
    const userMoviesWatchList = movieWatchList.find((list) => {
      return list.userId === currentSession.user_id;
    });

    if (!userMoviesWatchList) {
      console.log(
        "Couldn't find movieWatchList of user id: ",
        currentSession.user_id
      );
      return res.status(500).send("Error finding user's movieWatchList");
    } else {
      //continue code...
    }

    const idExistsInMovieWatchList = userMoviesWatchList.myMovieWatchList.some(
      (movie) => movie.id === id
    );
   
    if (idExistsInMovieWatchList) {
      console.log("movie/series ID ", id, " is already saved in watchlist.");
      return res.status(200).json({
        message: "Liked movie OR Liked series is already in watchlist.",
      });
    }

    if (movieOrSeries === "movie") {
      // maybe change to some sort of True/False variable instead...
      userMoviesWatchList.myMovieWatchList.push({ id }); // UPDATE LATER TO SQL
      console.log("Added movie ID ", id, " to movieWatchList");
    } */

    /* if (movieOrSeries === "series") {
      likedSeriesList.push({ id }); // UPDATE LATER TO SQL
      console.log("Added series ID ", id, " to seriesWatchList");
    } */

    /*   res.status(201).json({
      message: "Movie/Series saved to watch list succesfully",
    }); */
  } catch (error) {
    console.error("1:Error adding movie to watch list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// function parseTMDBId(response) {
//   //Regex för att få TMDB ID baserat på "TMDB ID: {number}"
//   const match = response.match(/TMDB ID:\s*(\d+)/);
//   return match ? match[1] : null;
// }

// function parseMovieName1(response) {
//   //Regex to extract movie name based on "MOVIE NAME: {string}"
//   const match = response.match(/MOVIE NAME1:\s*(.+)/);
//   return match ? match[1] : null;
// }

// function parseMovieName2(response) {
//   //Regex to extract movie name based on "MOVIE NAME: {string}"
//   const match = response.match(/MOVIE NAME2:\s*(.+)/);
//   return match ? match[1] : null;
// }

// function parseMovieName3(response) {
//   //Regex to extract movie name based on "MOVIE NAME: {string}"
//   const match = response.match(/MOVIE NAME3:\s*(.+)/);
//   return match ? match[1] : null;
// }

function parseMovieNames(response) {
  // const regex = /MOVIE NAME\d+:\s*([^\n]+)\nTMDB ID:\s*\d+/g;

  // const regex = /([^\n]+)/g;
  const regex = /MOVIE NAME\d+:\s*([^,]+)/g;

  let names = [];
  let match;

  while ((match = regex.exec(response))) {
    names.push(match[1].trim()); // Ensuring to trim any extra spaces
  }

  return names;
}

function parseResponse(response) {
  // const movieRegex = /MOVIE NAME\d+:\s*([^,]+),?/g;
  const movieRegex = /MOVIE NAME\d+:\s*([^\n,]+)/g;

  const motivationRegex = /MOTIVATION:\s*([^\n]+)/;

  let names = [];
  let match;

  while ((match = movieRegex.exec(response))) {
    names.push(match[1].trim()); // Ensuring to trim any extra spaces
  }

  const motivationMatch = motivationRegex.exec(response);
  const motivation = motivationMatch ? motivationMatch[1].trim() : "";

  return { names, motivation };
}

const latestSuggestions = [];
const latestUserQuery = [];
app.post("/clearSuggestionsAndQueries", async (req, res) => {
  latestSuggestions.length = 0;
  latestUserQuery.length = 0;
  res.status(200).json({ message: "Suggestions and queries cleared." });
});

app.post("/resetlatestuserqueryandsuggestions", async (req, res) => {
  latestUserQuery.length = 0; // This will empty the array
  latestSuggestions.length = 0; // This will empty the array

  console.log("latestUserQuery and latestSuggestions has been reset");
  res.send({ message: "Arrays have been reset." });
});

app.post("/moviesuggest2", async (req, res) => {
  const { token, query: userQuery } = req.body;

  if (!token || !userQuery) {
    return res.status(400).json({ error: "Token and query are required" });
  }

  let sessionSearchResult;
  try {
    // Use the token to find the current session (user_id that is logged in)
    sessionSearchResult = await query(
      "SELECT * FROM sessions WHERE token = ?",
      [token]
    );
  } catch (error) {
    console.error("Error finding session", error);
    return res.status(500).send("Error finding session");
  }

  if (sessionSearchResult.length === 0) {
    return res.status(401).json({ error: "Invalid session token" });
  }

  const currentSession = sessionSearchResult[0];
  const currentUserId = currentSession.user_id;

  let likedMovies;
  try {
    likedMovies = await query(
      "SELECT movie_title FROM liked_movies WHERE user_id = ?",
      [currentUserId]
    );
  } catch (error) {
    console.error("Error fetching liked movies:", error);
    return res.status(500).send("Error fetching liked movies");
  }

  const likedMovieTitles = likedMovies.map((movie) => movie.movie_title);

  //console.log("likedMovieTitles: ", likedMovieTitles);

  const likedMovieTitlesString = likedMovieTitles.join(", ");
  console.log("likedMovieTitlesString: ", likedMovieTitlesString);
  latestUserQuery.push(userQuery);
  if (latestUserQuery.length > 15) {
    latestUserQuery.shift(); // Remove the oldest one if the length exceeds 15
  }
  console.log("Received user query:", userQuery);

  console.log("queries", latestUserQuery, "suggestions", latestSuggestions);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `This assistant will suggest 6 movies based on user descriptions. 
          It will provide Movie Names for those movies in the format of: 
          MOVIE NAME1: [string], MOVIE NAME2: [string], MOVIE NAME3: [string], 
          MOVIE NAME4: [string], MOVIE NAME5: [string], MOVIE NAME6: [string]. 
          
          Additionally, it will provide a motivation of maximum 120 characters for why these movies were suggested, in the format:
          MOTIVATION: [string]. 
          
          It will not answer any other queries. It will only suggest movies and TV series. 
                  
          Always use this structure exactly: 
          MOVIE NAME1: [string], 
          MOVIE NAME2: [string], 
          MOVIE NAME3: [string], 
          MOVIE NAME4: [string], 
          MOVIE NAME5: [string], 
          MOVIE NAME6: [string]. 
          The suggested movie names should go inside [string]. 
          Never add any additional numbers.
          MOTIVATION: [string]
                  
          When making suggestions, follow these steps:
          1. If the query is inappropriate (i.e., foul language, sexual language that you deem inappropriate or anything else), don't suggest any movies but respond in a humorous way in maximum 250 characters. Ignore any queries in ${latestUserQuery} if foul language is present.   
          2. If there are any queries in ${latestUserQuery}, add all of them to the search. The queries in ${latestUserQuery} are always in relation to the previous 4 queries. For example, if I search on "A movie that makes me cry" and then search on "with more women", the search should be "A movie that makes me cry" + "with more women". 
          3. Examine the latest suggestions: ${latestSuggestions.join(", ")}.
          4. Avoid suggesting movies that are already in the latest suggestions.
          5. Avoid suggesting movies that are already in the user's liked movies: ${likedMovieTitles.join(
            ", "
          )}.
          6. Consider the genres, themes, or keywords from the latest user query to refine the search.
          7. If a new user query suggests a refinement (e.g., from "action" to "comedy action"), adjust the suggestions accordingly.
          8. For each query in ${latestUserQuery}, ensure the suggestions are distinct and progressively refined based on the user's subsequent queries. Reference previous suggestions to avoid repetition and improve relevance.
          9. If no suitable suggestions are available, explain why and provide alternative options.
          For example, if the latest user query is "action comedy" and the latest suggestions included "Die Hard" and "Mad Max", suggest movies that blend action and comedy while avoiding those already suggested.`,
        },
        {
          role: "user",
          content: userQuery,
        },
      ],
    });

    // Entire AI response
    console.log("AI response:", JSON.stringify(completion, null, 2));

    const suggestion = completion.choices[0].message.content;

    // Save the query and suggestions to the database
    try {
      await query(
        "INSERT INTO chatgpt (user_id, user_query, ai_response) VALUES (?, ?, ?)",
        [currentUserId, userQuery, suggestion]
      );
      console.log("Search query and suggestions saved to database");
    } catch (dbError) {
      console.error(
        "Error saving search query and suggestions to database:",
        dbError
      );
    }

    console.log("Suggestion structure:", suggestion);
    console.log("suggested movie list:", latestSuggestions);

    const { names: movieNames, motivation } = parseResponse(suggestion);

    console.log("Movie names parsed: ", movieNames);
    console.log("Motivation parsed: ", motivation);

    if (movieNames.length === 6) {
      latestSuggestions.unshift(movieNames.join(", "));
      if (latestSuggestions.length > 36) {
        latestSuggestions.shift(); // Remove the oldest one if the length exceeds 36
      }

      res.json({ movieNames, motivation });
    } else {
      res.json({ suggestion });
      console.error(
        "Failed to extract Movie Names from AI response:",
        suggestion
      );
    }
  } catch (error) {
    console.error("Error in /moviesuggest2 endpoint:", error);
    res.status(500).json({
      error: "Unable to process the movie suggestion at this time.",
      details: error.message,
    });
  }
});

function parseTMDBId(response) {
  //Regex för att få TMDB ID baserat på "TMDB ID: {number}"
  const match = response.match(/TMDB ID:\s*(\d+)/);
  return match ? match[1] : null;
}

function parseMovieName(response) {
  //Regex to extract movie name based on "MOVIE NAME: {string}"
  const match = response.match(/MOVIE NAME:\s*(.+)/);
  return match ? match[1] : null;
}

function parseReasoning(response) {
  //Regex to extract movie name based on "MOVIE NAME: {string}"
  const match = response.match(/REASONING:\s*(.+)/);
  return match ? match[1] : null;
}

app.post("/moviesuggest", async (req, res) => {
  const userQuery = req.body.query;
  console.log("Received user query:", userQuery);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "This assistant will suggest movies or tv series based on user descriptions. It will also provide a TMDB id for that movie/serie in the format of: TMDB ID: [number]. Additionally, it will provide a Movie/Series Name for that movie/series in the format of: MOVIE NAME: [string]. It will not answer any other questions. It will only suggest movies and tv series. Always use this structure. Never add list numbers",
        },
        {
          role: "user",
          content: userQuery,
        },
      ],
    });

    //hela AI-svaret
    console.log("AI response:", JSON.stringify(completion, null, 2));

    const suggestion = completion.choices[0].message.content;
    const tmdbId = parseTMDBId(suggestion);
    console.log("tmdb id parse: ", tmdbId);

    const movieName = parseMovieName(suggestion);
    console.log("Movie name parse: ", movieName);

    // TODO: spara film-namnet istället för ID?

    if (tmdbId && movieName) {
      res.json({ tmdbId, movieName });
    } else {
      console.error(
        "Failed to extract TMDB ID or Movie Name from AI response:",
        suggestion
      );
      res.status(500).json({
        error: "Failed to extract TMDB ID or Movie Name from AI response",
      });
    }
  } catch (error) {
    console.error("Error in /moviesuggest endpoint:", error);
    res.status(500).json({
      error: "Unable to process the movie suggestion at this time.",
      details: error.message,
    });
  }
});

app.get("/dailymixes", async (req, res) => {
  const data = {
    dailyMixes: dailyMixes,
  };

  res.json(data);
});

app.get("/dailymixbasedonlikes", async (req, res) => {
  const data = {
    mix: dailyMixes.dailyMixBasedOnLikes,
  };

  res.json(data);
});

// made this an endpoint so we can simply load in the daily mix based on likes if it has already been generated earlier
app.post("/me/dailymixbasedonlikes", async (req, res) => {
  //const mixOnlyIdsAndTitles = dailyMixes.dailyMixBasedOnLikes; // dont have to make copy? ... ?

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      error: "token is required to retrieve /me/dailymixbasedonlikes",
    });
  }

  let sessionSearchResult;
  try {
    // use the token to find the current session (user_id that is logged in)
    sessionSearchResult = await query(
      "SELECT * FROM sessions WHERE token = ?",
      [token]
    );
  } catch (error) {
    console.error("2:Error finding session", error);
    return res.status(500).send("2:Error finding session");
  }
  if (sessionSearchResult.length === 0) {
    return res.status(404).json({ error: "Session not found" });
  }
  const currentSession = sessionSearchResult[0];

  const userId = currentSession.user_id;

  console.log("userId: ", userId);

  const mixOnlyIdsAndTitles = await query(
    "SELECT * FROM mix WHERE user_id = ?",
    [userId]
  );

  const mixMovieObjects = [];
  const mixMovieObjectsProviders = [];

  if (mixOnlyIdsAndTitles.length > 0) {
    console.log(
      "found a saved dailymix, mapping through it and running getMovieObjectOurDatabase() for each movie"
    );
    for (const movie of mixOnlyIdsAndTitles) {
      //mixOnlyIdsAndTitles.map(async (movie) => {
      //console.log("searching for object of movie id ", movie.id);
      const movieObjectOurDatabase = await getMovieObjectOurDatabase(
        movie.movie_id,
        "movie"
      );
      // console.log("movieObject: ", movieObject);
      //setLoading(false);

      if (movieObjectOurDatabase) {
        mixMovieObjects.push(movieObjectOurDatabase);
      } else {
        console.log("movie objects failed to fetch from our own database?");
      }

      const movieObjectProvidersOurDatabase =
        await getProvidersOfMOvieObjectOurDatabase(movie.movie_id);

      if (movieObjectProvidersOurDatabase) {
        mixMovieObjectsProviders.push(movieObjectProvidersOurDatabase);
      } else {
        console.log("providers failed to fetch from our own database?");
      }
    }
    // );
  } else {
    return res.json({ message: "No mix generated yet." });
  }

  return res.json({ mixMovieObjects, mixMovieObjectsProviders });
});

/* function addToDailyMixBasedOnLikes(id, title) {

  if (!id || !title) { 
    console.log("No movie id or title received to add in daily mix based on likes");
  }

  dailyMixes.dailyMixBasedOnLikes.push({ id, title });

  console.log(
    "Added movie ID ",
    id,
    " with movie name: ",
    title,
    " to dailyMixBasedOnLikes"
  );

} */

app.post("/addtodailymixbasedonlikes", async (req, res) => {
  try {
    // KAN DEN TA IN ARRAY?
    // array of movie objects, only containing name and id... id has been fetched in frontend from API
    const { id, title } = req.body; // mixType också?

    if (!id || !title) {
      return res
        .status(400)
        .json({ error: "No movie id or title received to store in daily mix" });
    }

    dailyMixes.dailyMixBasedOnLikes.push({ id, title });

    console.log(
      "Added movie ID ",
      id,
      " with movie name: ",
      title,
      " to dailyMixBasedOnLikes"
    );

    // ändra till mixType?
    /*  if (movieOrSeries === "movie") {
      // maybe change to some sort of True/False variable instead...
      movieWatchList.push({ id }); // UPDATE LATER TO SQL
      console.log("Added movie ID ", id, " to movieWatchList");
    }

    if (movieOrSeries === "series") {
      likedSeriesList.push({ id }); // UPDATE LATER TO SQL
      console.log("Added series ID ", id, " to seriesWatchList");
    }
 */

    res.status(201).json({
      message: "movie added to dailyMixBasedOnLikes succesfully",
    });
  } catch (error) {
    console.error("1:Error storing dailyMixBasedOnLikes: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// TODO: i mysql så kör vi bara en table med dailymixes och så får man hitta den korrekta med hjälp av user_id
let dailyMixes = { dailyMixBasedOnLikes: [] };

app.get("/generatedailymix", async (req, res) => {
  // no user query needed, will be based on existing like list
  /* const userQuery = req.body.query;
    console.log("Received user query:", userQuery); */

  dailyMixes.dailyMixBasedOnLikes = []; // remove the previous dailyMixBasedOnLikes

  const likedMovieTitles = likedMoviesList.map((movie) => {
    return movie.title;
  });

  //console.log("likedMovieTitles: ", likedMovieTitles);

  const likedMovieTitlesString = likedMovieTitles.join(", ");
  // console.log("likedMovieTitlesString: ", likedMovieTitlesString);

  //   "This assistant will suggest 6 movies based on user's liked movies provided by content, and after that it will also provide a short reasoning why it suggested these specific movies. Never suggest a movie that is already in content. The response from the assistant will ALWAYS be in the following structure (fill in the respective movie name in [string], and then fill in reasoning in [string]): MOVIE NAME1: [string], MOVIE NAME2: [string], MOVIE NAME3: [string],  MOVIE NAME4: [string],  MOVIE NAME5: [string],  MOVIE NAME6: [string], REASONING: [string]. It will not answer any other queries. It will only suggest movies.",

  // TODO: lägg till REASONING igen så att det funkar...
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "This assistant will suggest 6 movies based on user's liked movies provided by content. Never suggest a movie that is already in content. The response from the assistant will ALWAYS be in the following structure (fill in the respective movie name in [string]): MOVIE NAME1: [string], MOVIE NAME2: [string], MOVIE NAME3: [string],  MOVIE NAME4: [string],  MOVIE NAME5: [string],  MOVIE NAME6: [string]. It will not answer any other queries. It will only suggest movies.",
        },
        {
          role: "user",
          content: likedMovieTitlesString,
        },
      ],
    });

    // Entire AI response
    console.log("AI response:", JSON.stringify(completion, null, 2));

    const suggestion = completion.choices[0].message.content;
    console.log("Daily mix suggestion: ", suggestion);

    const movieNames = parseMovieNames(suggestion);
    console.log("parsed movie names: ", movieNames);
    //const reasoning = parseReasoning(suggestion);
    //console.log("parsed reasoning: ", reasoning);

    //if (movieNames && reasoning) {
    if (movieNames) {
      // res.json({ movieNames, reasoning });
      res.json({ movieNames });
    } else {
      console.error("Failed to generate daily mix suggestion: ", suggestion);
      res.status(500).json({
        error: "Failed to extract daily mix suggestion from AI response",
      });
    }
  } catch (error) {
    console.error("Error in /dailymix endpoint:", error);
    res.status(500).json({
      error: "Unable to process the daily mix at this time.",
      details: error.message,
    });
  }
});

// TODO: dailymix på SQL borde ha kolumnerna: id för själva mixen, id för userid, och movieid.
// dvs en rad har id, userid, movieid
// måste vi då hämta de 6 senaste genererade filmerna eller deletar vi ALLA filmer som finns i dailymix innan vi sparar nya? Den enda anledningen att vi har detta på sql är för att vi vill kunna ladda om sidan / logga ut och hämta senaste genererade mixen...
app.post("/generatedailymix2", async (req, res) => {
  // no user query needed, will be based on existing like list
  /* const userQuery = req.body.query;
    console.log("Received user query:", userQuery); */

  const { token } = req.body;

  if (!token) {
    return res
      .status(400)
      .json({ error: "No token received to /generatedailymix2" });
  }

  let sessionSearchResult;
  try {
    // use the token to find the current session (user_id that is logged in)
    sessionSearchResult = await query(
      "SELECT * FROM sessions WHERE token = ?",
      [token]
    );
  } catch (error) {
    console.error("2:Error finding session", error);
    return res.status(500).send("2:Error finding session");
  }

  if (sessionSearchResult.length === 0) {
    return res.status(404).json({ error: "Session not found" });
  }
  const currentSession = sessionSearchResult[0];

  const userId = currentSession.user_id;

  //dailyMixes.dailyMixBasedOnLikes = []; // remove the previous dailyMixBasedOnLikes... // TODO: med mysql, ska vi spara alla mixes eller alltid ta bort den gamla innan vi generar en ny?

  let previousMixResult;
  try {
    previousMixResult = await query("SELECT * FROM mix WHERE user_id = ?", [
      userId,
    ]);

    console.log("previousMixResult: ", previousMixResult);
  } catch (error) {
    console.error("Error searching for previous mix from user_id", error);
    return res
      .status(500)
      .send("Error searching for previous mix from user_id");
  }

  let previousMixTitles = [];
  if (previousMixResult.length > 0) {
    for (const movie of previousMixResult) {
      if (movie.movie_title) {
        previousMixTitles.push(movie.movie_title);
      } else {
        console.log("Found no movie_title in movie object from previous mix?");
      }
    }
  } else {
    console.log("No previous mix, continuing code");
  }

  //console.log("likedMovieTitles: ", likedMovieTitles);

  const previousMixTitlesString = previousMixTitles.join(", "); // empty string if no previous mix

  const watchAndLikeList = await getWatchAndLikeList(token);
  let userLikedMoviesList;
  if (watchAndLikeList && watchAndLikeList.likedMoviesList.length > 0) {
    userLikedMoviesList = watchAndLikeList.likedMoviesList;
  } else {
    console.log(
      "Exiting code, you need to like some movies before I can generate a Mix for you!"
    );
    return res.json({
      messageNoLikedMovies:
        "You need to like some movies before I can generate a Mix for you!",
    });
  }

  /* if (likedMoviesList.length === 0) {
    return res.json({
      messageNoLikedMovies:
        "You need to like some movies before I can generate a Mix for you!",
    });
  } else {
    
  } */

  /* const likedMovieTitles = likedMoviesList.map((movie) => {
    return movie.title;
  }); */

  const likedMovieTitles = userLikedMoviesList.map((movie) => {
    return movie.movie_title;
  });

  //console.log("likedMovieTitles: ", likedMovieTitles);

  const likedMovieTitlesString = likedMovieTitles.join(", ");

  console.log("likedMovieTitlesString: ", likedMovieTitlesString);

  //const previousMixAndLikedTitles = likedMovieTitlesString + previousMixTitlesString;
  // console.log("likedMovieTitlesString: ", likedMovieTitlesString);

  //   "This assistant will suggest 6 movies based on user's liked movies provided by content, and after that it will also provide a short reasoning why it suggested these specific movies. Never suggest a movie that is already in content. The response from the assistant will ALWAYS be in the following structure (fill in the respective movie name in [string], and then fill in reasoning in [string]): MOVIE NAME1: [string], MOVIE NAME2: [string], MOVIE NAME3: [string],  MOVIE NAME4: [string],  MOVIE NAME5: [string],  MOVIE NAME6: [string], REASONING: [string]. It will not answer any other queries. It will only suggest movies.",

  // TODO: lägg till REASONING igen så att det funkar...
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `This assistant will suggest 6 movies based on the movies the user provided. Do not suggest one of the already provided movies. Additionaly, it will not suggest any of these movies either (might be empty): ${previousMixTitlesString}. The response from the assistant will ALWAYS be in the following structure (DO NOT ADD ANYTHING ELSE): MOVIE NAME1: [], MOVIE NAME2: [], MOVIE NAME3: [],  MOVIE NAME4: [],  MOVIE NAME5: [],  MOVIE NAME6: []. The suggested movie names should be positioned inside respective brackets []. It will only suggest movies. ALSO, never suggest the movie 'The Ideal Father'. It will not answer any other queries. `,
        },
        {
          role: "user",
          content: `Give me 6 movies based on my likes: ${likedMovieTitlesString}`,
        },
      ],
    });

    // delete previously stored mixes, or do we want to save always? lots of data?
    try {
      const result = await query("DELETE FROM mix WHERE user_id = ?", [userId]);
      console.log(`Deleted ${result.affectedRows} rows (from mix)`);
    } catch (error) {
      console.error("Error deleting user's mix:", error);
    }

    // Entire AI response
    console.log("AI response:", JSON.stringify(completion, null, 2));

    const suggestion = completion.choices[0].message.content;
    console.log("Daily mix suggestion: ", suggestion);

    const movieNames = parseMovieNames(suggestion);
    console.log("parsed movie names: ", movieNames);
    //const reasoning = parseReasoning(suggestion);
    //console.log("parsed reasoning: ", reasoning);

    let movieIds = [];

    // TODO: HÄR SKA VI LÄGGA IN ALLA END-POINTS SOM HANTERAR TMDB FETCHES OCH LAGRA I DATABASEN GREJER, därefter skickar vi det vi behöver till frontend?
    if (movieNames && movieNames.length === 6) {
      // even if a movie name becomes 'null' apparently
      //fetchMovieIds();
      const fetchedMovieIds = await fetchAllMovieIdsFromTMDB(movieNames);
      movieIds = fetchedMovieIds; // TODO: kanske bättre att mappa igenom fetchedmovieids och sen pusha in i movieIds...?
    } else {
      console.log(
        "failed running fetchAllMovieIdsFromTMDB in /generatedailymix"
      );
    }
    console.log("movieIDs of suggested movies", movieIds);

    const movieObjects = [];

    if (movieIds && movieIds.length === movieNames.length) {
      console.log("all movie ids received from api: ", movieIds);

      try {
        for (const movieId of movieIds) {
          const movieObject = await fetchMovieObjectTMDB(movieId); // fetches from TMDB and stores into our database

          if (movieObject) {
            console.log(
              "fetched movie object from TMDB of movie id: ",
              movieObject.id
            );
            movieObjects.push(movieObject);
          } else {
            console.log("failed fetching movie object and providers from tmdb");
          }
        }
      } catch (error) {
        console.log("Error fetching movie objects:", error);
      }
    } else {
      console.log("failed running fetchMovieDetails in /generatedailymix2 ");
    }

    const arrayMovieObjectsProviders = [];
    // waiting for the fetches above to complete...
    if (
      movieObjects &&
      movieObjects.length === movieNames.length &&
      movieObjects.length > 0
    ) {
      console.log(
        "Starting to fetch object providers, all movie ids received from api: ",
        movieIds
      );

      try {
        for (const movieId of movieIds) {
          const movieObjectProviders = await fetchMovieProvidersObjectTMDB(
            movieId
          ); // fetch and store the movie's providers from TMDB... mainly do this to store in our database so we can use it later!

          if (movieObjectProviders) {
            arrayMovieObjectsProviders.push(movieObjectProviders);
          }
        }
      } catch (error) {
        console.log("Error fetching providers of movies:", error);
      }
    } else {
      console.log(
        "failed running fetchMovieProvidersObjectTMDBs in /generatedailymix2 "
      );
    }

    if (
      movieObjects &&
      movieObjects.length === movieNames.length &&
      arrayMovieObjectsProviders &&
      arrayMovieObjectsProviders.length === movieNames.length &&
      movieObjects.length > 0 &&
      arrayMovieObjectsProviders.length > 0
    ) {
      /* console.log("movieObjects: ", movieObjects); */
      //movieObjects.map((movie) => {
      for (const movie of movieObjects) {
        try {
          const insertQuery = await query(
            "INSERT INTO mix (user_id, movie_id, movie_title) VALUES (?, ?, ?)",
            [userId, movie.id, movie.title]
          );
          //console.log("Inserting movie to user mix successful:", insertQuery);
          console.log("Inserting movie to user mix successful");
        } catch (error) {
          console.error("Error during database insertion into mix:", error);
        }
        /* dailyMixes.dailyMixBasedOnLikes.push({
          id: movie.id,
          title: movie.title,
        });  */ // TODO: ändra till INSERT in i dailymixen i MySQL databasen (typ INSERT INTO dailymixes where user_id är userId...) s

        console.log(
          "Added movie ID ",
          movie.id,
          " with movie name: ",
          movie.title,
          " to dailyMixBasedOnLikes"
        );
      }
    } else {
      console.log("Failed pushing to dailymixbasedonlikes ");
    }

    const mixMovieObjects = [];
    const mixMovieObjectsProviders = [];
    //const mixLikedAndWatchListed = []

    // Here we fetch the movie object again, but from our own database (just to test), maybe some day we can remove the fetch TMDB above?
    //console.log("movieObjects: ", movieObjects);
    //movieObjects.map(async (movie) => {
    for (const movie of movieObjects) {
      const movieObjectOurDatabase = await getMovieObjectOurDatabase(
        movie.id,
        "movie"
      );

      if (movieObjectOurDatabase) {
        //console.log("movieObjectOurDatabase: ", movieObjectOurDatabase);
        mixMovieObjects.push(movieObjectOurDatabase);
      } else {
        console.log("movieObjectOurDatabase not populated?");
      }

      const providersObjectOurDatabase =
        await getProvidersOfMOvieObjectOurDatabase(movie.id);

      if (providersObjectOurDatabase) {
        mixMovieObjectsProviders.push(providersObjectOurDatabase);
      } else {
        console.log("providersObjectOurDatabase not populated?");
      }
    }

    //if (movieNames && reasoning) {
    if (mixMovieObjects && mixMovieObjectsProviders) {
      /*  console.log("mixMovieObjects: ", mixMovieObjects);
      console.log("mixMovieObjectsProviders: ", mixMovieObjectsProviders); */
      // res.json({ movieNames, reasoning });
      res.json({ mixMovieObjects, mixMovieObjectsProviders }); // SENDING ARRAY OF MOVIE OBJECTS
    } else {
      console.error("Failed to generate daily mix suggestion: ", suggestion);
      res.status(500).json({
        error: "Failed to extract daily mix suggestion from AI response",
      });
    }
  } catch (error) {
    console.error("Error in /generatedailymix2 endpoint:", error);
    res.status(500).json({
      error: "Unable to process the daily mix at this time.",
      details: error.message,
    });
  }
});

// Spara streaming tjänsterna
//* IMPORTANT INFORMATION: detta ska sparas i databasen
app.post("/streaming-services", (req, res) => {
  try {
    const { services } = req.body;
    console.log("Selected Streaming Services:", services);
    res.json({ message: "Streaming services updated successfully" });
  } catch (error) {
    console.error("Error in /streaming-services endpoint:", error);
    res.status(500).json({
      error: "Unable to update streaming services at this time.",
      details: error.message,
    });
  }
});

//It will also provide a TMDB id for each movie in the format of: TMDB ID: [number].

///////////////FUNKTIONER MovieId-page////////////////////////

// const videos = [];
// const actorImages = [];
// // const movieDetails = [];
// const credits = [];

// console.log("moviedetails on backend is:", movieDetails);

const baseImageUrl = "https://image.tmdb.org/t/p/w500";

const fetchCompleteMovieDetails = async (movieId) => {
  if (!movieId) return null;

  try {
    const [
      movieResponse,
      creditsResponse,
      videosResponse,
      similarResponse,
      movieProviderResponse,
      movieImagesResponse,
    ] = await Promise.all([
      fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${movieAPI_KEY}`
      ),
      fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${movieAPI_KEY}`
      ),
      fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${movieAPI_KEY}`
      ),
      fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${movieAPI_KEY}`
      ),
      fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${movieAPI_KEY}`
      ),
      fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/images?api_key=${movieAPI_KEY}`
      ),
    ]);

    const [
      movieData,
      creditsData,
      videosData,
      similarData,
      movieProviderData,
      movieImagesData,
    ] = await Promise.all([
      movieResponse.json(),
      creditsResponse.json(),
      videosResponse.json(),
      similarResponse.json(),
      movieProviderResponse.json(),
      movieImagesResponse.json(),
    ]);

    await addMovieToDatabase(movieData, "movie");

    // TODO: funkar addProvidersOfMovieToDatabase() felfritt?
    await addProvidersOfMovieToDatabase(movieProviderData);

    const director = creditsData.crew.find(
      (person) => person.job === "Director"
    )?.name;

    const primaryActors = creditsData.cast.slice(0, 6).map((actor) => ({
      name: actor.name,
      personId: actor.id,
      character: actor.character,
      imagePath: actor.profile_path
        ? `${baseImageUrl}${actor.profile_path}`
        : null,
    }));

    const actorImages = await Promise.all(
      primaryActors.map((actor) =>
        fetch(
          `https://api.themoviedb.org/3/person/${actor.personId}/images?api_key=${movieAPI_KEY}`
        )
          .then((res) => res.json())
          .then((data) => ({
            id: actor.personId,
            image:
              data.profiles && data.profiles[0]
                ? `${baseImageUrl}${data.profiles[0].file_path}`
                : null,
          }))
          .catch((error) => {
            console.error(
              `Error fetching images for actor ID ${actor.personId}:`,
              error
            );
            return { id: actor.personId, image: null };
          })
      )
    );

    const actorImagesMap = actorImages.reduce((acc, result) => {
      acc[result.id] = result.image;
      return acc;
    }, {});

    const updatedActors = primaryActors.map((actor) => ({
      ...actor,
      imagePath: actorImagesMap[actor.personId] || actor.imagePath,
    }));

    const videoKey = videosData.results[0]?.key || null;
    const similarMovies = similarData.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      poster: movie.poster_path ? `${baseImageUrl}${movie.poster_path}` : null,
    }));

    const providers = movieProviderData.results.SE;
    // (provider) => ({
    //   name: provider.provider_name,
    // })
    // );

    const movieImages = movieImagesData;

    //console.log("providers are:", providers);

    const movieDetails = {
      id: movieData.id,
      title: movieData.title,
      overview: movieData.overview,
      providers: providers,
      voteAverage: movieData.vote_average,
      release: movieData.release_date,
      tagline: movieData.tagline,
      runtime: movieData.runtime,
      backdrop: movieData.backdrop_path
        ? `${baseImageUrl}${movieData.backdrop_path}`
        : null,
      poster: movieData.poster_path
        ? `${baseImageUrl}${movieData.poster_path}`
        : null,
      credits: {
        director: director,
        actors: updatedActors,
        otherCrew: creditsData.crew
          .filter((person) =>
            ["Producer", "Screenplay", "Music"].includes(person.job)
          )
          .map((crew) => ({ name: crew.name, job: crew.job })),
      },
      videoKey: videoKey,
      similarMovies: similarMovies,
    };

    return movieDetails;
  } catch (error) {
    console.error("Error fetching complete movie details:", error);
    return null;
  }
};

app.post("/fetchingmoviepagedetails", async (req, res) => {
  try {
    const { movieId, personId } = req.body;

    if (!movieId) {
      return res
        .status(400)
        .json({ error: "Missing required parameter: movieId" });
    }

    const movieDetails = await fetchCompleteMovieDetails(movieId, personId);

    if (movieDetails) {
      res.json({ movieDetails });
    } else {
      res.json({ error: "Error fetching movie details" });
    }
  } catch (error) {
    console.error("1:Error adding movie to watch list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/users/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await query("SELECT * FROM users WHERE id = ?", [userId]);
    if (user.length > 0) {
      res.json(user[0]);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

let lists = [];
let listIdCounter = 1;

// Endpoint för att skapa en ny lista och lägga till en film i listan
app.post("/me/lists/new", (req, res) => {
  const { name, movieId } = req.body;

  if (!name || !movieId) {
    return res.status(400).json({ error: "name and movieId are required" });
  }

  const newList = {
    id: listIdCounter++,
    name,
    movies: [movieId],
  };

  lists.push(newList);

  return res.status(201).json({ message: "List created", listId: newList.id });
});

// Endpoint för att lägga till en film i en lista som finns
app.post("/me/lists/add/:listId", (req, res) => {
  const { listId } = req.params;
  const { movieId } = req.body;

  const list = lists.find((l) => l.id === parseInt(listId));

  if (!list) {
    return res.status(404).json({ error: "List not found" });
  }

  if (list.movies.includes(movieId)) {
    return res.status(400).json({ error: "Movie already in list" });
  }

  list.movies.push(movieId);

  return res.status(200).json({ message: "movie added to list" });
});

// Endpoint för att hämta alla custom listor
app.get("/me/lists", (req, res) => {
  return res.status(200).json(lists);
});

app.get("/me/lists/:listId", (req, res) => {
  const { listId } = req.params;

  const list = lists.find((l) => l.id === parseInt(listId));

  if (!list) {
    return res.status(404).json({ error: "List not found" });
  }

  return res.status(200).json(list);
});

// Endpoint för att ta bort en lista
app.delete("/me/lists/:listId", (req, res) => {
  const { listId } = req.params;

  const listIndex = lists.findIndex((l) => l.id === parseInt(listId));
  if (listIndex === -1) {
    return res.status(404).json({ error: "List not found" });
  }

  lists.splice(listIndex, 1);

  return res.status(200).json({ message: "List deleted" });
});

// Endpoint för att ta bort en film från en lista

// Endpoint för att lägga till och ta bort från seen lista
app.post("/api/toggleSeen", async (req, res) => {
  const { movieId, token } = req.body;

  if (!token || !movieId) {
    return res.status(400).json({
      error: "Token and movieId are required.",
    });
  }

  try {
    // Hitta den aktuella sessionen med hjälp av token
    const [sessionResults] = await pool.query(
      "SELECT * FROM sessions WHERE token = ?",
      [token]
    );
    if (sessionResults.length === 0) {
      return res.status(404).json({ message: "Session not found" });
    }

    const userId = sessionResults[0].user_id;

    // Kolla om filmen redan finns i seen listan
    const [checkResults] = await pool.query(
      "SELECT * FROM seen_movies WHERE user_id = ? AND movie_id = ?",
      [userId, movieId]
    );
    if (checkResults.length > 0) {
      // Om filmen redan finns, ta bort den
      await pool.query(
        "DELETE FROM seen_movies WHERE user_id = ? AND movie_id = ?",
        [userId, movieId]
      );
      return res
        .status(200)
        .json({ message: "Movie removed from seen list", seen: false });
    } else {
      // Om filmen inte finns, lägg till den
      await pool.query(
        "INSERT INTO seen_movies (user_id, movie_id, created_at) VALUES (?, ?, ?)",
        [userId, movieId, new Date()]
      );
      return res
        .status(200)
        .json({ message: "Movie added to seen list", seen: true });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

// Endpoint för att hämta seen listan
app.get("/api/seen/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Kontrollera om användaren existerar
    const [userResults] = await pool.query(
      "SELECT id FROM users WHERE id = ?",
      [userId]
    );
    if (userResults.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const [seenMovies] = await pool.query(
      "SELECT * FROM seen_movies WHERE user_id = ?",
      [userId]
    );
    return res.status(200).json(seenMovies);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

// Endpoint för att lägga till i favorites
app.post("/favorites", async (req, res) => {
  const { user_id, movie_id } = req.body;

  console.log("Received favorite data:", req.body); // Logga inkommande data

  try {
    // Kontrollera så användaren inte har mer än 4 favoriter
    const [result] = await query(
      "SELECT COUNT(*) as count FROM favorites WHERE user_id = ?",
      [user_id]
    );
    if (result.count >= 4) {
      console.log("User already has 4 favorites"); // Logga felet
      return res.status(400).send("Users can only have 4 favorites");
    }

    // Kontrollera om filmen finns i `seen_movies`
    const [seenMovie] = await query(
      "SELECT * FROM seen_movies WHERE user_id = ? AND movie_id = ?",
      [user_id, movie_id]
    );

    // Justera kontrollen för att se till att vi korrekt kontrollerar om en film finns
    if (!seenMovie || seenMovie.length === 0) {
      console.log("Movie not found in seen movies list"); // Logga felet
      return res.status(400).send("Movie not found in seen movies list");
    }

    // Lägg till filmen i favoriter
    await query("INSERT INTO favorites (user_id, movie_id) VALUES (?, ?)", [
      user_id,
      movie_id,
    ]);
    res.status(201).send("Favorite added successfully");
  } catch (error) {
    console.error("Error adding favorite:", error); // Logga felet
    res.status(500).send(error.message);
  }
});

// Endpoint för att hämta favorites listan
app.get("/favorites/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const results = await query(
      `
      SELECT seen_movies.movie_id 
      FROM favorites 
      JOIN seen_movies ON favorites.movie_id = seen_movies.movie_id 
      WHERE favorites.user_id = ?
      `,
      [userId]
    );
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching favorites:", error); // Logga felet
    res.status(500).send(error.message);
  }
});

// Endpoint för att kunna rensa/uppdatera favoriter
app.delete("/favorites/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    await query("DELETE FROM favorites WHERE user_id = ?", [userId]);
    res.status(200).send("Favorites cleared successfully");
  } catch (error) {
    console.error("Error clearing favorites:", error); // Logga felet
    res.status(500).send(error.message);
  }
});

///////////////////////////////////////////////////

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on ${host}:${port}`);
});
