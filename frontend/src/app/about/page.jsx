"use client";

import "./about.css";

const About = () => {
  return (
    <div className="px-6 sm:px-12 lg:px-24 py-8 font-sans max-w-7xl mx-auto">
      <div className="flex flex-col items-center justify-center mb-8">
        <h1 className="text-3xl mt-16 sm:text-4xl lg:text-5xl font-bold mb-6 text-center pb-8">
          Here to Revolutionize Your Movie Experience
        </h1>
        <div
          className="w-full xs:h-48 h-64 sm:h-80 md:h-96 lg:h-[28rem] xl:h-[32rem] mb-8 bg-cover bg-center"
          style={{ backgroundImage: "url('/About_page.jpg')" }}
        ></div>
      </div>
      <h2 className="text-2xl pb-5 sm:text-3xl lg:text-4xl font-semibold flex">
        <span className="inline-block">
          A unique
          <span className="inline-block font-archivo font-extrabold ml-2 mr-1 text-3xl text-[#CFFF5E]">
            AI-driven
          </span>{" "}
          movie recommendation platform
        </span>
      </h2>

      <p className="text-base sm:text-lg lg:text-xl mb-8">
        Discover movies you'll love with Movie AI Suggestions, an innovative
        platform that uses AI to provide personalized recommendations. We
        combine web development expertise with cutting-edge predictive models to
        transform your movie-watching experience.
      </p>
      <h2 className="text-2xl pb-2 sm:text-3xl lg:text-4xl font-semibold mb-4">
        Our Mission
      </h2>
      <p className="text-base sm:text-lg lg:text-xl mb-8">
        Our mission is to enhance your movie-watching experience by offering
        tailored recommendations based on your preferences and viewing history.
        We leverage AI to help you effortlessly discover new favorites and
        create lasting memories with the perfect films.
      </p>

      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-6">
        Meet the team
      </h2>
      <p className="text-base sm:text-lg lg:text-xl mb-8">
        We are a team of dedicated full-stack and UX students specializing in
        frontend development. Our passion for technology and innovation drives
        us to revolutionize movie discovery, providing accurate recommendations
        using OpenAI.
      </p>
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

      <div className="flex flex-col w-full">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-6">
          TMDB API
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex w-16 ">
            <img src="/tmdb_logo.svg"></img>
          </div>
          <p className="text-base sm:text-lg lg:text-xl mb-8">
            This product uses the TMDB API but is not endorsed or certified by
            TMDB.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
