"use client";
import Link from "next/link";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export default function SlideMenu({ children, placeholder = false }) {
  const scrollContainerRef = useRef(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
      setScrollLeft(scrollContainerRef.current.scrollLeft + scrollAmount);
    }
  };

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
      setScrollLeft(scrollContainerRef.current.scrollLeft - scrollAmount);
    }
  };

  const updateScrollability = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const canScrollRight = container.scrollLeft < container.scrollWidth - container.clientWidth;
      const canScrollLeft = container.scrollLeft > 0;
      setCanScrollRight(canScrollRight);
      setCanScrollLeft(canScrollLeft);
      setAtEnd(!canScrollRight);
    }
  };

  useEffect(() => {
    updateScrollability();

    const handleResize = () => {
      updateScrollability();
    };

    window.addEventListener("resize", handleResize);

    if (scrollContainerRef.current) {
      scrollContainerRef.current.addEventListener("scroll", updateScrollability);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener("scroll", updateScrollability);
      }
    };
  }, []);

  useEffect(() => {
    updateScrollability();
  }, [children]);

  return (
    <div className="flex max-w-full relative">
      {!placeholder ? (
        <>
          <div className="relative w-full">
            <div
              ref={scrollContainerRef}
              className="w-full h-full overflow-x-scroll whitespace-nowrap scroll-smooth removeScrollbar"
            >
              {children}
            </div>
            {canScrollLeft && (
              <button
                className="hidden md:flex scroll-button-left"
                onClick={handleScrollLeft}
              >
                <FaArrowLeft size={"60px"} />
              </button>
            )}
            <button
              className={`hidden md:flex scroll-button ${atEnd ? 'at-end' : ''}`}
              onClick={handleScrollRight}
              disabled={atEnd}
            >
              <FaArrowRight size={"60px"} />
            </button>
          </div>
        </>
      ) : (
        <div className="w-full h-full md:h-64 md:p-8 rounded-2xl relative bg-[#1D1631] card-shadow mx-4 lg:mx-0 ">
          <div className="h-80"></div>
          <div className="w-full text-center absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col gap-8 justify-start items-start w-[80%] text-start">
              <h2 className="flex justify-center items-center text-3xl uppercase">
                <span className="font-archivo font-extrabold">
                  Start adding to your Watchlist
                </span>
              </h2>
              <Link className="no-underline text-black" href={"/chatpage2"}>
                <button className="flex justify-center items-center gap-4 no-underline hover:cursor-pointer border-none text-2xl bg-[#CFFF5E] hover:bg-gray-100 w-64 h-16 rounded-full font-extrabold font-archivo text-black">
                  Find Movies <FaArrowRight color="rgb(2 6 23)" size={"24px"} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        @media (min-width: 459px) {
          .removeScrollbar::-webkit-scrollbar {
            display: none; /* Safari and Chrome */
          }
          .removeScrollbar {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* Internet Explorer 10+ */
          }
        }

        .scroll-button {
          position: absolute;
          top: 50%;
          right: 5px;
          transform: translateY(-50%);
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          border-radius: 50%;
          width: 80px;
          height: 80px;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .scroll-button:hover {
          background-color: rgba(0, 0, 0, 0.7);
        }

        .scroll-button-left {
          position: absolute;
          top: 50%;
          left: 5px;
          transform: translateY(-50%);
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          border-radius: 50%;
          width: 80px;
          height: 80px;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .scroll-button-left:hover {
          background-color: rgba(0, 0, 0, 0.7);
        }

        .scroll-button.at-end {
          
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
export function SlideMenuMovieCard({
  title,
  poster,
  overview,
  id,
  movieId,
  onClick,
  className,
  disableLink,
}) {
  //console.log("SlideMenuMovieCard props:", { title, poster, overview, id });

  if (!poster) {
    return <div className="mx-2 inline-block h-36 w-24">Loading movie...</div>;
  }

  return (
    <div
      className={`mx-2 inline-block h-36 w-24 ${className}`}
      onClick={onClick}
    >
      {disableLink ? (
        <img
          style={{ border: "1px solid grey" }}
          className="inline-block w-24 h-full mr-3 rounded-md"
          src={poster}
          alt={title}
        />
      ) : (
        <Link href={`/movie/${encodeURIComponent(id)}`}>
          <img
            style={{ border: "1px solid grey" }}
            className="inline-block w-24 h-full mr-3 rounded-md"
            src={poster}
            alt={title}
          />
        </Link>
      )}
      {/* <div className=" flex flex-col ml-3">
          <h2 className="text-md mb-4 font-light">{title}</h2>
          <p className="font-light text-slate-400">
            {overview.slice(0, 100)}...
          </p>
        </div> */}
    </div>
  );
}

SlideMenuMovieCard.propTypes = {
  title: PropTypes.string.isRequired,
  poster: PropTypes.string.isRequired,
  overview: PropTypes.string,
  id: PropTypes.string.isRequired,
};

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
