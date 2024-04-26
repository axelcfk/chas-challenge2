export const host = "http://localhost:3010";

export async function postAddToLikeList(id, movieOrSeries) {
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
        movieOrSeries: movieOrSeries
      }),
    });
    
  } catch (error) {
    console.error("Error posting like to backend:", error);
  }
}


export async function postAddToWatchList(id, movieOrSeries) {
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
        movieOrSeries: movieOrSeries
      }),
    });
    
  } catch (error) {
    console.error("Error posting like to backend:", error);
  }
}

