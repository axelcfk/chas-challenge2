"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import MovieSearch from "../searchtest/page";
import { FaMagnifyingGlass } from "react-icons/fa6";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUserId = localStorage.getItem("userId");
    setIsLoggedIn(!!token);
    if (token) {
      setUserId(savedUserId);
    }
  }, []);

  return (
    <nav className="bg-deep-purple text-white">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <span className="font-bold cursor-pointer">Logo</span>
              </Link>
            </div>
            <div className="ml-4">
              <MovieSearch />
            </div>
          </div>

          {/* This section becomes visible only on small screens */}
          <div className="flex items-center md:hidden">
            {/* AI Search Link */}
            <Link href="/chatpage2" style={{ textDecoration: "none" }}>
              <span className="hover:bg-lighter-purple px-3 py-2 mr-1.5 text-white rounded-md text-base font-medium cursor-pointer block text-center">
                AI
                <span style={{ marginLeft: "0.5em" }}>
                  <FaMagnifyingGlass />
                </span>
              </span>
            </Link>

            {/* Burger icon */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-lighter-purple focus:outline-none border border-solid focus:bg-lighter-purple focus:text-white bg-deep-purple"
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

          {/* Menu items for smaller screens */}
          <div
            className={`${
              isOpen ? "flex" : "hidden"
            } flex-col md:hidden z-10 absolute bg-deep-purple w-full left-0 right-0 top-16`}
          >
            {!isLoggedIn ? (
              <Link href="/login" style={{ textDecoration: "none" }}>
                <span className="hover:bg-lighter-purple px-3 py-2 rounded-md text-base font-medium cursor-pointer block text-center text-white">
                  Log in
                </span>
              </Link>
            ) : (
              <>
                {userId && (
                  <Link
                    href={`/profile/${userId}`}
                    style={{ textDecoration: "none" }}
                  >
                    <span className="hover:bg-lighter-purple px-3 py-2 rounded-md text-base font-medium cursor-pointer block text-center text-white">
                      Profile
                    </span>
                  </Link>
                )}
                <Link
                  href="/"
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                    setIsLoggedIn(false);
                    setUserId(null);
                  }}
                  style={{ textDecoration: "none" }}
                >
                  <span className="hover:bg-lighter-purple px-3 py-2 rounded-md text-base font-medium cursor-pointer block text-center text-white">
                    Log Out
                  </span>
                </Link>
              </>
            )}
            <Link href="/services" style={{ textDecoration: "none" }}>
              <span className="hover:bg-lighter-purple px-3 py-2 rounded-md text-base font-medium cursor-pointer block text-center text-white">
                About
              </span>
            </Link>
          </div>

          {/* Ordinary Navbar for larger screens */}
          <div className="hidden md:flex items-center">
            {!isLoggedIn ? (
              <Link href="/login" style={{ textDecoration: "none" }}>
                <span className="hover:bg-lighter-purple px-3 py-2 rounded-md text-base font-medium cursor-pointer block text-center text-white">
                  Log in
                </span>
              </Link>
            ) : (
              <>
                {userId && (
                  <Link
                    href={`/profile/${userId}`}
                    style={{ textDecoration: "none" }}
                  >
                    <span className="hover:bg-lighter-purple px-3 py-2 rounded-md text-base font-medium cursor-pointer block text-center text-white">
                      Profile
                    </span>
                  </Link>
                )}
                <Link
                  href="/"
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                    setIsLoggedIn(false);
                    setUserId(null);
                  }}
                  style={{ textDecoration: "none" }}
                >
                  <span className="hover:bg-lighter-purple px-3 py-2 rounded-md text-base font-medium cursor-pointer block text-center text-white">
                    Log Out
                  </span>
                </Link>
              </>
            )}
            <Link href="/services" style={{ textDecoration: "none" }}>
              <span className="hover:bg-lighter-purple px-3 py-2 rounded-md text-base font-medium cursor-pointer block text-center text-white">
                About
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
