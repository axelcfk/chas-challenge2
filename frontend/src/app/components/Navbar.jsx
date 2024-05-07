"use client";
import Link from "next/link";
import { useState } from "react";
import MovieSearch from "../searchtest/page";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-deep-purple text-white">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex-1 flex items-center justify-between">
            <div className="flex-shrink-0">
              <Link href="/">
                <span className="font-bold cursor-pointer">Logo</span>
              </Link>
            </div>
            <div>
              <MovieSearch />
            </div>
            <div className="flex items-center sm:hidden">
              {/* Burger icon */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-lighter-purple focus:outline-none focus:bg-lighter-purple focus:text-white"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
            {/* Conditionally render the links in a vertical menu */}
            <div
              className={`${
                isOpen ? "flex" : "hidden"
              } flex-col sm:flex-row sm:flex sm:items-center sm:space-x-4 absolute sm:relative bg-deep-purple w-full sm:w-auto sm:bg-transparent left-0 sm:left-auto right-0 top-16 sm:top-auto`}
            >
              <Link href="/login">
                <span className="hover:bg-lighter-purple px-3 py-2 rounded-md text-base font-medium cursor-pointer block text-center">
                  Log in
                </span>
              </Link>
              <Link href="/chatpage2">
                <span className="hover:bg-lighter-purple px-3 py-2 rounded-md text-base font-medium cursor-pointer block text-center">
                  Ai search
                </span>
              </Link>
              <Link href="/profile">
                <span className="hover:bg-lighter-purple px-3 py-2 rounded-md text-base font-medium cursor-pointer block text-center">
                  Account
                </span>
              </Link>
              <Link href="/services">
                <span className="hover:bg-lighter-purple px-3 py-2 rounded-md text-base font-medium cursor-pointer block text-center">
                  About
                </span>
              </Link>
              <Link href="/contact">
                <span className="hover:bg-lighter-purple px-3 py-2 rounded-md text-base font-medium cursor-pointer block text-center">
                  Log Out
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
