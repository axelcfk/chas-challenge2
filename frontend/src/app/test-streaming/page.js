"use client";

// bara en lista för att se vilka streaming tjänster som
// är tillgängliga på TMDB.

import { useState, useEffect } from "react";

export default function TestStreaming() {
  const [providers, setProviders] = useState([]);
  const apiKey = "b0aa22976a88a1f9ab9dbcd9828204b5"; // Byt ut med din faktiska API-nyckel

  async function fetchAllProviders(apiKey) {
    const response = await fetch(
      `https://api.themoviedb.org/3/watch/providers/movie?api_key=${apiKey}&watch_region=`
    );
    const data = await response.json();

    return data.results.map((provider) => provider.provider_name);
  }

  useEffect(() => {
    // Körs när komponenten monteras
    fetchAllProviders(apiKey)
      .then((providers) => {
        // Uppdatera tillståndet med den hämtade listan
        setProviders(providers);
      })
      .catch((error) => {
        console.error("Kunde inte hämta tjänster:", error);
      });
  }, []); // Tom array gör att useEffect bara körs en gång

  return (
    <div>
      <h2>Tillgängliga streamingtjänster</h2>
      <ul>
        {providers.length > 0 ? (
          providers.map((provider, index) => <li key={index}>{provider}</li>)
        ) : (
          <li>Laddar...</li>
        )}
      </ul>
    </div>
  );
}
