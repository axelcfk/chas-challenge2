"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { FaDotCircle } from "react-icons/fa";

import Link from "next/link";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  async function handleSignIn(e) {
    e.preventDefault();
    const result = await login(username, password);
    if (result.success) {
      router.push("/startpage");
    } else {
      alert(result.message);
    }
  }

  return (
    <div className="h-full bg-black flex flex-col justify-between items-center px-5">
      <Link className="no-underline mt-3" href="/startpage">
        <span className="font-bebas hover:cursor-pointer py-2 text-white rounded-md font-medium cursor-pointer text-3xl">
          <span className="text-xl">
            <FaDotCircle />
          </span>
          <span className="font-archivo font-extrabold no-underline">
            BAMMS
          </span>
        </span>
      </Link>
      <div className="absolute bottom-20">
        {/* <div className="flex justify-center">
          <span className="text-6xl">
            <FaDotCircle />
          </span>
          <h1 className="font-bebas no-underline text-7xl">BAMMS</h1>
        </div> */}

        <h2 className="text-3xl font-semibold text-center mb-8 mt-28 text-slate-100">
          Sign in
        </h2>
        <div className="flex flex-col mt-20">
          <p className="mb-2 text-slate-100">Username</p>
          <input
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            type="text"
            required
            autoFocus
            placeholder="Enter username..."
            style={{ border: "1px solid rgb(148, 163, 184, 0.5)" }}
            className="text-lg h-12 bg-slate-200 rounded-xl font-semibold mb-2 px-5"
          />
          <p className="mb-2 mt-4 text-slate-100">Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            required
            type="password"
            placeholder="Enter password..."
            style={{ border: "1px solid rgb(148, 163, 184, 0.5)" }}
            className="text-lg h-12 bg-slate-200 rounded-xl font-semibold mb-2 px-5"
          />
          <p className="underline text-sm text-slate-100 text-right">
            Forgot password?
          </p>
          <button
            onClick={handleSignIn}
            style={{ border: "1px solid rgb(148, 163, 184, 0.5)" }}
            className="text-xl h-14 w-full bg-[#CFFF5E] rounded-full font-semibold mt-14"
          >
            Log in
          </button>
        </div>
        <div className="flex mt-10 text-slate-100 justify-center items-center">
          <p> Don't have an account?</p>
          <p className="underline ml-2 text-slate-100 ">
            <Link href={"/create-account"} className="text-slate-50">
              Create one here{" "}
            </Link>
          </p>
        </div>
      </div>
      {/* <div className="text-sm mt-2 absolute bottom-2">
        <div className="flex justify-center items-center mt-16 mb-5 text-slate-100">
          <p className="mr-3 font-semibold">Terms of use</p>
          <p className="ml-3 font-semibold">Privacy Policy</p>
        </div>
        <p className="text-center text-slate-100">2024 All rights reserved</p>
      </div> */}
    </div>
  );
}
