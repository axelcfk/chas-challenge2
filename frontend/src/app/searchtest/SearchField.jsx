import React, { useState, useEffect } from "react";

function MovieSearch() {
  const [inputValue, setInputValue] = useState("");
  const [movies, setMovies] = useState([]);

  const movieAPI_KEY = "a97f158a2149d8f803423ee01dec4d83";

  useEffect(() => {
    if (movieAPI_KEY != null && loading && movieDetails.titleFromGPT) {
      console.log("title received from GPT: ", movieDetails.titleFromGPT);
      const encodedMovieTitle = encodeURIComponent(movieDetails.titleFromGPT);
      console.log("encoded movie title: ", encodedMovieTitle);

      fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodedMovieTitle}&api_key=${movieAPI_KEY}`
      )
        .then((response) => response.json())
        .then((data) => {
          console.log("id from API: ", data.results[0].id);

          setMovieDetails({
            ...movieDetails,
            idFromAPI: data.results[0].id,
          });
        })
        .catch((error) => console.error("Error fetching data:", error));
    }
  }, [movieDetails.titleFromGPT]);

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${inputValue}&api_key=${movieAPI_KEY}`
      );
      const data = await response.json();
      setMovies(data.results);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder="Search for a movie..."
        />
        <button type="submit">Search</button>
      </form>
      <ul>
        {movies.map((movie) => (
          <li key={movie.id}>{movie.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default MovieSearch;
