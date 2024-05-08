"use client";

import Link from "next/link";
import { useState } from "react";

//TODO: ta bort konstig margin/scroll på sidan? (efter tailwind base?)

export default function ChooseStreaming() {
  // här sparas dom valda streamingtjänsterna
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
      console.log("Selected Streaming Services:", selectedServices); // de valda streaming-tjänsterna sparas i selectedServices.
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


  //? vissa stylas inte trots .svg
  //? färg-loggor på denna sida?
  const services = [
    { name: "Netflix", logo: "/netflix.svg" },
    { name: "HBO Max", logo: "/hbo.svg" },
    { name: "Viaplay", logo: "/viaplay.svg" },
    { name: "Amazon Prime", logo: "/prime.svg" },
    { name: "Disney+", logo: "/disney.png" },
    { name: "Tele2Play", logo: "/tele2play.png" },
    { name: "Apple TV+", logo: "/appletv.svg" },
    { name: "TV4 Play", logo: "/tv4play.svg" },
    { name: "SVT Play", logo: "/svtplay.svg" },
    { name: "Discovery+", logo: "/discovery+.svg" },
  ];

  return (
    <main className="py-10 px-5 h-screen w-screen flex flex-col items-center bg-[#110A19]">
      <div>
        <h1 className="text-3xl font-bold text-white">Streaming services</h1>
        <p className="mt-6 text-sm text-white">
          Choose which streaming services you are going to use. This means you
          will only be given recommendations based on your choice of
          streaming-services. This can be changed later in your profile. Choose
          "skip" to see all movies.
        </p>
      </div>
      <div className="container mt-12 w-full max-w-4xl mx-auto mb-12">
        <div className="grid grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service.name}
              // Om tjänsten är markerad, =(så fort den hamnar i arrayen) ge den en klassen "selected" som markerar elementet.
              className={`square ${
                selectedServices.includes(service.name) ? "selected" : ""
              }`}
              onClick={() => handleSelectService(service.name)}
            >
              <div className="square-content">
                <img
                  src={service.logo}
                  alt={service.name}
                  className="mx-auto w-full p-7"
                />
                <div className="selected-overlay">✔</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex space-x-4 mt-24">
        <Link href={"/startpage"}>
          <button className="streaming-btn w-56 rounded-3xl text-black">
            Skip
          </button>
        </Link>
        <Link href={"/startpage"}>
          <button
            onClick={handleSumbit}
            className="streaming-btn w-56 rounded-3xl text-black"
          >
            Next
          </button>
        </Link>
      </div>
    </main>
  );
}
