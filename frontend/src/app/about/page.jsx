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
          A unique{" "}
          <span className="inline-block text-[#CFFF5E]">AI-driven</span> movie
          recommendation platform
        </span>
      </h2>

      <p className="text-base sm:text-lg lg:text-xl mb-8">
        Welcome to Movie AI Suggestions, an innovative platform designed to
        provide movie enthusiasts with accurate and personalized
        recommendations. By combining our web development skills with an
        interest in artificial intelligence, we leverage latest predictive
        models and machine learning libraries to transform the way you discover
        and enjoy movies.
      </p>
      <h2 className="text-2xl pb-2 sm:text-3xl lg:text-4xl font-semibold mb-4">
        Our Mission
      </h2>
      <p className="text-base sm:text-lg lg:text-xl mb-8">
        Our mission is to enhance your movie-watching experience by making it
        easy to find films you'll love without wasting time. By analyzing your
        preferences and viewing history, our AI provides personalized
        recommendations tailored to your taste. We believe everyone should have
        access to advanced recommendation systems to effortlessly discover new
        favorites. Harnessing AI, we aim to redefine movie discovery and help
        you build lasting memories with the perfect film.
      </p>

      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-6">
        Meet the team!
      </h2>
      <p className="text-base sm:text-lg lg:text-xl mb-8">
        We are a group of dedicated fullstack students specializing in frontend
        development. Our passion for technology and innovation has driven us to
        create AI Movie Suggestions, a platform designed to revolutionize the
        way you discover movies. By combining our web development skills with an
        interest in artificial intelligence, we provide accurate and
        personalized movie recommendations using existing machine learning
        libraries.
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
