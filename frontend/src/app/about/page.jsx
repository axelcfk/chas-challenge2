"use client";

import React from "react";

const About = () => {
  return (
    <div className="px-6 sm:px-12 lg:px-24 py-8 font-sans max-w-7xl mx-auto">
      <div className="flex flex-col items-center justify-center mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-center pb-8">
          Here to Revolutionize Your Movie Experience
        </h1>
        <div
          className="w-full xs:h-48 h-64 sm:h-80 md:h-96 lg:h-[28rem] xl:h-[32rem] mb-8 bg-cover bg-center"
          style={{ backgroundImage: "url('/About_page.jpg')" }}
        ></div>
      </div>
      <h2 className="text-2xl pb-5 sm:text-3xl lg:text-4xl font-semibold">
        A unique AI-driven movie recommendation platform
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
        The Team
      </h2>
      <p className="text-base sm:text-lg lg:text-xl mb-8">
        We are a group of dedicated students specializing in frontend web
        development. Our passion for technology and innovation has driven us to
        create AI Movie Suggestions, a platform designed to revolutionize the
        way you discover movies. By combining our web development skills with an
        interest in artificial intelligence, we provide accurate and
        personalized movie recommendations using existing machine learning
        libraries.
      </p>
    </div>
  );
};

export default About;
