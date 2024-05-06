"use client";

import Link from "next/link";
import { useState } from "react";

export default function ChooseStreaming() {
  const [selectedServices, setSelectedServices] = useState([]);

  const handleSelectService = (service) => {
    setSelectedServices((prev) => {
      return prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service];
    });
  };

  const handleSumbit = async () => {
    try {
      console.log("Selected Streaming Services:", selectedServices);
      const response = await fetch("http://localhost:3010/streaming-services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          services: selectedServices,
        }),
      });
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      alert(error.message);
    }
  };

  const services = [
    { name: "Netflix", logo: "/Netflix_icon.svg.png" },
    { name: "HBO Max", logo: "/hbo-max.png" },
    { name: "Viaplay", logo: "/viaplay-logo.jpeg" },
    { name: "Amazon Prime", logo: "/amazon-prime-video-logo.jpeg" },
    { name: "Disney+", logo: "/disney-plus-logo.png" },
    { name: "Hulu", logo: "/" },
    { name: "Apple TV+", logo: "/apple-tv-logo.png" },
    { name: "Paramount", logo: "/paramount-plus-logo.jpeg" },
    { name: "Tele2Play", logo: "/tele2play-logo.png" },
  ];

  return (
    <main className="py-10 px-5 h-screen w-screen flex flex-col items-center">
      <div>
        <h1 className="text-3xl font-bold text-white">Streaming services</h1>
        <p className="mt-6 text-sm text-white">
          Choose which streaming services you are going to use. This means you
          will only be get recommendations based on your choice of
          streaming-services. This can be changed later in your profile. Choose
          skip to see all movies.
        </p>
      </div>
      <div className="container mt-12 w-full max-w-4xl mx-auto mb-12">
        <div className="grid grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service.name}
              // Om tjänsten är markerad, (kolla om den finns med i arrayen) ge den en klassen "selected" som markerar elementet.
              className={`square ${
                selectedServices.includes(service) ? "selected" : ""
              }`}
              onClick={() => handleSelectService(service.name)}
            >
              <div className="square-content">
                <img
                  src={service.logo}
                  alt={service.name}
                  className="mx-auto"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex space-x-4">
        <Link href={"/startpage"}>
          <button className="streaming-btn w-56 rounded-3xl">Skip</button>
        </Link>
        <Link href={"/startpage"}>
          <button
            onClick={handleSumbit}
            className="streaming-btn w-56 rounded-3xl"
          >
            Next
          </button>
        </Link>
      </div>
    </main>
  );
}
