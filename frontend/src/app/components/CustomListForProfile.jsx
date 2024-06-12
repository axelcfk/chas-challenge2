import { useEffect, useState } from "react";
import { fetchMovieObject, host } from "../utils";
import MovieCardWatchAndLike from "./MovieCardWatchAndLike";

export default function CustomListForProfile() {
  const [userLists, setUserLists] = useState([]);
  const [listsFetched, setListsFetched] = useState(false);
  const [listDetails, setListDetails] = useState([]);

  useEffect(() => {
    fetchUserLists();
  }, []);

  async function fetchUserLists() {
    try {
      const response = await fetch(`${host}:3010/me/lists`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (data && data.length > 0) {
        console.log("Fetched user lists:", data);
        setUserLists(data);
      } else {
        console.log("No lists found or failed to fetch lists");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setListsFetched(true);
    }
  }

  useEffect(() => {
    if (listsFetched && userLists.length > 0) {
      const fetchMovieDetails = async () => {
        const allListDetails = await Promise.all(
          userLists.map(async (list) => {
            const movieDetails = await Promise.all(
              list.movies.map(async (movieId) => {
                const movieObject = await fetchMovieObject(movieId);
                console.log("movieObject: ", movieObject);

                if (movieObject.title) {
                  return {
                    id: movieObject.id,
                    title: movieObject.title,
                    overview: movieObject.overview,
                    voteAverage: movieObject.vote_average,
                    release: movieObject.release_date,
                    tagline: movieObject.tagline,
                    runtime: movieObject.runtime,
                    backdrop: `https://image.tmdb.org/t/p/w500${movieObject.backdrop_path}`,
                    poster: `https://image.tmdb.org/t/p/w500${movieObject.poster_path}`,
                  };
                } else {
                  console.log("data.title does not exist?");
                  return null;
                }
              })
            );

            return {
              listName: list.name,
              movies: movieDetails.filter((detail) => detail !== null),
            };
          })
        );
        setListDetails(allListDetails);
      };
      fetchMovieDetails();
    }
  }, [listsFetched, userLists]);

  if (!listsFetched) {
    return <div>Loading lists...</div>;
  }

  return (
    <>
      {listDetails.length > 0 ? (
        <div>
          {listDetails.map((list, index) => (
            <div key={index} className="my-4">
              <h4 className="text-lg font-bold">{list.listName}</h4>
              {list.movies.length === 0 ? (
                <p>No movies in this list</p>
              ) : (
                <div className="grid-container mt-4">
                  {list.movies.map((movie, idx) => (
                    <MovieCardWatchAndLike
                      key={idx}
                      voteAverage={movie.voteAverage}
                      isLiked={false}
                      isInWatchList={false}
                      id={movie.id}
                      title={movie.title}
                      poster={movie.poster}
                      overview={movie.overview}
                      showRating={false}
                      profilePage={true}
                      className="movie-card"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div>No lists available</div>
      )}
    </>
  );
}
