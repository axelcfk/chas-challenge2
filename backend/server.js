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
  //host: "mysql",
  host: "localhost",
  user: "root",
  password: "root",
  database: "health-app",
  port: 3306,
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

function parseTMDBId(response) {
  //Regex för att få TMDB ID baserat på "TMDB ID: {number}"
  const match = response.match(/TMDB ID:\s*(\d+)/);
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
            "This assistant will suggest movies based on user descriptions. It will also provide a TMDB id for that movie in the format of: TMDB ID: [number]. It will not answer any other questions. It will only suggest movies.",
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

    if (tmdbId) {
      res.json({ tmdbId });
    } else {
      console.error("Failed to extract TMDB ID from AI response:", suggestion);
      res
        .status(500)
        .json({ error: "Failed to extract TMDB ID from AI response" });
    }
  } catch (error) {
    console.error("Error in /moviesuggest endpoint:", error);
    res.status(500).json({
      error: "Unable to process the movie suggestion at this time.",
      details: error.message,
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${port}`);
});
