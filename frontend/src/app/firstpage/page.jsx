"use client";
import { useRef } from "react";
import Link from "next/link";
import "./firstpage.css";
import { FaDotCircle } from "react-icons/fa";

export default function FirstPage() {
  const videoRef = useRef(null);

  return (
    <div className="h-full bg-black flex flex-col px-5 justify-start items-center">
      <Link className="no-underline mt-3" href="/startpage">
        <span className="font-bebas hover:cursor-pointer py-2 text-white rounded-md font-medium cursor-pointer text-3xl">
          <span className="text-xl">
            <FaDotCircle />
          </span>
          <span className="font-archivo font-extrabold no-underline">
            BAMMS
          </span>
        </span>
      </Link>
      <div className="flex flex-col items-center justify-center md:mt-24 mt-52">
        <video
          className="md:w-1/3 w-2/3 transform rounded-full z-10"
          ref={videoRef}
          autoPlay
          loop
          muted
        >
          <source src="/ai-gif.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="flex flex-col justify-center items-center w-full absolute bottom-0">
        <button className="text-xl h-14 w-11/12 max-w-md bg-[#CFFF5E] rounded-full border-none font-semibold mb-4 text-slate-900 hover:bg-slate-200 shadow-lg">
          <Link href="create-account" className="no-underline text-slate-900">
            Create an account
          </Link>
        </button>
        <button
          style={{ border: "1px solid white" }}
          className="text-xl text-slate-100 h-14 w-11/12 max-w-md bg-transparent rounded-full font-semibold shadow-lg"
        >
          <Link href="login" className="no-underline text-slate-100">
            Log in
          </Link>
        </button>
        <div className="w-full flex justify-end mt-8 mr">
          <button className="bg-black border-none">
            {/* <Link
              className="text-white text-lg no-underline about-btn"
              href={"about"}
            >
              About
            </Link> */}
          </button>
        </div>
      </div>
    </div>
  );
}
