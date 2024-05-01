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
    console.log("/addmovietodatabase req.body: ", req.body);
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
      console.log("Added movie ID ", id, " to likedMoviesList");
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
  const userQuery = req.body.query;
  console.log("Received user query:", userQuery);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "This assistant will suggest 3 movies based on user descriptions.  Additionally, it will provide Movie Names for those movies in the format of: MOVIE NAME1: [string], MOVIE NAME2: [string], MOVIE NAME3: [string]. It will not answer any other queries. It will only suggest movies. It will only suggest movies and tv series. Always use this structure: MOVIE NAME1: [string], MOVIE NAME2: [string], MOVIE NAME3: [string]. The suggested movie names should go inside [string]. Never add any additional numbers.",
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
    console.log("Suggestion structure:", suggestion);
    const movieNames = parseMovieNames(suggestion);
    console.log("Movie names parsed: ", movieNames);

    // Since TMDB ID handling and additional logic are commented out, I will leave them out for clarity.
    if (movieNames.length === 3) {
      res.json({ movieNames });
    } else {
      console.error(
        "Failed to extract Movie Names from AI response:",
        suggestion
      );
      res.status(500).json({
        error: "Failed to extract Movie Names from AI response",
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

app.get("/dailymix", async (req, res) => {
  // no user query needed, will be based on existing like list
  /* const userQuery = req.body.query;
    console.log("Received user query:", userQuery); */

  const likedMovieTitles = likedMoviesList.map((movie) => {
    return movie.title;
  });

  console.log("likedMovieTitles: ", likedMovieTitles);

  const likedMovieTitlesString = likedMovieTitles.join(", ");
  console.log("likedMovieTitlesString: ", likedMovieTitlesString);

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
    console.log("suggestion: ", suggestion);

    if (suggestion) {
      res.json({ suggestion });
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

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${port}`);
});

//It will also provide a TMDB id for each movie in the format of: TMDB ID: [number].
