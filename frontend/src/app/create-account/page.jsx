"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { FaDotCircle } from "react-icons/fa";

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
      handleSubmit(event)
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
      const response = await fetch("http://localhost:3010/users", {
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
      className="h-full bg-black flex flex-col justify-between items-center px-5 pt-40"
      style={{
        backgroundImage: "url('/front-img.jpg')",
        backgroundPosition: "bottom",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute top-2 left-4 no-underline mt-3">
        <span className="  py-2 text-[#CFFF5E] rounded-md font-medium  text-3xl">
          <span className="text-xl">
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
          <div className="flex flex-col w-full ">
            <p className="mb-2 text-slate-100">Username</p>
            <input
              type="text"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              required
              autoFocus
              placeholder="Enter username..."
              style={{ border: "1px solid rgb(148, 163, 184, 0.5)" }}
              className="text-lg h-12  bg-slate-200 rounded-full font-semibold mb-2 px-5"
            />
            <p className="mb-2 mt-4 text-slate-100">Password</p>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              value={password}
              required
              placeholder="Enter password..."
              style={{ border: "1px solid rgb(148, 163, 184, 0.5)" }}
              className="text-lg h-12  bg-slate-200 rounded-full font-semibold mb-5 px-5"
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
              className="text-xl h-14 w-full bg-[#CFFF5E] rounded-full font-archivo font-semibold mt-16"
            >
              Create account
            </button>{" "}
            {/* <button
              style={{ border: "1px solid rgb(148, 163, 184, 0.5)" }}
              className="text-xl h-14 w-full bg-slate-50 rounded-full font-semibold mt-2 hover:bg-slate-200"
            >
              <div className="flex justify-center items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20px"
                  height="20px"
                  viewBox="-3 0 262 262"
                  preserveAspectRatio="xMidYMid"
                >
                  <path
                    d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                    fill="#4285F4"
                  />
                  <path
                    d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                    fill="#34A853"
                  />
                  <path
                    d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                    fill="#FBBC05"
                  />
                  <path
                    d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                    fill="#EB4335"
                  />
                </svg>
                <span className="ml-4  text-slate-900 ">
                  Continue with Google
                </span>
              </div>
            </button>{" "} */}
            <div className="flex mt-10 justify-center items-center">
              <p className="text-slate-100">Do you already have an account?</p>
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
