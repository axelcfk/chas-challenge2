export default function SlideMenu({ children }) {
  return (
    
    <div className="flex max-w-full">
    <div className="w-full h-full overflow-x-scroll scroll whitespace-nowrap scroll-smooth">
      {children}
    </div>
    </div>
  );
}

export function SlideMenuMovieCard({title, poster, overview, imgSrc}) {

  return (
    <div className="mx-2 inline-block h-36 w-24">
      <img
          style={{ border: "1px solid grey" }}
          className="inline-block w-24 h-full mr-3 rounded-md"
          // src={poster}
          src={imgSrc}
          alt={title}
        />
        {/* <div className=" flex flex-col ml-3">
          <h2 className="text-md mb-4 font-light">{title}</h2>
          <p className="font-light text-slate-400">
            {overview.slice(0, 100)}...
          </p>
        </div> */}
    </div>
  )
}

export function SlideMenuMixCard({imgSrc}) {

  return (
    <div className="mx-2 inline-block relative">
    <img
      className="inline-block w-32 h-36 rounded-md"
      src={imgSrc}
      alt="mix img"
    />
    <div className="absolute inset-0 flex items-center justify-center text-center flex-wrap w-full">
      <div className="bg-[#2B1B41] rounded-full opacity-65 w-[80%] text-wrap"><p className="opacity-100">Your Mix</p></div>
    </div>
  </div>
  )
}