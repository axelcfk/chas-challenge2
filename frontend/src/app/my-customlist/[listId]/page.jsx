"use client";

import { useState, useEffect } from "react";
import "./my-customlist.css";
import { useParams } from "next/navigation";
import { fetchTMDBMovieDetails } from "@/app/utils";
import SlideMenu, { SlideMenuMovieCard } from "@/app/components/SlideMenu";

export default function MyCustomList() {
  const [loadingLists, setLoadingLists] = useState(true);
  const [movies, setMovies] = useState([]);
  const [listName, setListName] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const params = useParams();
  const { listId } = params;

  useEffect(() => {
    const fetchListDetails = async () => {
      setLoadingLists(true);
      try {
        const response = await fetch(
          `http://16.171.5.238:3010/me/lists/${listId}`
        );
        const data = await response.json();

        const moviesWithDetails = await Promise.all(
          data.movies.map(async (movieId) => {
            const movie = await fetchTMDBMovieDetails(movieId);
            return {
              id: movie.id,
              title: movie.title,
              overview: movie.overview,
              poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            };
          })
        );
        setMovies(moviesWithDetails);
        // list namnet hämtas från datan (listname är namnet)
        setListName(data.name);
        console.log("Fetched list details:", moviesWithDetails);
      } catch (error) {
        console.error("Failed to fetch list details", error);
      } finally {
        setLoadingLists(false);
      }
    };

    fetchListDetails();
  }, [listId]);

  const handleOpenMenu = (movieId) => {
    setOpenMenu(openMenu === movieId ? null : movieId);
  };

  const handleRemoveFromList = (movieId) => {
    console.log(`Remove movie ${movieId} from list ${listId}`);
    // (anropa backend)
  };

  return (
    <div className="my-customlist-container bg-[#110A1A]">
      <div></div>
      <h1 className="mt-14 mb-6 flex justify-center font-archivo">{listName}</h1>
      {loadingLists ? (
        <p>Loading movies...</p>
      ) : (
        <SlideMenu>
          {movies.map((movie) => (
            <div key={movie.id} className="movie-card">
              <SlideMenuMovieCard
                id={movie.id}
                title={movie.title}
                poster={movie.poster}
                overview={movie.overview}
              />
              <button
                onClick={() => handleOpenMenu(movie.id)}
                className="menu-button"
              >
                ☰
              </button>
              {openMenu === movie.id && (
                <div className="menu-dropdown">
                  <ul>
                    <li>
                      <button onClick={() => handleRemoveFromList(movie.id)}>
                        Remove from list
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ))}
        </SlideMenu>
      )}
    </div>
  );
}

