export const host = "http://localhost:3010";

export async function postAddToLikeList(id, movieOrSeries, title) {
  try {
    //const response = await fetch("http://localhost:4000/sessions", {
    const response = await fetch(`${host}/me/likelists/addtolikelist`, {
      // users sidan på backend! dvs inte riktiga sidan!
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        title: title,
        movieOrSeries: movieOrSeries,
      }),
    });
  } catch (error) {
    console.error("Error posting like to backend:", error);
  }
}

export async function postRemoveFromLikeList(id, movieOrSeries, title) {
  try {
    //const response = await fetch("http://localhost:4000/sessions", {
    const response = await fetch(`${host}/me/likelists/removefromlikelist`, {
      // users sidan på backend! dvs inte riktiga sidan!
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        movieOrSeries: movieOrSeries,
        title: title,
      }),
    });
  } catch (error) {
    console.error("Error posting like to backend:", error);
  }
}

export async function postAddToWatchList(id, movieOrSeries, title) {
  try {
    //const response = await fetch("http://localhost:4000/sessions", {
    const response = await fetch(`${host}/me/watchlists/addtowatchlist`, {
      // users sidan på backend! dvs inte riktiga sidan!
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        movieOrSeries: movieOrSeries,
        title: title,
      }),
    });
  } catch (error) {
    console.error("Error posting like to backend:", error);
  }
}

//Remove from watchlist

export async function postRemoveFromWatchList(id, movieOrSeries, title) {
  try {
    //const response = await fetch("http://localhost:4000/sessions", {
    const response = await fetch(`${host}/me/watchlists/removefromwatchlist`, {
      // users sidan på backend! dvs inte riktiga sidan!
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        movieOrSeries: movieOrSeries,
        title: title,
      }),
    });
  } catch (error) {
    console.error("Error posting like to backend:", error);
  }
}

// from our database!!!!!!!!!!! (not api)
export async function fetchMovieObject(id) {
  //console.log("Fetching movie details from backend for ID:", id);

  const response = await fetch(`${host}/movieobject`, {
    // users sidan på backend! dvs inte riktiga sidan!
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      movieID: id,
      movieOrSeries: "movie",
    }),
  });

  /* if (!response.ok) {
    throw new Error("Failed to fetch '/movieobject' GET");
  } */

  const data = await response.json();
  //console.log("data.searchResult: ", data.searchResult);

  return data.searchResult; // RETURNERAR MOVIE-OBJEKTET
}

// api.js
export async function postMovieToDatabase(movieObject) {
  try {
    const responseBackend = await fetch(`${host}/addmovietodatabase`, {
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



export async function postMovieProvidersToDatabase(movieProvidersObject, movieId) {
  try {
    const responseBackend = await fetch(`${host}/addmovieproviderstodatabase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        movieProvidersObject: movieProvidersObject,
        movieId: movieId,
      }),
    });

    if (!responseBackend.ok) {
      throw new Error("Failed to fetch 'addmovieproviderstodatabase' POST");
    }

    return true; // Indicate success if the request was successful
  } catch (error) {
    console.error("Error posting movie-providers object to database: ", error);
    return false; // Indicate failure if an error occurred,  not used atm???
  }
}

export async function checkLikeList() {
  try {
    const data = await fetch(`${host}/me/likelists`, {
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
