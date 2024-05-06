"use client";

import { useEffect, useState } from "react";
import { host } from "../utils";

export default function DailyMix() {
  const [moviesAndReasoning, setMoviesAndReasoning] = useState({});
  //const [buttonClicked, setButtonClicked] = useState(false);

  const [loading, setLoading] = useState(false);
/* 
  useEffect(() => {

    handleQuerySubmit();

  }, [buttonClicked])
 */
  const handleQuerySubmit = async () => {
    setLoading(true);


    try {
      const response = await fetch(`${host}/generatedailymix`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        //body: JSON.stringify({ }),
      });
      const data = await response.json(); // ändra i server.js så att chatgpt bara returnerar movie name, och sen kan vi göra en query för TMDB ID (se första useEffecten i firstpage/page.js)
      if (data.movieNames) {
        setMoviesAndReasoning({
          titles: data.movieNames,
          //reasoning: data.reasoning, // TODO: add reasoning again when it works
        });
        // setChatGPTFetched(true);
      } else {
        setLoading(false);
        console.error("No suggestion in response");
      }
    } catch (error) {
      console.error("Failed to fetch AI suggestion:", error);
    } finally {
      setLoading(false)

    }
    // setLoading(false);
    //setLoading(false);

  };


  // TODO: fetch movie details, ID most importantly, and then create an array of movie objects (title, id) and send that to postAddToDailyMix

  



  if (loading) {
    return <div>Loading Weekly mix...</div>;
  }

  return (
    <div>
      <h1>DAILY MIX</h1>
      <button
        className={`h-12 bg-slate-400 text-slate-900 w-full md:w-1/3 rounded-full md:mt-0 mt-5 font-semibold text-xl`}
        onClick={() => {
         // setButtonClicked(true)
          handleQuerySubmit();
        }}
        //disabled={!input}
      >
        Generate Weekly mix
      </button>

      <div>
       {/*   <p> {movieDetails.suggestion ? ( <p>{movieDetails.suggestion}</p>) : ("No titles generated") } </p> */}
       <div>{moviesAndReasoning.titles ? (<p>{moviesAndReasoning.titles}</p>) : ("No titles generated")}</div>
      </div>
    </div>
  );
}
