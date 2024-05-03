export default function LoadedResults() {
  return (
    <div>
      <div className="h-full ">
        <div className="grid grid-cols-2">
          {movieDetails.map((movie, index) => (
            <MovieCard key={movie.id} movie={movie} credits={movieCredits} />
          ))}
        </div>
        <div className=" sticky inset-x-0 bottom-8 z-10 w-full flex flex-wrap justify-center items-center ">
          <div
            className="flex justify-center items-center w-full rounded-xl h-14 px-5 z-10"
            style={{ border: "1px solid grey" }}
          >
            <input
              className="h-14 bg-transparent w-full  rounded-xl text-lg text-center text-slate-50 md:mr-3"
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Want anything else?"
            />
            <div className="hover:cursor-pointer" onClick={handleQuerySubmit}>
              <video className="w-full h-14" ref={videoRef} autoPlay loop muted>
                <source src="/ai-gif.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
