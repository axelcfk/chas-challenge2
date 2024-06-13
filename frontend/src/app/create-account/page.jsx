"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { FaDotCircle } from "react-icons/fa";
import { host } from "../utils";

export default function CreateAccount() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { login } = useAuth();

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  useEffect(() => {
    let timeout;
    if (successMessage !== "") {
      timeout = setTimeout(() => {
        // omdirigera till new-user sidan
        router.push("/new-user");
      }, 2000); // 2 sekunder timeout innan man omdirigeras

      return () => clearTimeout(timeout);
    }
  }, [successMessage, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage(""); // Clear previous error messages

    try {
      const response = await fetch(`${host}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 400 &&
          data.message === "This user already exists"
        ) {
          throw new Error("This user already exists");
        } else {
          throw new Error(data.message || "An unexpected error occurred");
        }
      }

      console.log("Success:", data);
      setSuccessMessage("You've successfully created an account!");

      // Logga även in användaren vid registrering:
      const loginResponse = await login(username, password);
      if (!loginResponse.success) {
        throw new Error(loginResponse.message);
      }

      setTimeout(() => {
        setSuccessMessage("Congrats! You will now be redirected!");
      }, 3000); // Texten kommer fram efter 3 sek.
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
    }
  }

  return (
    <div
      className="h-full bg-black flex flex-col justify-between items-center px-5 pt-20"
      style={{
        // backgroundImage: "url('/front-img.jpg')",
        backgroundPosition: "bottom",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute top-2 left-4 no-underline mt-3">
        <span className="  py-2 text-[#CFFF5E] rounded-md font-medium  text-3xl">
          <span className="text-sm">
            <FaDotCircle />
          </span>
          <span className="">
            <span className="font-archivo font-extrabold text-white">LUDI</span>
          </span>
        </span>
      </div>
      <div className="w-full">
        <h2 className="text-3xl font-archivo font-semibold text-center mb-8  text-slate-100">
          {successMessage === "" ? "Create an account" : ""}
        </h2>

        {successMessage === "" ? (
          <div className="flex flex-col w-full justify-center items-center ">
            <p className="mb-2 text-slate-100">Username</p>
            <input
              type="text"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              required
              autoFocus
              placeholder="Enter username..."
              style={{ border: "1px solid rgb(148, 163, 184, 0.5)" }}
              className="text-lg h-12  bg-slate-200 rounded-full font-semibold mb-2 px-5 w-11/12 max-w-md"
            />
            <p className="mb-2 mt-4 text-slate-100">Password</p>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              value={password}
              required
              placeholder="Enter password..."
              style={{ border: "1px solid rgb(148, 163, 184, 0.5)" }}
              className="text-lg h-12  bg-slate-200 rounded-full font-semibold mb-5 px-5 w-11/12 max-w-md"
              onKeyDown={handleKeyDown}
            />
            {errorMessage !== "" ? (
              <p className="text-[#EA3546] h-2">{errorMessage}</p>
            ) : (
              <p className="h-1"></p>
            )}
            <button
              onClick={handleSubmit}
              style={{ border: "1px solid rgb(148, 163, 184, 0.5)" }}
              className="text-xl h-14 w-11/12 max-w-md bg-[#CFFF5E] rounded-full font-archivo font-semibold mt-16 text-black"
            >
              Create account
            </button>{" "}
            <div className="flex mt-10 justify-center items-center">
              <p className="text-slate-100">Already have an account?</p>
              <Link
                href={"/login"}
                className="no-underline font-archivo font-extrabold ml-2 text-slate-100 "
              >
                Log in here
              </Link>
            </div>
          </div>
        ) : (
          <div className="px-5 h-full flex flex-col justify-center">
            <div className="rounded-lg px-10 text-slate-950 flex flex-col justify-center items-center mb-10 text-2xl font-semibold  hover:cursor-pointer">
              <h2 className="text-center leading-snug text-slate-100">
                Congrats!
              </h2>
              <p className="text-2xl text-slate-100 mt-4 text-center">
                You will now be
                <p className="no-underline text-slate-100">redirected!</p>
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="text-sm mt-6 absolute bottom-8 right-0 left-0">
        <div className="flex justify-center items-center text-slate-100">
          <p className="mr-3 font-semibold text-slate-100">Terms of use</p>
          <p className="ml-3 font-semibold text-slate-100">Privacy Policy</p>
        </div>
        <p className="text-center text-slate-100 mt-4">
          2024 All rights reserved
        </p>
      </div>
    </div>
  );
}
