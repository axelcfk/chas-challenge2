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

dotenv.config();

const app = express();
const port = 3010;
const host = "http://localhost:3010";

const movieAPI_KEY = "4e3dec59ad00fa8b9d1f457e55f8d473";

// connect to DB
const pool = mysql.createPool({
  // host: "mysql",
  host: "localhost",
  user: "root",
  password: "root",
  database: "movie-app",
  port: 3306,
  //port: 8889 || 3306,
});

function generateOTP() {
  return crypto.randomBytes(16).toString("hex"); // Generera ett OTP med crypto
}

// help function to make code look nicer
async function query(sql, params) {
  const [results] = await pool.execute(sql, params); // får en array, så måste vara [results]...?
  return results;
}

//Middleware

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// const apiKey = process.env.movieAPI_KEY;

app.post("/joke", async (req, res) => {
  //Tar emot input från frontend och storear i userQuery
  const userQuery = req.body.input;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a mental health coach only. You should not respond to anything that is not related to mental health, guidence, gratitude and life goals. If the user asks about anything else you should respond with a message explaining that you are not created to answer that question.",
        },
        {
          role: "user",
          content:
            userQuery ||
            "Please provide a short daily reflection, around 100 words, on an aspect of gratitude. Focus on different subjects each time, such as interactions, personal achievements, or everyday blessings.",
        },
      ],
    });

    console.log("OpenAI API Response:", JSON.stringify(completion, null, 2));

    //Här ligger meddelandet man får från open api
    const result = completion.choices[0].message.content;

    //skickar result tillbaka till frontend
    res.json({ joke: result });

    // STORING USERQUERY AND AIRESPONSE TO MYSQL
    const user_id = 1; // PLACEHOLDER USER_ID
    try {
      // create an empty account (0 kr) for the user, with the user_id attached to it
      const userQueryAndResponseSQLData = await query(
        "INSERT INTO chatgpt (user_id, user_query, ai_response) VALUES (?, ?, ?)",
        [user_id, userQuery, result]
      );
      console.log("userQuerySQLData: ", userQueryAndResponseSQLData[0]);
    } catch (error) {
      console.error(
        "Error saving user query and ai response to mysql: ",
        error
      );
      return res
        .status(500)
        .send("Error saving user query and ai response to mysql");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Unable to fetch a joke at this time.",
      details: error.message,
    });
  }
});

//CREATE ACCOUNT
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

    res
      .status(201)
      .json({ message: "User created successfully", userId: userId });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user" });
  }
});

//SESSION

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
        res.json({ message: "Login successful", token, userId: userData.id });
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
      console.error("Error fetching movie ID:", error);
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

    addProvidersOfMovieToDatabase(data); // lägger endast till om Sverige finns med

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
      addMovieToDatabase(data, "movie"); // STORES FETCHED MOVIE OBJECT TO DATABASE
    } else {
      console.log("failed to fetch movie object from TMDB");
    }

    return data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
  } finally {
    //setLoading(false);
    //setFetchedAndSavedDetailsFromAPI(!fetchedAndSavedDetailsFromAPI);
  }
}

