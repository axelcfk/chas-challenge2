"use client";

import { useState } from "react";
import { host } from "../utils";

export default function DailyMix() {
  const [movieDetails, setMovieDetails] = useState({});

  const [loading, setLoading] = useState(false);

  const handleQuerySubmit = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${host}/dailymix`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        //body: JSON.stringify({ }),
      });
      const data = await response.json(); // ändra i server.js så att chatgpt bara returnerar movie name, och sen kan vi göra en query för TMDB ID (se första useEffecten i firstpage/page.js)
      if (data.suggestion) {
        setMovieDetails({
          suggestion: data.suggestion,
        });
        // setChatGPTFetched(true);
      } else {
        setLoading(false);
        console.error("No suggestion in response");
      }
    } catch (error) {
      console.error("Failed to fetch AI suggestion:", error);
    } finally {
      setLoading(false);
    }
    // setLoading(false);
  };

  if (loading) {
    return <div>Loading daily mix...</div>;
  }

  return (
    <div>
      <h1>DAILY MIX</h1>
      <button
        className={`h-12 bg-slate-400 text-slate-900 w-full md:w-1/3 rounded-full md:mt-0 mt-5 font-semibold text-xl`}
        onClick={handleQuerySubmit}
        //disabled={!input}
      >
        Generate daily mix
      </button>

      <div>
         <p> {movieDetails.suggestion ? ( <p>{movieDetails.suggestion}</p>) : ("No titles generated") } </p>
      </div>
    </div>
  );
}
