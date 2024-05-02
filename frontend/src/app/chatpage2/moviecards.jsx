import Link from "next/link";

export default function MovieCard({ movie, credits }) {
  const { title, poster, overview, streaming } = movie;
  const { director } = credits;

  if (!title) {
    // Handle the case where title is not provided
    console.error("Movie title is undefined or empty");
    return "Oh no I have no title"; // Or a placeholder component/message
  }

  const movieTitleEncoded = encodeURIComponent(title);

  return (
    <Link href="/movie/[movieName]" as={`/movie/${encodeURIComponent(title)}`}>
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
            <div>
              {streaming && streaming.flatrate ? (
                streaming.flatrate.map((provider) => (
                  <img
                    key={provider.provider_id}
                    src={`https://image.tmdb.org/t/p/w100${provider.logo_path}`}
                    alt={provider.provider_name}
                  />
                ))
              ) : (
                <p>Not available on streaming</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
