"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SlideMenu from "@/app/components/SlideMenu";
import { SlArrowLeft } from "react-icons/sl";
import { FaPlus, FaRegHeart, FaHeart, FaCheck, FaStar } from "react-icons/fa";
import Link from "next/link";

export default function ActorPage() {
  const [loading, setLoading] = useState(true);
  const [movieDetails, setMovieDetails] = useState([]);
  const [actorDetails, setActorDetails] = useState([]);
  const [toggleExpanded, setToggleExpanded] = useState(false);

  const movieAPI_KEY = "4e3dec59ad00fa8b9d1f457e55f8d473";

  const params = useParams();
  const personId = params.personId;
  const router = useRouter();

  console.log("personId:", personId);

  //   useEffect(() => {
  //     async function fetchMoviePageDetails(personId) {
  //       if (!personId) {
  //         console.error("Missing required parameter: personId");
  //         return;
  //       }

  //       try {
  //         const response = await fetch(
  //           "http://localhost:3010/fetchingmoviepagedetails",
  //           {
  //             method: "POST",
  //             headers: {
  //               "Content-Type": "application/json",
  //             },
  //             body: JSON.stringify({ personId }),
  //           }
  //         );
  //         const data = await response.json();

  //         console.log("fetched data:", data);

  //         if (data.error) {
  //           console.error(data.error);
  //         } else {
  //           setMovieDetails(data.movieDetails);
  //           setCredits(data.movieDetails.credits);
  //           setVideos(data.movieDetails.videoKey);
  //           console.log(
  //             "data.movidetails.videokey is:",
  //             data.movieDetails.videoKey
  //           );
  //           setSimilar(data.movieDetails.similarMovies);
  //           console.log("similar movies are:", similar);
  //           //   console.log("actorImages:", actorImages);
  //           setActorImages(
  //             data.movieDetails.credits.actors.reduce((acc, actor) => {
  //               acc[actor.personId] = actor.imagePath;
  //               return acc;
  //             }, {})
  //           );
  //         }
  //       } catch (error) {
  //         console.error("Error fetching movie page details:", error);
  //       } finally {
  //         setLoading(false);
  //       }
  //     }

  //     fetchMoviePageDetails(personId);
  //   }, [personId]);

  const handleNavigation = () => {
    router.back();
  };

  function handleToggle() {
    setToggleExpanded(!toggleExpanded);
  }

  useEffect(() => {
    async function getActorDetails() {
      if (!personId) {
        console.log("Missing parameter personId");
      }

      try {
        const moviesResponse = await fetch(
          `https://api.themoviedb.org/3/person/${personId}/movie_credits?api_key=${movieAPI_KEY}`
        );
        const actorsResponse = await fetch(
          `https://api.themoviedb.org/3/person/${personId}?api_key=${movieAPI_KEY}`
        );

        const moviesData = await moviesResponse.json();
        console.log("data is:", moviesData);

        const dataPersonInfo = await actorsResponse.json();
        console.log("person info is:", dataPersonInfo);

        const actorName = dataPersonInfo.name;
        setActorDetails({
          name: actorName,
          profilePath: dataPersonInfo.profile_path,
          biography: dataPersonInfo.biography,
        });
        //sorterar efter bäst film först
        const sortedMovies = moviesData.cast.sort(
          (a, b) => b.vote_average - a.vote_average
        );
        setMovieDetails(sortedMovies);
      } catch (error) {
        console.error("Error fetching actor page details:", error);
      }
    }
    getActorDetails();
  }, [personId]);

  useEffect(() => {
    console.log("actorDetails updated:", actorDetails);
  }, [actorDetails]);

  return (
    <div className="">
      <button
        className="bg-transparent border-none absolute top-0 left-0 m-8 px-4 py-2 z-10 text-slate-100 text-xl hover:cursor-pointer"
        onClick={handleNavigation}
      >
        <SlArrowLeft />
      </button>
      <div className="flex flex-col  justify-center items-center w-full py-10">
        <h2 className="text-2xl pb-8">{actorDetails.name}</h2>
        <div className="w-60 h-60 rounded-full overflow-hidden bg-gray-300 ">
          <img
            src={`https://image.tmdb.org/t/p/w500${actorDetails.profilePath}`}
            alt={"actor"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "path_to_default_image.jpg";
            }}
          />
        </div>
        <div className="h-full pt-8 px-8" onClick={handleToggle}>
          {!toggleExpanded ? (
            <div
              className={`md:w-full text-base font-light  ${
                !toggleExpanded ? "fade-out" : ""
              }`}
            >
              {actorDetails.biography
                ? actorDetails.biography.slice(0, 200)
                : ""}
              ...
            </div>
          ) : (
            <div className="md:w-full font-light text-base">
              {actorDetails.biography
                ? actorDetails.biography.slice(0, 600)
                : ""}
            </div>
          )}
        </div>
      </div>
      <div className="py-16 bg-[#1B1725]">
        <h2 className="pb-8 px-8">STARRING IN</h2>
        <SlideMenu>
          {movieDetails.map((movie, index) => {
            return (
              <div key={index} className="px-8 inline-block w-34">
                <Link href={`/movie/${encodeURIComponent(movie.id)}`}>
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={"poster"}
                    style={{ border: "0.5px solid grey" }}
                    className="h-80 rounded-xl hover:cursor-pointer"
                    onError={(e) => {
                      e.target.onerror = null; // Prevent looping
                      e.target.src = "path_to_default_image.jpg"; // Fallback image
                    }}
                  />
                </Link>
                <div className="flex flex-col justify-start items-start">
                  <h2 className="text-sm font-semibold  text-slate-50 w-34 ">
                    {movie.title}
                  </h2>
                  {/* <p>{actor.character}</p> */}
                  <p className="font-semibold  flex justify-center items-center">
                    <span className={`mr-2  font-normal  text-yellow-400`}>
                      <FaStar />
                    </span>
                    <span
                      className={`${
                        movie.vote_average === 0 ? "text-sm" : "text-xl"
                      } text-zinc-100`}
                    >
                      {movie.vote_average === 0
                        ? "NO RATING AVAILABLE"
                        : movie.vote_average.toFixed(1)}
                    </span>
                  </p>{" "}
                </div>
              </div>
            );
          })}
        </SlideMenu>
      </div>
    </div>
  );
}
