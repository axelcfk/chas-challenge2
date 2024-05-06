import Link from "next/link";
import { FaStar, FaHeart } from "react-icons/fa";

export default function FetchedMovies({
  movieDetails,
  movieCredits,
  isAvailableOnSupportedServices,
  streamingServiceLinks,
}) {
  console.log("fetched är", movieDetails);
  return (
    <>
      <div className="flex flex-col w-full justify-center items-center py-10">
        <h2 className="text-2xl font-semibold">Lights, Camera, Action!</h2>
        <p>Your curated movies awaits!</p>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full ">
        {movieDetails.map((movie, index) => (
          <Link href={`/movie/${encodeURIComponent(movie.id)}`}>
            <div
              className="w-full  flex justify-center items-center rounded-lg bg-slate-950"
              style={{ border: "0.8px solid grey" }}
            >
              <div className="flex flex-col justify-center items-center w-full ">
                <img
                  className="w-full  rounded-t-lg"
                  src={movie.poster}
                  alt="poster"
                />
                <div className=" w-full h-full py-5 px-2">
                  <p className="flex pb-4">
                    <span>
                      <FaStar color="yellow" />
                    </span>
                    <span className="pl-1"> 7.9{movie.voteAverage}</span>
                  </p>
                  <p className="h-14">{movie.title}</p>
                  <div className="w-full flex justify-center items-center pt-5 px-2">
                    <button className="w-full h-10 bg-purple-950 flex justify-center items-center rounded-xl">
                      <FaHeart />{" "}
                      <span className="pl-2">Save to your list</span>
                    </button>
                  </div>
                  <div>
                    {isAvailableOnSupportedServices &&
                    isAvailableOnSupportedServices(movie.streaming) ? (
                      movie.streaming.flatrate.map((provider) => (
                        <a
                          key={provider.provider_id}
                          href={streamingServiceLinks[provider.provider_name]}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <p className="hover:underline">
                            {provider.provider_name}
                          </p>
                        </a>
                      ))
                    ) : (
                      <p>
                        Not available on your streaming services or your area
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
