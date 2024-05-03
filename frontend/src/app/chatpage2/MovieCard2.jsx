import Link from "next/link";

export default function MovieCard2({ movie, credits }) {
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
      <div className="grid grid-cols-2 w-full bg-orange-500">
        <div className="bg-emerald-500 w-full h-full flex justify-center items-center">
          <img
            style={{ border: "1px solid grey" }}
            className="h-40 rounded-md"
            src={poster}
            alt={title}
          />
        </div>
      </div>
    </Link>
  );
}
