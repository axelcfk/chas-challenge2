export default function MovieCard({ movie }) {
  const { title, poster, overview } = movie;

  return (
    <div className="flex flex-col justify-center items-center h-full my-5">
      <div className="flex  h-full">
        <img className="h-40 mr-3" src={poster} alt={title} />
        <div className=" flex flex-col ml-3">
          <h2 className="text-xl ">{title}</h2>
          <p>{overview.slice(0, 50)}</p>
        </div>
      </div>
    </div>
  );
}
