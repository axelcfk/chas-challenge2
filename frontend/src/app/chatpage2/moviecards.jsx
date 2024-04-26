export default function MovieCard({ movie }) {
  const { title, poster, overview } = movie;

  return (
    <div className="flex flex-col justify-center items-center h-full my-5">
      <div className="flex  h-full">
        <img
          style={{ border: "1px solid grey" }}
          className="h-40 mr-3 rounded-md"
          src={poster}
          alt={title}
        />
        <div className=" flex flex-col ml-3">
          <h2 className="text-md mb-4 font-light">{title}</h2>
          <p className="font-light text-slate-400">
            {overview.slice(0, 100)}...
          </p>
        </div>
      </div>
    </div>
  );
}

{
  /* <div className="w-full">
  <h2 className="text-2xl font-semibold mb-5 text-slate-50 mr-4">
    {" "}
    {movieDetails.titleFromAPI}
  </h2>
  <div className="flex text-sm">
    <p>
      {movieDetails.release.slice(0, 4)}
      <span className="text-sm mx-2">●</span>
    </p>
    <p>DIRECTED BY</p>
  </div>
  <p className="font-semibold text-lg">{movieCredits.director}</p>
  <p>{movieDetails.runtime.toString()} mins</p>
</div>; */
}
