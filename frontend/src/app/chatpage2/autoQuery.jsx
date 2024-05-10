import { useState } from "react";
export default function AutoQuery({ setInput, input }) {
  const [autoQuery, setAutoQuery] = useState([
    "A movie that makes me laugh",
    "A movie that makes me cry",
    "A movie similar in vibe to Succession",
    "A movie similar in vibe to Shrek",
  ]);

  return (
    <div className="grid md:grid-cols-2 grid-cols-1 gap-2  w-full pb-8 ">
      <p
        className={`rounded-full h-10 flex justify-center items-center hover:cursor-pointer ${
          input === autoQuery[0] ? "bg-slate-100 text-slate-950" : ""
        }`}
        onClick={() => setInput(autoQuery[0])}
        style={{ border: "1px solid grey" }}
      >
        {autoQuery[0]}
      </p>
      <p
        className={`rounded-full h-10 flex justify-center items-center hover:cursor-pointer ${
          input === autoQuery[1] ? "bg-slate-100 text-slate-950" : ""
        }`}
        onClick={() => setInput(autoQuery[1])}
        style={{ border: "1px solid grey" }}
      >
        {autoQuery[1]}
      </p>
      <p
        className={`rounded-full h-10 md:flex  hidden justify-center items-center hover:cursor-pointer ${
          input === autoQuery[2] ? "bg-slate-100 text-slate-950" : ""
        }`}
        onClick={() => setInput(autoQuery[2])}
        style={{ border: "1px solid grey" }}
      >
        {autoQuery[2]}
      </p>
      <p
        className={`rounded-full h-10 md:flex hidden justify-center items-center hover:cursor-pointer ${
          input === autoQuery[3] ? "bg-slate-100 text-slate-950" : ""
        }`}
        onClick={() => setInput(autoQuery[3])}
        style={{ border: "1px solid grey" }}
      >
        {autoQuery[3]}
      </p>
    </div>
  );
}
