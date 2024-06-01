import { useState, useEffect } from "react";

const autoQueryList = [
  "I want movies that are heartwarming",
  "Recommend movies with epic battles",
  "I need movies for a rainy day",
  "I'm in the mood for war movies",
  "I want movies with clever plots",
  "Recommend movies with intense drama",
  "I need movies to inspire creativity",
  "I'm in the mood for heist movies",
  "I want movies with unforgettable performances",
  "I need movies that challenge my mind",
  "Recommend movies with a nostalgic feel",
  "I want movies with gripping mysteries",
  "I'm in the mood for courtroom dramas",
  "I need movies that are family-friendly",
  "I want movies with dark humor",
  "Recommend movies with strong friendships",
  "I need movies that are mind-bending",
  "I'm in the mood for classic comedies",
  "I want movies with heart-pounding action",
  "I need movies that are visually stunning",
  "Recommend movies with a twist ending",
  "I want movies with historical accuracy",
  "I'm in the mood for movies about space",
  "I need movies that are intellectually stimulating",
  "I want movies with intense suspense",
  "Recommend movies with beautiful landscapes",
  "I need movies that are emotionally powerful",
  "I want movies with unique animation styles",
  "I'm in the mood for dystopian movies",
  "I need movies that are light and fun",
  "Recommend movies with strong villains",
  "I want movies with underdog stories",
  "I'm in the mood for survival movies",
  "I need movies with complex storylines",
  "I want movies with uplifting messages",
  "Recommend movies with supernatural elements",
  "I need movies that are critically acclaimed",
  "I want movies with iconic soundtracks",
  "I'm in the mood for political dramas",
  "I need movies with a lot of plot twists",
  "I want movies with epic adventures",
  "Recommend movies with strong leads",
  "I need movies with feel-good vibes",
  "I'm in the mood for spy thrillers",
  "I want movies with alien invasions",
  "Recommend movies with time travel",
  "I need movies with epic romances",
  "I'm in the mood for musical films",
  "I want movies with plot twists",
  "Recommend movies with gangsters",
  "I need movies with clever heists",
  "I'm in the mood for cult classics",
  "I want movies with true stories",
  "Recommend movies with road trips",
  "I need movies with magic realism",
  "I'm in the mood for zombie flicks",
  "I want movies with martial arts",
  "Recommend movies with sports drama",
  "I need movies with epic journeys",
  "I'm in the mood for spy comedies",
  "I want movies with visual poetry",
  "Recommend movies with rock bands",
  "I need movies with fairy tales",
  "I'm in the mood for ghost stories",
  "I want movies with animal heroes",
  "Recommend movies with ancient myths",
  "I need movies with teen romance",
  "I'm in the mood for horror films",
  "I want movies with ancient epics",
  "Recommend movies with robot wars",
  "I need movies with bank heists",
  "I'm in the mood for pirate tales",
  "I want movies with urban legends",
  "Recommend movies with royal drama",
  "I need movies with jazz music",
  "I'm in the mood for nature films",
  "I want movies with haunted houses",
  "Recommend movies with cooking shows",
  "I need movies with folklore tales",
];

const shuffleArray = (array) => {
  let shuffledArray = array.slice(); // Create a copy of the array
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

export default function AutoQuery({ input, setInput }) {
  // const [input, setInput] = useState("");
  const [autoQuery, setAutoQuery] = useState([]);

  useEffect(() => {
    setAutoQuery(shuffleArray(autoQueryList));
  }, []);

  return (
    <div className="grid md:grid-cols-2 grid-cols-1 gap-2 w-full pb-8">
      {autoQuery.slice(0, 2).map((query, index) => (
        <p
          key={index}
          className={`rounded-full font-archivo font-semibold h-10 text-base flex justify-center items-center hover:cursor-pointer ${
            input === query ? "bg-slate-100 text-slate-950" : ""
          }`}
          onClick={() => setInput(query)}
          style={{ border: "1px solid grey" }}
        >
          {query}
        </p>
      ))}
      {autoQuery.slice(2, 4).map((query, index) => (
        <p
          key={index + 2}
          className={`rounded-full font-archivo font-semibold  h-10 md:flex hidden justify-center items-center hover:cursor-pointer ${
            input === query ? "bg-slate-100 text-slate-950" : ""
          }`}
          onClick={() => setInput(query)}
          style={{ border: "1px solid grey" }}
        >
          {query}
        </p>
      ))}
    </div>
  );
}
