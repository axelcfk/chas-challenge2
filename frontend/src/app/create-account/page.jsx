"use client";

import Link from "next/link";
import { useState } from "react";
import { host } from "../utils";

export default function CreateAccount() {
  const [errorMessage, setErrorMessage] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage(""); // Clear previous error messages

    try {
      const response = await fetch(`${host}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
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
      router.push("/new-user"); // Gå till new user page
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
    }
  }

  return (
    <div
      className="py-10 px-5 h-screen w-screen flex flex-col justify-between bg-slate-950"
      style={{
        backgroundImage: "url('/front-img.jpg')",
        backgroundPosition: "bottom",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div>
        <h2 className="text-3xl font-semibold  text-center text-slate-100 mb-16">
          LO
          <br />
          GO
        </h2>
        <h2 className="text-2xl font-semibold text-center text-slate-100 mb-10">
          {successMessage === "" ? "Create an account" : ""}
        </h2>

        {successMessage === "" ? (
          <div className="flex flex-col ">
            <p className="mb-2 text-slate-100">Email</p>
            <input
              type="email"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              required
              autoFocus
              placeholder="Enter email address"
              style={{ border: "1px solid rgb(148, 163, 184, 0.5)" }}
              className="text-lg h-12 w-full bg-slate-200 rounded-xl font-semibold mb-2 px-5"
            />
            <p className="mb-2 text-slate-100">Password</p>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              value={password}
              required
              placeholder="Enter password"
              style={{ border: "1px solid rgb(148, 163, 184, 0.5)" }}
              className="text-lg h-12 w-full bg-slate-200 rounded-xl font-semibold mb-5 px-5"
            />
            {errorMessage !== "" ? (
              <p className="text-red-800 h-2">{errorMessage}</p>
            ) : (
              <p className="h-1"></p>
            )}
            <button
              onClick={handleSubmit}
              style={{ border: "1px solid rgb(148, 163, 184, 0.5)" }}
              className="text-xl h-14 w-full bg-slate-50 rounded-full font-semibold  text-slate-900 hover:bg-slate-200"
            >
              Create account
            </button>{" "}
            <button
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
            </button>{" "}
            <div className="flex mt-10 justify-center">
              <p className="text-slate-100">Do you already have an account?</p>
              <Link href={"/login"} className="underline ml-2 text-slate-100">
                Log in here
              </Link>
            </div>
          </div>
        ) : (
          <div className="px-5  h-full flex flex-col justify-center">
            <div className="rounded-lg px-10 text-slate-950 flex flex-col justify-center items-center mb-10 text-2xl font-semibold  hover:cursor-pointer">
              <h2 className="text-center leading-snug text-slate-100">
                Congrats
              </h2>
              <p className="text-2xl text-slate-100 mt-4 text-center">
                You can now{" "}
                <Link className="no-underline text-blue-400" href="/login">
                  log in!
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
      <div className=" ">
        <div className="flex justify-center items-center mt-20 mb-5 text-slate-100">
          <p className="mr-3 font-semibold text-slate-100">Terms of use</p>
          <p className="ml-3 font-semibold text-slate-100">Privacy Policy</p>
        </div>
        <p className="text-center text-slate-100">2024 All rights reserved</p>
      </div>
    </div>
  );
}
