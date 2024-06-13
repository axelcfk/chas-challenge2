"use client";

import { SlArrowLeft } from "react-icons/sl";
import "./about.css";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { FaDotCircle } from "react-icons/fa";
import Link from "next/link";

const About = () => {

  const router = useRouter();
  const handleNavigation = () => {
    router.back();
    //router.push("/startpage");
  };

  const { isLoggedIn } = useAuth();

  return (
    <div className="py-8 font-archivo">
       {!isLoggedIn && <><div className="absolute top-2 left-4 no-underline mt-3">
        <span className=" flex justify-center items-center  py-2 text-[#CFFF5E] rounded-md font-medium  text-3xl">
          <span className="text-sm">
            <FaDotCircle />
          </span>
          <span className="">
            <span className="font-archivo font-extrabold text-white">LUDI</span>
          </span>
        </span>
      </div>
      <Link
        className="absolute top-4 right-4 mt-3  text-white text-lg no-underline about-btn"
        href={"about"}
      >
        About
      </Link></>}
      <button
          className={`bg-transparent border-none absolute top-0 left-0 m-8 my-20 ${!isLoggedIn ? "pt-2" : "pt-1"}  text-slate-100 text-xl hover:cursor-pointer`}
          onClick={handleNavigation}
        >
          <SlArrowLeft />
        </button>
      <div className="pt-16  flex flex-col items-center justify-center mb-8  ">
        <div
          className="w-full mt-12 xs:h-48 h-64 sm:h-80 md:h-96  mb-8 bg-cover bg-center"
          style={{ backgroundImage: "url('/About_page.jpg')" }}
        ></div>
      </div>
      <div className="px-8 ">
        <h2 className="text-2xl pb-5 sm:text-3xl lg:text-4xl font-extrabold mb-6 font-archivo flex">
          <span className="inline-block">
            A unique
            <span className="inline-block font-archivo font-extrabold ml-2 mr-1 text-3xl text-[#CFFF5E]">
              AI-driven
            </span>{" "}
            movie recommendation platform
          </span>
        </h2>

        <p
          className="text-lg sm:text-lg lg:text-xl mb-8 "
          style={{ lineHeight: "1.75" }}
        >
          LUDI is your new go-to movie app. With innovative and personalized AI
          recommendations, we are here to transform your movie-searching
          experience.
        </p>
        <h2 className="text-2xl pb-2 sm:text-3xl lg:text-4xl font-extrabold mb-6 font-archivo">
          Our Mission
        </h2>
        <p
          className="text-lg sm:text-lg lg:text-xl mb-8 "
          style={{ lineHeight: "1.75" }}
        >
          We want to change the way you search for movies by offering tailored
          recommendations based on your preferences and viewing history. We
          leverage AI to help you effortlessly discover new favorites and create
          lasting memories with the perfect films.
        </p>
      </div>

      <div className="px-8 ">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-6 font-archivo">
          Meet the team
        </h2>

        {/* <div class="grid grid-cols-3 space-y-10">
        <div class="grid-item text-center mt-10">
          <img src="/shantiAI.webp" className="AI-image" />
          <h2 className="font-bold">Shanti</h2>
          <h3>Scrum Master</h3>
          <h3> Developer</h3>
        </div>
        <div class="grid-item text-center">
          <img src="/marcusAI.jpg" className="AI-image" />
          <h2 className="font-bold">Marcus</h2>
          <h3> Developer,</h3>
          <h3>DevOps</h3>
        </div>
        <div class="grid-item text-center ">
          <img src="/axel3.png" className="AI-image " />
          <h2 className="font-bold">Axel</h2>
          <h3> Developer,</h3>
          <h3>DevOps</h3>
        </div>
        <div class="grid-item text-center">
          <img src="/mikael.webp" className="AI-image " />
          <h2 className="font-bold">Mikael</h2>
          <h3> Developer</h3>
        </div>
        <div class="grid-item text-center">
          <img src="/behrozAI.webp" className="AI-image" />
          <h2 className="font-bold">Behroz</h2>
          <h3> Developer</h3>
        </div>
        <div class="grid-item text-center">
          <img src="/johannaAI.webp" className="AI-image" />
          <h2 className="font-bold">Johanna</h2>
          <h3>UX-designer</h3>
        </div>
      </div> */}

        <div class="flex flex-col md:flex-row justify-center md:justify-evenly items-start mt-20 ">
          <div class="text-center ">
            <img
              src="/shanti1.png"
              className="md:w-52 md:h-52 w-full  rounded-full"
            />
            <h2 className="font-semibold text-xl mt-4">Shanti Hedelin</h2>
            <h3 className="text-xl">Scrum Master & </h3>
            <h3 className="text-xl">Developer</h3>
          </div>
          <div class="text-center mt-20 md:mt-0">
            <img
              src="/marcus.png"
              className="md:w-52 md:h-52 w-full  rounded-full"
            />
            <h2 className="font-semibold text-xl mt-4">Marcus Ekström</h2>
            <h3 className="text-xl"> Developer & </h3>
            <h3 className="text-xl"> DevOps</h3>
          </div>
          <div class=" text-center  mt-20 md:mt-0">
            <img
              src="/axel3.jpg"
              className="md:w-52 md:h-52 w-full  rounded-full"
            />
            <h2 className="font-semibold text-xl mt-4">Axel Kacou Thalin</h2>
            <h3 className="text-xl "> Developer &</h3>
            <h3 className="text-xl"> DevOps</h3>
          </div>
          <div class="text-center mt-20 md:mt-0">
            <img
              src="/mikael.png"
              className="md:w-52 md:h-52 w-full rounded-full"
            />
            <h2 className="font-semibold text-xl mt-4">Mikael Linderoth</h2>
            <h3 className="text-xl "> Developer</h3>
            <h3 className="text-xl"> </h3>
          </div>
          <div class="text-center mt-20 md:mt-0">
            <img
              src="/behroz.png"
              className="md:w-52 md:h-52 w-full rounded-full"
            />
            <h2 className="font-semibold text-xl mt-4">Behroz Afzali</h2>
            <h3 className="text-xl "> Developer</h3>
            <h3 className="text-xl "> </h3>
          </div>
          <div class="text-center mt-20 md:mt-0">
            <img
              src="/johanna.png"
              className="md:w-52 md:h-52 w-full  rounded-full"
            />
            <h2 className="font-semibold text-xl mt-4">Johanna Branting</h2>
            <h3 className="text-xl">UX-Designer</h3>
            <h3 className="text-xl"></h3>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-32 px-8">
        <img src="/tmdb_logo.svg" className="tmbd-logo"></img>
        <p className="text-base sm:text-lg lg:text-xl mb-8 ml-2">
          This product uses the TMDB API but is not endorsed or certified by
          TMDB.
        </p>
      </div>
    </div>
  );
};

export default About;
