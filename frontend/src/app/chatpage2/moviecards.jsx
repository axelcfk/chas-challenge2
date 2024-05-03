import Link from "next/link";

export default function MovieCard({ movie, credits, movieDetails }) {
  const { title, poster, overview, streaming } = movie;
  const { director } = credits;
  const { voteAverage } = movieDetails;

  if (!title) {
    // Handle the case where title is not provided
    console.error("Movie title is undefined or empty");
    return "Oh no I have no title"; // Or a placeholder component/message
  }

  const movieTitleEncoded = encodeURIComponent(title);

  return (
    <Link href="/movie/[movieName]" as={`/movie/${encodeURIComponent(title)}`}>
      <div className="  flex flex-col justify-center items-center h-full my-5">
        <div className=" flex flex-col h-full justify-center items-center ">
          <img
            style={{ border: "1px solid grey" }}
            className="h-52 rounded-md "
            src={poster}
            alt={title}
          />
          <div className=" flex flex-col ">
            {/* <h2 className="text-md font-light w-20 text-sm">{title}</h2> */}
            <p>{director}</p>
            {/* <p className="font-light text-slate-400">
              {overview.slice(0, 100)}...
            </p> */}
            <p>{voteAverage}</p>
            {/* <div>
              {streaming && streaming.flatrate ? (
                streaming.flatrate.map((provider) => (
                  <p key={provider.provider_id}>{provider.provider_name}</p>
                ))
              ) : (
                <p>Not available on streaming</p>
              )}
            </div> */}
          </div>
        </div>
      </div>
    </Link>
  );
}
