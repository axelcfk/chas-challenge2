import { useState, useEffect } from "react";

const autoQueryList = [
  "I want a movie that makes me laugh",
  "I want a movie that makes me cry",
  "I want a movie similar in vibe to Succession",
  "I want a movie similar in vibe to Shrek",
  "I'm sad, give me something to cheer me up",
  "I need a movie to lift my spirits",
  "I'm feeling nostalgic, recommend a classic",
  "I want a movie that's a visual masterpiece",
  "I want a movie with a lot of action",
  "I'm in the mood for a romantic movie",
  "I need a good horror movie",
  "Recommend a movie with a strong female lead",
  "I want a movie with an unexpected twist",
  "I'm in the mood for a musical",
  "I want a movie that makes me think",
  "I'm looking for an inspiring documentary",
  "I want a movie set in a fantasy world",
  "I want a movie with stunning cinematography",
  "I'm in the mood for a psychological thriller",
  "I need a feel-good movie",
  "I want a movie with a powerful message",
  "I'm in the mood for a crime drama",
  "I want a movie with great special effects",
  "I need a movie to watch with my family",
  "Recommend a movie with an amazing soundtrack",
  "I want a movie that explores deep themes",
  "I'm in the mood for an animated film",
  "I want a movie that showcases different cultures",
  "I need a light-hearted comedy",
  "I'm in the mood for a sci-fi adventure",
  "I want a movie that keeps me on the edge of my seat",
  "Recommend a movie that deals with mental health",
  "I want a movie with complex characters",
  "I'm in the mood for a historical drama",
  "I want a movie that explores human relationships",
  "I need a movie to escape reality",
  "Recommend a movie with a unique storyline",
  "I want a movie that's critically acclaimed",
  "I'm in the mood for a superhero movie",
  "I want a movie that's based on a true story",
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
          className={`rounded-full h-10 flex justify-center items-center hover:cursor-pointer ${
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
          className={`rounded-full h-10 md:flex hidden justify-center items-center hover:cursor-pointer ${
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
