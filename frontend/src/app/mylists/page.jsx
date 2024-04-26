"use client"
import { useEffect, useState } from "react";
import { host } from "../utils";

export default function MyLists(){

  const [likedMoviesList, setLikedMoviesList] = useState(null);
  const [likedSeriesList, setLikedSeriesList] = useState(null);

  useEffect(() => {
    postAccount();
  }, [])

  async function postAccount() {
    // fetch the saldo  once when entering the page
    try {
      //const tokenStorage = localStorage.getItem("token");
      //setToken(tokenStorage);
      /* console.log(
        "fetched localStorage token for Account data: ",
        tokenStorage
      ); */
      const response = await fetch(`${host}/me/lists`, {
        // users sidan på backend! dvs inte riktiga sidan!
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          //token: tokenStorage, // "backend får in detta som en "request" i "body"... se server.js när vi skriver t.ex. const data = req.body "
        }),
      });

      const data = await response.json();
      if (data.likedMoviesList && data.likedSeriesList) {

        console.log(
          "fetched data.likedMoviesList: ",
          data.likedMoviesList,
          " and fetched data.likedSeriesList: ",
          data.likedSeriesList
        );
        setLikedMoviesList(data.likedMoviesList);
        setLikedSeriesList(data.likedSeriesList);
      }
     
     
    } catch (error) {
      console.error("Error:", error);
    }
  }

  if (likedMoviesList == null || likedSeriesList == null) {
    return <div>Loading lists...</div>
  }

  return (
    <div>
      LISTS
      <ul>
        {likedMoviesList.map((likedMovies, index) => {
          return (
            <li key={index}>ID: {likedMovies.id}</li>
          )
        })}
        </ul>
      



    </div>
  )
}

