"use client";

import Link from "next/link";
import { FaDotCircle } from "react-icons/fa";

export default function FirstPage() {
  return (
    <div className="w-screen h-screen bg-[#110A1A] flex flex-col px-5">
      <div className="flex flex-col items-center py-40">
        <Link className="no-underline" href="/startpage">
          <span className="font-bebas flex justify-center items-center hover:cursor-pointer px-2 py-2 mr-1 text-white rounded-md font-medium cursor-pointer text-3xl text-center">
            <span className="text-6xl">
              <FaDotCircle />
            </span>
            <h1 className="font-bebas no-underline text-7xl">BAMMS</h1>
          </span>
        </Link>
        <p className="text-slate-100 mt-2">Best AI Movie Matcher Sweden</p>
      </div>

      <div className="flex flex-col items-center w-full">
        <button className="text-xl h-14 w-11/12 max-w-md bg-slate-100 rounded-full font-semibold mb-4 text-slate-900 hover:bg-slate-200 shadow-lg">
          <Link href="create-account" className="no-underline text-slate-900">
            Create an account
          </Link>
        </button>
        <button
          style={{ border: "1px solid white" }}
          className="text-xl text-slate-100 h-14 w-11/12 max-w-md bg-transparent rounded-full font-semibold shadow-lg"
        >
          <Link href="login" className="no-underline text-slate-100">
            Log in
          </Link>
        </button>
      </div>
    </div>
  );
}
