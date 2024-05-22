"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import MovieSearch from "../searchtest/page";
import { FaDotCircle } from "react-icons/fa";
import InputField from "../chatpage2/inputField";
import { useHandleQuerySubmit } from "../hooks/useHandleQuerySubmit";
import { useSearch } from "../context/SearchContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // Separate state for search bar
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { input, setInput } = useSearch();
  const { handleQuerySubmit } = useHandleQuerySubmit();

  const handleInputChange = (e) => setInput(e.target.value);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUserId = localStorage.getItem("userId");
    setIsLoggedIn(!!token);
    if (token) {
      setUserId(savedUserId);
    }
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleQuerySubmit();
    }
  };

  useEffect(() => {
    if (isOpen || isSearchOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isOpen, isSearchOpen]);

  return (
    <nav className="bg-[#110A1A] text-white w-full sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {!isSearchOpen && (
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link className="no-underline" href="/startpage">
                  <span className="font-bebas flex justify-center items-center hover:cursor-pointer px-2 py-2 mr-1 text-white rounded-md font-medium cursor-pointer text-3xl text-center">
                    <span className="text-xl">
                      <FaDotCircle />
                    </span>
                    <span className="font-bebas no-underline">MovieAI</span>
                  </span>
                </Link>
              </div>
            </div>
          )}

          <div className="flex items-center md:hidden w-full justify-end">
            <MovieSearch
              isSearchOpen={isSearchOpen}
              setIsSearchOpen={setIsSearchOpen}
            />
            {!isSearchOpen && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-lighter-purple focus:outline-none border border-solid focus:bg-lighter-purple focus:text-white bg-deep-purple ml-4"
                aria-label="Burger Menu"
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
            )}
          </div>

          {/* Menu items for smaller screens */}
          <div
            className={`menu-modal ${
              isOpen ? "open" : "close"
            } flex-col md:hidden z-10 absolute w-full left-0 right-0`}
          >
            <div className="mt-16">
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
                      <span className=" px-3 py-2 rounded-md text-3xl font-semibold cursor-pointer block text-center text-white">
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
                    <span className="px-3 py-8 rounded-md text-3xl font-semibold cursor-pointer block text-center text-white">
                      Log Out
                    </span>
                  </Link>
                </>
              )}
              <Link href="/about" style={{ textDecoration: "none" }}>
                <span className=" px-3 py-2 rounded-md text-3xl font-semibold cursor-pointer block text-center text-white">
                  About
                </span>
              </Link>
            </div>
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
                <Link href="/services" style={{ textDecoration: "none" }}>
                  <span className="hover:bg-lighter-purple px-3 py-2 rounded-md text-base font-medium cursor-pointer block text-center text-white">
                    About
                  </span>
                </Link>
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
          </div>
        </div>
        <InputField
          handleInputChange={handleInputChange}
          handleQuerySubmit={handleQuerySubmit}
          heightDiv={"h-10"}
          placeholder={"AI SEARCH"}
        />
      </div>
    </nav>
  );
}
