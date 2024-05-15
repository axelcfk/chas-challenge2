"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { host } from "../utils";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleSignIn(e) {
    e.preventDefault();

    try {
      const response = await fetch(`${host}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        throw new Error("Failed to sign in");
      }

      const data = await response.json();

      if (data.token && data.userId) {
        // Kolla så  att både token och userId finns
        localStorage.setItem("token", data.token); // Lägg till token i local storage
        localStorage.setItem("userId", data.userId); // Lägg till userId i local storage
        router.push("/new-user"); // Gå till new user page
      } else {
        throw new Error("Authentication failed, no token or userId received.");
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <div
      className="py-10 px-5 h-screen w-screen flex flex-col justify-between"
      style={{
        backgroundImage: "url('/front-img.jpg')",
        backgroundPosition: "bottom",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div>
        <h2 className="text-3xl font-semibold text-center mb-16 text-slate-100">
          LO
          <br />
          GO
        </h2>
        <h2 className="text-2xl font-semibold text-center mb-10 text-slate-100 ">
          Login
        </h2>
        <div className="flex flex-col ">
          <p className="mb-2 text-slate-100">Email</p>
          <input
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            type="email"
            required
            autoFocus
            placeholder="Enter your email address"
            style={{ border: "1px solid rgb(148, 163, 184, 0.5)" }}
            className="text-lg h-12 w-full bg-slate-200 rounded-xl font-semibold mb-2 px-5"
          />
          <p className="mb-2 text-slate-100">Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            required
            type="password"
            placeholder="Enter your password"
            style={{ border: "1px solid rgb(148, 163, 184, 0.5)" }}
            className="text-lg h-12 w-full bg-slate-200 rounded-xl font-semibold mb-5 px-5"
          />
          <button
            onClick={handleSignIn}
            style={{ border: "1px solid rgb(148, 163, 184, 0.5)" }}
            className="text-xl h-14 w-full bg-slate-50 rounded-full font-semibold"
          >
            Log in
          </button>{" "}
          <p className="underline text-sm  mt-2 text-slate-100">
            Forgot password?
          </p>
        </div>
        <div className="flex mt-10 text-slate-100 justify-center items-center">
          <p> Don't have an account?</p>
          <p className="underline ml-2 text-slate-100 ">
            <Link href={"/create-account"}>Create one here </Link>
          </p>
        </div>
      </div>
      <div className=" ">
        <div className="flex justify-center items-center mt-20 mb-5 text-slate-100">
          <p className="mr-3 font-semibold">Terms of use</p>
          <p className="ml-3 font-semibold">Privacy Policy</p>
        </div>
        <p className="text-center text-slate-100">2024 All rights reserved</p>
      </div>
    </div>
  );
}