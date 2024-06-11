"use client";

import Link from "next/link";
import "./firstpage.css";
import { useRef } from "react";
import { FaDotCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function FirstPage() {
  const videoRef = useRef(null);

  const router = useRouter();

  const [currentText, setCurrentText] = useState("Hello I'm LUDI!");
  const [animationPhase, setAnimationPhase] = useState("erasing");
  const [currentPhrase, setCurrentPhrase] = useState(0);

  useEffect(() => {
    let timer;

    const phrases = [
      "Say hello to LUDI",
      `Say hello to a new way of finding movies`,
    ];

    if (animationPhase === "erasing") {
      if (currentText.length > 0) {
        timer = setTimeout(() => {
          setCurrentText((prev) => prev.substring(0, prev.length - 1));
        }, 5); // hastighet
      } else {
        setAnimationPhase("writing");
        setCurrentPhrase((prev) => (prev === 0 ? 1 : 0)); // Toggle between phrase hej hej
      }
    } else if (animationPhase === "writing") {
      if (currentText !== phrases[currentPhrase]) {
        timer = setTimeout(() => {
          setCurrentText((prev) =>
            phrases[currentPhrase].substring(0, prev.length + 1)
          );
        }, 5); // hastighet
      } else {
        timer = setTimeout(() => {
          setAnimationPhase("erasing");
        }, 7000); //vänta 7 sek innan radera
      }
    }

    return () => clearTimeout(timer);
  }, [currentText, animationPhase, currentPhrase]);

  return (
    <div className="h-full bg-black flex flex-col px-5 justify-start items-center">
      <div className="absolute top-2 left-4 no-underline mt-3">
        <span className="  py-2 text-[#CFFF5E] rounded-md font-medium  text-3xl">
          <span className="text-xl">
            <FaDotCircle />
          </span>
          <span className="">
            <span className="font-archivo font-extrabold text-white">LUDI</span>
          </span>
        </span>
      </div>
      <Link
        className="absolute top-2 right-4 mt-3  text-white text-lg no-underline about-btn"
        href={"about"}
      >
        About
      </Link>
      <div className="flex flex-col items-center justify-center md:mt-24 mt-20">
        <video
          className="md:w-1/3 w-96 transform rounded-full z-10"
          ref={videoRef}
          autoPlay
          loop
          muted
        >
          <source src="/ai-gif.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="flex justify-center items-center w-3/4 ">
        <h2 className="text-center font-archivo font-extrabold text-4xl uppercase">
          {currentText}
        </h2>
      </div>

      <div className="flex flex-col items-center w-full absolute bottom-6">
        <button
          onClick={() => {
            router.push("/create-account");
          }}
          className="border-none text-xl h-14 w-11/12 max-w-md bg-[#CFFF5E] rounded-full font-semibold mb-4 text-slate-900 hover:bg-slate-200 shadow-lg hover:cursor-pointer"
        >
          {/* <Link href="create-account" className="w-full h-full no-underline text-slate-900"> */}
          {/* moved "link" to button's onclick, otherwise you have to click on the text 'Create an account'  */}
          Create an account
          {/*   </Link> */}
        </button>
        <button
          onClick={() => {
            router.push("/login");
          }}
          style={{ border: "1px solid white" }}
          className="text-xl text-slate-100 h-14 w-11/12 max-w-md bg-transparent rounded-full font-semibold shadow-lg hover:cursor-pointer"
        >
          {/*   <Link href="login" className="no-underline text-slate-100"> */}
          Log in
          {/* </Link> */}
        </button>
        {/* <div className="w-full flex justify-end mt-8 mr-8">
          <button className="bg-black border-none">
            <Link
              className="text-white text-lg no-underline about-btn"
              href={"about"}
            >
              About
            </Link>
          </button>
        </div> */}
      </div>
    </div>
  );
}
