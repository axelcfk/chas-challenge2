import Link from "next/link";

export default function SlideMenu({ children }) {
  return (
    <div className="flex max-w-full">
      <div className="w-full h-full overflow-x-scroll scroll whitespace-nowrap scroll-smooth removeScrollbar "
      >
        <style>
      {`
        @media (min-width: 459px) {
          .removeScrollbar::-webkit-scrollbar {
            display: none; /* Safari and Chrome */
          }
          .removeScrollbar {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* Internet Explorer 10+ */
          }
        }
      
      `}
    </style>
        {children}
      </div>
    </div>
  );
}

export function SlideMenuMovieCard({ title, poster, overview, id }) {
  if (!poster) {
    return <div className="mx-2 inline-block h-36 w-24">Loading movie...</div>;
  }

  return (
    <div className="mx-2 inline-block h-36 w-24">
      <Link href={`/movie/${encodeURIComponent(id)}`}>
        <img
          style={{ border: "1px solid grey" }}
          className="inline-block w-24 h-full mr-3 rounded-md"
          src={poster}
          alt={title}
        />
      </Link>
      {/* <div className=" flex flex-col ml-3">
          <h2 className="text-md mb-4 font-light">{title}</h2>
          <p className="font-light text-slate-400">
            {overview.slice(0, 100)}...
          </p>
        </div> */}
    </div>
  );
}

export function SlideMenuMixCard({ imgSrc, mixName = "MixName" }) {
  return (
    <div className="mr-2 inline-block relative">
      {/* <Link href={`/mymixes2/${encodeURIComponent(mixName)}`}> */}
      <Link href={`/mymixes2/${mixName}`}>
        <img
          className="inline-block w-32 h-36 rounded-md"
          src={imgSrc}
          alt="mix img"
        />
        <div className="absolute inset-0 flex items-center justify-center text-center flex-wrap w-full">
          <div className="bg-[#2B1B41] rounded-full opacity-65 w-[80%] text-wrap">
            <p className="opacity-100 text-white">{mixName}</p>
          </div>
        </div>
      </Link>
    </div>
  );
}

export function SlideMenuSearchHistoryCard({
  imgSrc,
  searchName = "Search #",
}) {
  return (
    <div className="mr-2 inline-block relative">
      {/* <Link href={`/mymixes/${encodeURIComponent(searchName)}`}> */}

      <img
        className="inline-block w-32 h-36 rounded-md"
        src={imgSrc}
        alt="mix img"
      />
      <div className="absolute inset-0 flex items-center justify-center text-center flex-wrap w-full">
        <div className="bg-[#2B1B41] rounded-full opacity-65 w-[80%] text-wrap">
          <p className="opacity-100 text-white">{searchName}</p>
        </div>
      </div>
      {/* </Link> */}
    </div>
  );
}
