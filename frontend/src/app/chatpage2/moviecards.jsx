import Link from "next/link";

export default function MovieCard({ movie, credits }) {
  const { title, poster, overview } = movie;
  const { director } = credits;
  const movieTitleEncoded = encodeURIComponent(title); // Make sure the title is URL-friendly

  return (
    <Link href={`/movie/${movieTitleEncoded}`}>
      <div className="flex flex-col justify-center items-center h-full my-5">
        <div className="flex w-full h-full justify-center ">
          <img
            style={{ border: "1px solid grey" }}
            className="h-40 mr-3 rounded-md "
            src={poster}
            alt={title}
          />
          <div className=" flex flex-col ml-3">
            <h2 className="text-md mb-4 font-light">{title}</h2>
            <p>{director}</p>
            <p className="font-light text-slate-400">
              {overview.slice(0, 100)}...
            </p>
          </div>
        </div>
      </div>
    </Link>
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
