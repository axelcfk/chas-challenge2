"use client";

import "./about.css";

const About = () => {
  return (
    <div className="px-6 sm:px-12 lg:px-24 py-8 font-sans max-w-7xl mx-auto">
      <div className="flex flex-col items-center justify-center mb-8">
        <h1 className="text-3xl mt-16 sm:text-4xl lg:text-5xl font-bold mb-6 text-center pb-8">
          Here to Revolutionize How You Find Movies
        </h1>
        <div
          className="w-full xs:h-48 h-64 sm:h-80 md:h-96 lg:h-[28rem] xl:h-[32rem] mb-8 bg-cover bg-center"
          style={{ backgroundImage: "url('/About_page.jpg')" }}
        ></div>
      </div>
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
        Our mission is to enhance your movie-watching experience by offering
        tailored recommendations based on your preferences and viewing history.
        We leverage AI to help you effortlessly discover new favorites and
        create lasting memories with the perfect films.
      </p>

      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-6 font-archivo">
        Meet the team
      </h2>
      {/* <p
        className="text-lg sm:text-lg lg:text-xl mb-8 "
        style={{ lineHeight: "1.75" }}
      >
        We are a team of dedicated full-stack and UX students specializing in
        frontend development. Our passion for technology and innovation drives
        us to revolutionize movie discovery, providing accurate recommendations
        using OpenAI.
      </p> */}
      <div class="grid-container space-y-10">
        <div class="grid-item text-center mt-10">
          <img src="/shantiAI.webp" className="AI-image" />
          <h2 className="font-bold">Shanti</h2>
          <h3>Scrum Master</h3>
          <h3>Software Developer</h3>
        </div>
        <div class="grid-item text-center">
          <img src="/marcusAI.jpg" className="AI-image" />
          <h2 className="font-bold">Marcus</h2>
          <h3>Software Developer</h3>
        </div>
        <div class="grid-item text-center">
          <img src="/axel.webp" className="AI-image" />
          <h2 className="font-bold">Axel</h2>
          <h3>Software Developer</h3>
        </div>
        <div class="grid-item text-center">
          <img src="/mikael.webp" className="AI-image" />
          <h2 className="font-bold">Mikael</h2>
          <h3>Software Developer</h3>
        </div>
        <div class="grid-item text-center">
          <img src="/behrozAI.webp" className="AI-image" />
          <h2 className="font-bold">Behroz</h2>
          <h3>Software Developer</h3>
        </div>
        <div class="grid-item text-center">
          <img src="/johannaAI.webp" className="AI-image" />
          <h2 className="font-bold">Johanna</h2>
          <h3>UX-designer</h3>
        </div>
      </div>

      <div className="flex flex-row w-full mt-32 space-x-6">
        <img src="/tmdb_logo.svg" className="tmbd-logo"></img>
        <p className="text-base sm:text-lg lg:text-xl mb-8">
          This product uses the TMDB API but is not endorsed or certified by
          TMDB.
        </p>
      </div>
    </div>
  );
};

export default About;
