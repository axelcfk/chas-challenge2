import { useState } from "react";
export default function AutoQuery({ setInput }) {
  const [autoQuery, setAutoQuery] = useState([
    "A movie that makes me laugh",
    "A movie that makes me cry",
    "A movie similar in vibe to Succession",
    "A movie similar in vibe to Shrek",
  ]);
  return (
    <div className="grid grid-cols-2 gap-4 py-20 ">
      <p
        className="rounded-xl p-4 hover:cursor-pointer"
        onClick={() => setInput(autoQuery[0])}
        style={{ border: "1px solid grey" }}
      >
        {autoQuery[0]}
      </p>
      <p
        className="rounded-xl p-4 hover:cursor-pointer"
        onClick={() => setInput(autoQuery[1])}
        style={{ border: "1px solid grey" }}
      >
        {autoQuery[1]}
      </p>
      <p
        className="rounded-xl p-4 hover:cursor-pointer"
        onClick={() => setInput(autoQuery[2])}
        style={{ border: "1px solid grey" }}
      >
        {autoQuery[2]}
      </p>
      <p
        className="rounded-xl p-4 hover:cursor-pointer"
        onClick={() => setInput(autoQuery[3])}
        style={{ border: "1px solid grey" }}
      >
        {autoQuery[3]}
      </p>
    </div>
  );
}