function addMovieToDatabase(movieObject, movieOrSeries) {
  if (!movieObject.id || !movieOrSeries) {
    console.log(
      "Received movie does not contain an id, and/or need to define if movie or series."
    );
  }

  const idExistsInMovies = fetchedMovies.some(
    (fetchedMovie) => fetchedMovie.id === movieObject.id
  );
  const idExistsInSeries = fetchedSeries.some(
    (fetchedSerie) => fetchedSerie.id === movieObject.id
  );

  if (idExistsInMovies || idExistsInSeries) {
    console.log(
      "movie/series ID ",
      movieObject.id,
      " has already been fetched."
    );
    return; // TODO: return nothing?
  } else {
    // om redan finns?
  }

  if (movieOrSeries === "movie") {
    // maybe change to some sort of True/False variable instead...
    fetchedMovies.push(movieObject); // UPDATE LATER TO SQL
    console.log("Added movie ID ", movieObject.id, " to fetchedMovies");
  } else if (movieOrSeries === "series") {
    fetchedSeries.push(movieObject); // UPDATE LATER TO SQL
    console.log("Added series ID ", movieObject.id, " to fetchedSeries");
  } else {
    console.log("Could not determine if movie or series");
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

app.post("/addmovieproviderstodatabase", (req, res) => {
  try {
    const { movieProvidersObject } = req.body;

    if (!movieProvidersObject) {
      return res
        .status(400)
        .json({ error: "No object of providers or movie ID provided" });
    }

    addProvidersOfMovieToDatabase(movieProvidersObject);
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
function addProvidersOfMovieToDatabase(movieProvidersObject) {
  if (!movieProvidersObject) {
    console.log(
      "movie providers object or id not provided when attempting to add to our database."
    );
    return; //exit code // TODO: ändra att den returnerar något annat? typ error?
  }

  const idExistsAlready = fetchedProvidersOfMovie.some(
    (fetchedMovie) => fetchedMovie.id === movieProvidersObject.id
  );
  /*  const idExistsInSeries = fetchedSeries.some(
    (fetchedSerie) => fetchedSerie.id === movieObject.id
  ); */

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

  /* if (data.results.SE) {
      addProvidersOfMovieToDatabase(data.results.SE, id);

      return data.results.SE;
    } else if (!data.results.SE) {
      console.log("No providers in sweden for movie id ", id);
      addProvidersOfMovieToDatabase(0, id);

      return { noProviders: "no providers in sweden", id };
    } else {
      console.log("failed to fetch providers of movie from TMDB");
    } */
  //
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
}

const fetchPopularMovies = async () => {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${movieAPI_KEY}&language=en-US&page=1`
  );
  const data = await response.json();

  //postMovieToDatabase(data)

  return data.results;
};

app.get("/popularmovies", async (req, res) => {
  try {
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

        addMovieToDatabase(movie, "movie"); // doesnt add if already added

        // first check if movieproviders exists in our database
        let movieProvidersObject = getProvidersOfMOvieObjectOurDatabase(
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

        let isLiked = false;
        if (likedMoviesList && likedMoviesList.length > 0) {
          isLiked = likedMoviesList.some((likedMovie) => {
            return likedMovie.id === movie.id;
          });
        }

        let isInWatchList = false;
        if (movieWatchList && movieWatchList.length > 0) {
          isInWatchList = movieWatchList.some((watchListedMovie) => {
            return watchListedMovie.id === movie.id;
          });
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

async function getMixFromOurDatabaseOnlyIDs() {
  try {
    const response = await fetch(`${host}/dailymixbasedonlikes`, {
      // users sidan på backend! dvs inte riktiga sidan!
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      /*  body: JSON.stringify({
       
      }), */
    });

    const data = await response.json();
    if (data.mix && data.mix) {
      console.log(
        "fetched data.mix from backend: ",
        data.mix
        // setMixFromDatabaseOnlyIDs(data.mix)
      );

      return data.mix;
    } else {
      console.log(
        "failed to fetch data.mix from backend, or does not exist yet"
      );
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    //setFetchedMixWithIDsFromDatabase(true);
  }
}

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
}

// GET
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

function getProvidersOfMOvieObjectOurDatabase(id) {
  let searchResult;
  try {
    searchResult = fetchedProvidersOfMovie.find((movie) => {
      return id === movie.id;
    });
    //console.log("Movie-Search result: ", searchResult);

    if (searchResult == null) {
      console.log("providers not found in our database, returning null");
      return null;
    }

    //console.log("Series-Search result: ", searchResult);
  } catch (error) {
    console.error("Error finding providers of movie from our database", error);
    return res
      .status(500)
      .send("Error finding providers of movie from our database"); // exit code
  }

  return searchResult;
}

app.post("/addmovietodatabase", async (req, res) => {
  try {
    //console.log("/addmovietodatabase req.body: ", req.body);
    const { movie, movieOrSeries } = req.body;

    if (!movie.id || !movieOrSeries) {
      return res.status(400).json({
        error:
          "Received movie does not contain an id, and/or need to define if movie or series.",
      });
    }

    const idExistsInMovies = fetchedMovies.some(
      (fetchedMovie) => fetchedMovie.id === movie.id
    );
    const idExistsInSeries = fetchedSeries.some(
      (fetchedSerie) => fetchedSerie.id === movie.id
    );

    if (idExistsInMovies || idExistsInSeries) {
      console.log("movie/series ID ", movie.id, " has already been fetched.");
      return res.status(200).json({
        message: "Liked movie OR Liked series has already been fetched.",
      });
    } else {
      // om redan finns?
    }

    if (movieOrSeries === "movie") {
      // maybe change to some sort of True/False variable instead...
      fetchedMovies.push(movie); // UPDATE LATER TO SQL
      console.log("Added movie ID ", movie.id, " to fetchedMovies");
    } else if (movieOrSeries === "series") {
      fetchedSeries.push(movie); // UPDATE LATER TO SQL
      console.log("Added series ID ", movie.id, " to fetchedSeries");
    } else {
      console.log("Could not determine if movie or series");
    }

    res.status(201).json({
      message: "Movie/Series saved to fetchedMovies/fetchedSeries",
    });
  } catch (error) {
    console.error(
      "1:Error adding movie/series to fetchedMovie/fetchedSeries:",
      error
    );
    res.status(500).json({ error: "Internal server error" });
  }
});
let likedMoviesList = []; // TA BORT NÄR VI HAR FIXAT MYSQL
let likedSeriesList = []; // TA BORT NÄR VI HAR FIXAT MYSQL
let movieWatchList = []; // TA BORT NÄR VI HAR FIXAT MYSQL
let seriesWatchList = []; // TA BORT NÄR VI HAR FIXAT MYSQL
//let dailyMixBasedOnLikes = [];

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

// FOR US, if we want to see data here: http://localhost:3010/me/likelists
app.get("/me/likelists", (req, res) => {
  const data = {
    likedMoviesList: likedMoviesList,
    likedSeriesList: likedSeriesList,
  };

  res.json(data);
});

// FOR US, if we want to see data here: http://localhost:3010/me/watchlists
app.get("/me/watchlists", (req, res) => {
  const data = {
    movieWatchList: movieWatchList,
    seriesWatchList: seriesWatchList,
  };

  res.json(data);
});

// usually use both watchlist and likelist in movie cards...
app.get("/me/watchandlikelists", (req, res) => {
  const data = {
    movieWatchList: movieWatchList,
    likedMoviesList: likedMoviesList,
  };

  res.json(data);
});

app.post("/me/likelists/addtolikelist", async (req, res) => {
  try {
    const { id, movieOrSeries, title } = req.body;

    if (!id || !movieOrSeries || !title) {
      return res.status(400).json({
        error:
          "ID is required, and need to define if movie or series, and need movie title",
      });
    }

    const idExistsInMovies = likedMoviesList.some(
      (likedMovie) => likedMovie.id === id
    );
    const idExistsInSeries = likedSeriesList.some(
      (likedSeries) => likedSeries.id === id
    );

    if (idExistsInMovies || idExistsInSeries) {
      console.log("movie/series ID ", id, " is already liked.");
      return res
        .status(200)
        .json({ message: "Liked movie OR Liked series is already liked." });
    }

    if (movieOrSeries === "movie") {
      // maybe change to some sort of True/False variable instead...
      likedMoviesList.push({ id, title }); // UPDATE LATER TO SQL
      console.log(
        "Added movie ID ",
        id,
        "with name:",
        title,
        "to likedMoviesList"
      );
    }

    if (movieOrSeries === "series") {
      likedSeriesList.push({ id, title }); // UPDATE LATER TO SQL
      console.log("Added series ID ", id, " to likedSeriesList");
    }

    res.status(201).json({
      message: "Movie/Series saved to like list succesfully",
    });
  } catch (error) {
    console.error("1:Error adding like:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/me/likelists/removefromlikelist", async (req, res) => {
  try {
    const { id, movieOrSeries } = req.body;

    if (!id || !movieOrSeries) {
      return res
        .status(400)
        .json({ error: "Liked movie OR liked series is required." });
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
});

app.post("/me/watchlists/removefromwatchlist", async (req, res) => {
  try {
    const { id, movieOrSeries } = req.body;

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
    });
  } catch (error) {
    console.error("1:Error removing like:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/me/watchlists/addtowatchlist", async (req, res) => {
  try {
    const { id, movieOrSeries } = req.body;

    if (!id || !movieOrSeries) {
      return res
        .status(400)
        .json({ error: "Liked movie OR liked series is required." });
    }

    const idExistsInMovieWatchList = movieWatchList.some(
      (movie) => movie.id === id
    );
    const idExistsInSeriesWatchList = seriesWatchList.some(
      (series) => series.id === id
    );

    if (idExistsInMovieWatchList || idExistsInSeriesWatchList) {
      console.log("movie/series ID ", id, " is already saved in watchlist.");
      return res.status(200).json({
        message: "Liked movie OR Liked series is already in watchlist.",
      });
    }

    if (movieOrSeries === "movie") {
      // maybe change to some sort of True/False variable instead...
      movieWatchList.push({ id }); // UPDATE LATER TO SQL
      console.log("Added movie ID ", id, " to movieWatchList");
    }

    if (movieOrSeries === "series") {
      likedSeriesList.push({ id }); // UPDATE LATER TO SQL
      console.log("Added series ID ", id, " to seriesWatchList");
    }

    res.status(201).json({
      message: "Movie/Series saved to watch list succesfully",
    });
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

const latestSuggestions = [];
const latestUserQuery = [];

app.post("/moviesuggest2", async (req, res) => {
  const likedMovieTitles = likedMoviesList.map((movie) => {
    return movie.title;
  });

  console.log("likedMovieTitles: ", likedMovieTitles);

  const likedMovieTitlesString = likedMovieTitles.join(", ");
  console.log("likedMovieTitlesString: ", likedMovieTitlesString);
  const userQuery = req.body.query;
  latestUserQuery.push(userQuery);
  if (latestUserQuery.length > 15) {
    latestSuggestions.pop(); // tar bort den sista
  }
  console.log("Received user query:", userQuery);

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
It will not answer any other queries. It will only suggest movies and TV series. 
If the query is inappropriate (i.e., foul language or anything else), respond in a funny way. 
Always use this structure: MOVIE NAME1: [string], MOVIE NAME2: [string], 
MOVIE NAME3: [string], MOVIE NAME4: [string], MOVIE NAME5: [string], 
MOVIE NAME6: [string]. The suggested movie names should go inside [string]. 
Never add any additional numbers.

When making suggestions, follow these steps:
1. Review the latest user query: ${latestUserQuery}.
2. Examine the latest suggestions: ${latestSuggestions.join(", ")}.
3. Avoid suggesting movies that are already in the latest suggestions.
4. Avoid suggesting movies that are already in ${likedMovieTitlesString}.
5. Consider the genres, themes, or keywords from the latest user query to refine the search.
6. If a new user query suggests a refinement (e.g., from "action" to "comedy action"), adjust the suggestions accordingly.
7. If no suitable suggestions are available, explain why and provide alternative options.

For example, if the latest user query is "action comedy" and the latest suggestions included "Die Hard" and "Mad Max", suggest movies that blend action and comedy while avoiding those already suggested.

If you have no suggestions, explain in your response. Also, look inside ${latestSuggestions.join(
            ", "
          )} and ${latestUserQuery} and suggest movies based on the queries.`,
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

    // TODO: spara ner userQuery och suggestion i backend?

    console.log("Suggestion structure:", suggestion);
    console.log("suggested movie list:", latestSuggestions);

    const movieNames = parseMovieNames(suggestion);
    console.log("Movie names parsed: ", movieNames);

    if (movieNames.length === 6) {
      latestSuggestions.unshift(movieNames);
      if (latestSuggestions.length > 36) {
        latestSuggestions.pop(); // tar bort den sista
      }
      res.json({ movieNames });
    } else {
      res.json({ suggestion });
      console.error(
        "Failed to extract Movie Names from AI response:",
        suggestion
      );

      // res.status(500).json({
      //   error: "Failed to extract Movie Names from AI response",
      // });
    }
  } catch (error) {
    console.error("Error in /moviesuggest endpoint:", error);
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
app.get("/me/dailymixbasedonlikes", async (req, res) => {
  const mixOnlyIdsAndTitles = dailyMixes.dailyMixBasedOnLikes; // dont have to make copy? ... ?

  const mixMovieObjects = [];
  const mixMovieObjectsProviders = [];

  if (mixOnlyIdsAndTitles.length > 0) {
    mixOnlyIdsAndTitles.map((movie) => {
      const movieObjectOurDatabase = getMovieObjectOurDatabase(
        movie.id,
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
        getProvidersOfMOvieObjectOurDatabase(movie.id);

      if (movieObjectProvidersOurDatabase) {
        mixMovieObjectsProviders.push(movieObjectProvidersOurDatabase);
      } else {
        console.log("providers failed to fetch from our own database?");
      }
    });
  } else {
    return res.json({ message: "No mix generated yet." });
  }

  res.json({ mixMovieObjects, mixMovieObjectsProviders });
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

app.get("/generatedailymix2", async (req, res) => {
  // no user query needed, will be based on existing like list
  /* const userQuery = req.body.query;
    console.log("Received user query:", userQuery); */

  dailyMixes.dailyMixBasedOnLikes = []; // remove the previous dailyMixBasedOnLikes

  if (likedMoviesList.length === 0) {
    return res.json({
      messageNoLikedMovies:
        "You need to like some movies before I can generate a Mix for you!",
    });
  } else {
    /* console.log(""); */
  }

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

    let movieIds = [];

    // TODO: HÄR SKA VI LÄGGA IN ALLA END-POINTS SOM HANTERAR TMDB FETCHES OCH LAGRA I DATABASEN GREJER, därefter skickar vi det vi behöver till frontend?
    if (movieNames && movieNames.length === 6) {
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
            console.log("id of movieobject fetched: ", movieObject.id);
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
      console.log("all movie ids received from api: ", movieIds);

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
      movieObjects.map((movie) => {
        dailyMixes.dailyMixBasedOnLikes.push({
          id: movie.id,
          title: movie.title,
        });

        console.log(
          "Added movie ID ",
          movie.id,
          " with movie name: ",
          movie.title,
          " to dailyMixBasedOnLikes"
        );
      });
    } else {
      console.log("Failed pushing to dailymixbasedonlikes ");
    }

    const mixMovieObjects = [];
    const mixMovieObjectsProviders = [];

    // Here we fetch the movie object again, but from our own database (just to test), maybe some day we can remove the fetch TMDB above?
    movieObjects.map((movie) => {
      const movieObjectOurDatabase = getMovieObjectOurDatabase(
        movie.id,
        "movie"
      );
      // console.log("movieObject: ", movieObject);
      //setLoading(false);

      if (movieObjectOurDatabase) {
        mixMovieObjects.push(movieObjectOurDatabase);
      } else {
        console.log("movieObjectOurDatabase not populated?");
      }

      const providersObjectOurDatabase = getProvidersOfMOvieObjectOurDatabase(
        movie.id
      );

      if (providersObjectOurDatabase) {
        mixMovieObjectsProviders.push(providersObjectOurDatabase);
      } else {
        console.log("providersObjectOurDatabase not populated?");
      }
    });

    //if (movieNames && reasoning) {
    if (mixMovieObjects && mixMovieObjectsProviders) {
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

    addMovieToDatabase(movieData, "movie");

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

    console.log("providers are:", providers);

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

///////////////////////////////////////////////////

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Temporarily storing seen movies
let seenMoviesList = [];
//endpoint to add a movie to the seen list
app.post("/me/seenlists/addtoseenlist", async (req, res) => {
  try {
    const { id, title } = req.body;

    if (!id || !title) {
      return res
        .status(400)
        .json({ error: "Movie ID and title are required." });
    }

    const idExistsInSeen = seenMoviesList.some(
      (seenMovie) => seenMovie.id === id
    );

    if (idExistsInSeen) {
      return res
        .status(200)
        .json({ message: "Movie is already in seen list." });
    }

    seenMoviesList.push({ id, title });
    console.log(`Added movie ID ${id} with title "${title}" to seen list`);

    res.status(201).json({ message: "Movie added to seen list successfully" });
  } catch (error) {
    console.error("Error adding movie to seen list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//remove a movie from the seen list
app.post("/me/seenlists/removefromseenlist", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Movie ID is required." });
    }

    seenMoviesList = seenMoviesList.filter((movie) => movie.id !== id);
    console.log(`Removed movie ID ${id} from seen list`);

    res.status(200).json({ message: "Movie removed from seen list successfully" });
  } catch (error) {
    console.error("Error removing movie from seen list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


//retrieve the seen movies list
app.get("/me/seenlists", (req, res) => {
  res.status(200).json({
    message: "Seen movies list retrieved successfully",
    seenMoviesList: seenMoviesList,
  });
});
