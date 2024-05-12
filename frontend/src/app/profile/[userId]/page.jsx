"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }
    const userId = localStorage.getItem("userId");
    // Logga userId
    console.log("Current userId:", userId);
    console.log("Current userData:", userData);

    // Exempel på API-anrop för att hämta användardata
    fetch(`http://localhost:3010/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP status ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setUserData(data))
      .catch((error) => console.error("Failed to fetch user data", error));
  }, []);

  console.log("second userdata: ", userData);

  //* Lägg bakgrundsfärgen globalt senare
  //* Navbaren ska importeras globalt i layout senare

  return (
    <main>
      <Navbar />
      <div className="bg-[#201430] flex items-center flex-col ">
        {userData ? (
          <div className="flex items-center flex-col space-y-5 mt-12">
            <button className="bg-transparent border-none hover:cursor-pointer">
              <img src="/profile-user.svg" className="h-28"></img>
            </button>

            <h1>{userData.username}</h1>
          </div>
        ) : (
          <p>Loading user data...</p>
        )}
      </div>
      <div className="menu bg-[#110A19] flex flex-row justify-between px-8 items-center mt-12 h-16">
        <h4>Profile</h4>
        <h4>Watchlist</h4>
        <h4>My lists</h4>
      </div>
      <div className="bg-[#201430] p-8">
        <div>My favorites, only 3st </div>
        <div>Recent activity</div>
      </div>
    </main>
  );
}
