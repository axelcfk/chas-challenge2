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

const movieAPI_KEY = "4e3dec59ad00fa8b9d1f457e55f8d473";

// connect to DB
const pool = mysql.createPool({
  // host: "mysql",
  host: "localhost",
  user: "root",
  password: "root",
  database: "movie-app",
  port: 8889 || 3306,
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

const fetchedMovies = []; // TA BORT NÄR VI HAR FIXAT MYSQL
const fetchedSeries = []; // TA BORT NÄR VI HAR FIXAT MYSQL

// BARA FÖR ATT SE VAD SOM HAR SPARATS, VI SKA INTE ANVÄNDA DENNA
app.get("/allfetchedmoviesorseries", async (req, res) => {
  res.status(200).json({
    message: "GET data for /allfetchedmoviesorseries: ",
    fetchedMovies: fetchedMovies,
    fetchedSeries: fetchedSeries,
  });
});

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
let dailyMixes = { dailyMixBasedOnLikes: [] };

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
      likedMoviesList = likedMoviesList.filter((movie) => movie.id !== id);
      console.log("Removed movie ID ", id, " from WatchMoviesList");
    }

    if (movieOrSeries === "series") {
      likedSeriesList = likedSeriesList.filter((serie) => serie.id !== id);
      console.log("Removed series ID ", id, " from WatchSeriesList");
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

app.post("/moviesuggest2", async (req, res) => {
  const likedMovieTitles = likedMoviesList.map((movie) => {
    return movie.title;
  });

  console.log("likedMovieTitles: ", likedMovieTitles);

  const likedMovieTitlesString = likedMovieTitles.join(", ");
  console.log("likedMovieTitlesString: ", likedMovieTitlesString);
  const userQuery = req.body.query;
  console.log("Received user query:", userQuery);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "This assistant will suggest 6 movies based on user descriptions. Additionally, it will provide Movie Names for those movies in the format of: MOVIE NAME1: [string], MOVIE NAME2: [string], MOVIE NAME3: [string], MOVIE NAME4: [string], MOVIE NAME5: [string], MOVIE NAME6: [string]. It will not answer any other queries. It will only suggest movies. It will only suggest movies and tv series. If the query is inapropriate (i.e foul language or anything else) respond in a funny way. Always use this structure: MOVIE NAME1: [string], MOVIE NAME2: [string], MOVIE NAME3: [string], MOVIE NAME4: [string], MOVIE NAME5: [string], MOVIE NAME6: [string]. The suggested movie names should go inside [string]. Never add any additional numbers. If the movie name already exists in" +
            likedMovieTitlesString +
            "it will not be suggested. If you have no suggestions explain in your response.",
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
    const movieNames = parseMovieNames(suggestion);
    console.log("Movie names parsed: ", movieNames);

    // Since TMDB ID handling and additional logic are commented out, I will leave them out for clarity.
    if (movieNames.length === 6) {
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
      model: "gpt-3.5-turbo",
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

const videos = [];
const actorImages = [];
const movieDetails = [];
const credits = [];

console.log("moviedetails on backend is:", movieDetails);

// async function fetchVideo() {
//   try {
//     const response = await fetch(
//       `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${movieAPI_KEY}`
//     );

//     const data = await response.json();
//     console.log("videodata:", data.results[0].key);
//     videos.push(data.results[1].key);
//     return data.results;
//   } catch (error) {
//     console.error("Error fetching streaming services:", error);
//     return {};
//   }
// }

// const fetchActorsImages = async (actors) => {
//   const imageFetchPromises = actors.map((actor) =>
//     fetch(
//       `https://api.themoviedb.org/3/person/${actor.id}/images?api_key=${movieAPI_KEY}`
//     )
//       .then((response) => response.json())
//       .then((data) => ({
//         id: actor.id,
//         image:
//           data.profiles && data.profiles[0] ? data.profiles[0].file_path : null,
//       }))
//       .catch((error) => {
//         console.error(`Error fetching images for actor ID ${actor.id}:`, error);
//         return { id: actor.id, image: null };
//       })
//   );

//   try {
//     const imagesResults = await Promise.all(imageFetchPromises);
//     return imagesResults.reduce((acc, result) => {
//       acc[result.id] = result.image;
//       return acc;
//     }, {});
//   } catch (error) {
//     console.error("Error fetching actor images:", error);
//     return {};
//   }
// };

// const fetchMovieDetails = async (movieId) => {
//   if (!movieId) return null;

//   try {
//     const response = await fetch(
//       `https://api.themoviedb.org/3/movie/${movieId}?api_key=${movieAPI_KEY}`
//     );
//     const data = await response.json();

//     const creditsResponse = await fetch(
//       `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${movieAPI_KEY}`
//     );
//     const creditsData = await creditsResponse.json();

//     const actors = creditsData.cast.slice(0, 6).map((actor) => ({
//       name: actor.name,
//       personId: actor.id,
//       character: actor.character,
//       imagePath: actor.profile_path, // Assuming direct path is available; adjust based on API
//     }));

//     const actorImages = await fetchActorsImages(actors);

//     const movieDetails = {
//       id: data.id,
//       title: data.title,
//       overview: data.overview,
//       voteAverage: data.vote_average,
//       release: data.release_date,
//       tagline: data.tagline,
//       runtime: data.runtime,
//       backdrop: `https://image.tmdb.org/t/p/w500${data.backdrop_path}`,
//       poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
//       credits: {
//         director: creditsData.crew.find((person) => person.job === "Director")
//           ?.name,
//         actors: actors.map((actor) => ({
//           ...actor,
//           imagePath: actorImages[actor.personId],
//         })),
//         otherCrew: creditsData.crew
//           .filter((person) =>
//             ["Producer", "Screenplay", "Music"].includes(person.job)
//           )
//           .map((crew) => ({ name: crew.name, job: crew.job })),
//       },
//     };

//     return movieDetails;
//   } catch (error) {
//     console.error("Error fetching movie details:", error);
//     return null;
//   }
// };

// Define `fetchCompleteMovieDetails` function

const baseImageUrl = "https://image.tmdb.org/t/p/w500";

const fetchCompleteMovieDetails = async (movieId) => {
  if (!movieId) return null;

  try {
    const [movieResponse, creditsResponse, videosResponse, similarResponse] =
      await Promise.all([
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
      ]);

    const [movieData, creditsData, videosData, similarData] = await Promise.all(
      [
        movieResponse.json(),
        creditsResponse.json(),
        videosResponse.json(),
        similarResponse.json(),
      ]
    );

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

    const movieDetails = {
      id: movieData.id,
      title: movieData.title,
      overview: movieData.overview,
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
    const { movieId } = req.body;

    if (!movieId) {
      return res
        .status(400)
        .json({ error: "Missing required parameter: movieId" });
    }

    const movieDetails = await fetchCompleteMovieDetails(movieId);

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

///////////////////////////////////////////////////

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${port}`);
});
