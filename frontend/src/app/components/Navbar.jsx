"use client";

import Link from "next/link";
import InputField from "../chatpage2/inputField";
import MovieSearch from "../searchtest/page";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useHandleQuerySubmit } from "../hooks/useHandleQuerySubmit";
import { useSearch } from "../context/SearchContext";
import { FaDotCircle } from "react-icons/fa";
import { FaMagnifyingGlass, FaChevronUp } from "react-icons/fa6";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchType, setSearchType] = useState("");
  const [loading, setLoading] = useState(false);
  const { isLoggedIn, user, logout, checkAuth } = useAuth();
  const { input, setInput } = useSearch();
  const { handleQuerySubmit: originalHandleQuerySubmit } =
    useHandleQuerySubmit();
  const router = useRouter();
  const pathname = usePathname();
  const { resetState } = useSearch();

  useEffect(() => {
    if (isOpen || isSearchOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isOpen, isSearchOpen]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    console.log("User object:", user);
    console.log("isLoggedIn:", isLoggedIn);
  }, [user, isLoggedIn]);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    router.push("/");
  };

  const handleSearchTypeSelect = (type) => {
    setSearchType(type);
    setIsSearchOpen(true);
    setDropdownOpen(false);
  };

  const handleQuerySubmit = async (query) => {
    setLoading(true);
    await originalHandleQuerySubmit(query);
    setLoading(false);
    setIsSearchOpen(false); // Close the search bar after initiating the search
  };

  if (
    !isLoggedIn ||
    ["/firstpage", "/login", "/create-account"].includes(pathname)
  ) {
    return null;
  }

  return (
    <nav className="text-white fixed top-0 left-0 right-0 z-50">
      <div
        className="backdrop-blur-md w-full h-full absolute top-0 left-0 right-0 bottom-0"
        style={{
          backdropFilter: "blur(30px)",
        }}
      ></div>
      <div className="relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16 ">
          {!isSearchOpen && (
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link className="no-underline" href="/startpage">
                  <span
                    onClick={() => {
                      resetState();
                    }}
                    className="font-bebas flex justify-center items-center hover:cursor-pointer px-2 py-2 mr-1 text-white rounded-md font-medium cursor-pointer text-3xl text-center"
                  >
                    <span className="text-sm text-[#CFFF5E] mt-1">
                      <FaDotCircle />
                    </span>
                    <span className="font-archivo font-extrabold no-underline">
                      LUDI
                    </span>
                  </span>
                </Link>
              </div>
            </div>
          )}

          <div className="flex items-center md:hidden w-full justify-end">
            <div className="relative">
              {!isSearchOpen && (
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-400 focus:outline-none border-none focus:text-white bg-transparent ml-4"
                  aria-label="Search Menu"
                >
                  <FaMagnifyingGlass className="h-6 w-6" />
                </button>
              )}
              {dropdownOpen && (
                <div
                  className="absolute right-0 p-8 mt-2 rounded-br-2xl rounded-bl-2xl z-20 w-60"
                  style={{
                    border: "0.9px solid grey",
                    borderTop: 0,
                    background: "rgba(17, 10, 26, 0.8)",
                  }}
                >
                  <button
                    onClick={() => handleSearchTypeSelect("ai")}
                    className="flex gap-4 justify-center items-center text-base bg-[#CFFF5E] rounded-full border-none px-4 py-2 h-12 font-archivo font-bold text-slate-950 hover:bg-gray-100 w-full text-left"
                  >
                    <span className="text-base font-archivo font-bold text-slate-950 uppercase">
                      AI-Search
                    </span>{" "}
                    <FaMagnifyingGlass className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleSearchTypeSelect("movie")}
                    className="flex gap-4 justify-center items-center text-base bg-[#CFFF5E] px-4 mt-4 py-2 font-archivo border-none font-bold h-12 rounded-full text-slate-950 hover:bg-gray-100 w-full text-left"
                    style={{
                      border: "0.9px solid grey",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <span className="text-base font-archivo font-bold text-slate-950 uppercase">
                      Database Search{" "}
                    </span>
                    <FaMagnifyingGlass className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            {isSearchOpen && searchType === "movie" && (
              <MovieSearch
                isSearchOpen={isSearchOpen}
                setIsSearchOpen={setIsSearchOpen}
              />
            )}
            {isSearchOpen && searchType === "ai" && (
              <div className="mt-2 w-full">
                {loading ? (
                  <>
                    <InputField
                      handleInputChange={(e) => setInput(e.target.value)}
                      handleQuerySubmit={handleQuerySubmit}
                      heightDiv={"h-10"}
                      placeholder={""}
                      input={input}
                      setInput={setInput}
                      loading={loading}
                    />
                    <button
                      onClick={() => setIsSearchOpen(false)}
                      className="absolute top-2 left-2 flex items-center justify-center p-2 rounded-md text-white hover:text-gray-400 focus:outline-none border-none focus:text-white bg-transparent mt-2"
                      aria-label="Close Search"
                    >
                      <FaChevronUp className="h-6 w-6" />
                    </button>
                  </>
                ) : (
                  <>
                    <InputField
                      handleInputChange={(e) => setInput(e.target.value)}
                      handleQuerySubmit={handleQuerySubmit}
                      heightDiv={"h-10"}
                      placeholder={"Search with LUDI..."}
                      input={input}
                      setInput={setInput}
                      loading={loading}
                    />
                    <button
                      onClick={() => setIsSearchOpen(false)}
                      className="absolute top-2 left-2 flex items-center justify-center p-2 rounded-md text-white hover:text-gray-400 focus:outline-none border-none focus:text-white bg-transparent mt-2"
                      aria-label="Close Search"
                    >
                      <FaChevronUp className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {!isSearchOpen && (
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-400 focus:outline-none border-none focus:text-white bg-transparent ml-4"
                aria-label="Burger Menu"
              >
                <svg
                  className="h-8 w-8"
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
          )}

          <div
            className={`menu-modal ${
              isOpen ? "open" : "close"
            } flex-col md:hidden z-10 absolute w-full left-0 right-0`}
          >
            <div className="mt-16">
              {isLoggedIn ? (
                <>
                  <Link
                    onClick={() => {
                      resetState();
                      setIsOpen(false);
                    }}
                    href="/chatpage2"
                    style={{ textDecoration: "none" }}
                  >
                    <span className="px-3 py-8 text-4xl rounded-md font-extrabold font-archivo cursor-pointer block text-center text-white">
                      AI-SEARCH
                    </span>
                  </Link>
                  <Link
                    onClick={() => {
                      resetState();
                      setIsOpen(false);
                    }}
                    href="/startpage"
                    style={{ textDecoration: "none" }}
                  >
                    <span className="px-3 py-8 text-4xl rounded-md font-extrabold font-archivo cursor-pointer block text-center text-white">
                      Start{" "}
                    </span>
                  </Link>
                  <Link
                    onClick={() => {
                      resetState();
                      setIsOpen(false);
                    }}
                    href="/about"
                    style={{ textDecoration: "none" }}
                  >
                    <span className="px-3 py-8 text-4xl rounded-md font-extrabold font-archivo cursor-pointer block text-center text-white">
                      About
                    </span>
                  </Link>
                  {user && user.id && (
                    <Link
                      onClick={() => {
                        resetState();
                        setIsOpen(false);
                      }}
                      href={`/profile/${user.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <span className="px-3 py-8 text-4xl rounded-md font-extrabold font-archivo cursor-pointer block text-center text-white">
                        Profile
                      </span>
                    </Link>
                  )}
                  <Link
                    href="/"
                    onClick={handleLogout}
                    style={{ textDecoration: "none" }}
                  >
                    <span className="px-3 mt-60 text-xl rounded-md font-extrabold font-archivo cursor-pointer block text-center text-white">
                      Log Out
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/about" style={{ textDecoration: "none" }}>
                    <span className="px-3 py-2 rounded-md text-base font-medium cursor-pointer block text-center text-white">
                      About
                    </span>
                  </Link>
                  <Link href="/login" style={{ textDecoration: "none" }}>
                    <span className="px-3 py-2 rounded-md text-base font-medium cursor-pointer block text-center text-white">
                      Log in
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center justify-between w-full">
            <div className="flex items-center"></div>
            <div className="flex items-center">
              {isLoggedIn && (
                <>
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-400 focus:outline-none border-none focus:text-white bg-transparent ml-4"
                      aria-label="Search Menu"
                    >
                      <FaMagnifyingGlass className="h-6 w-6" />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                        <button
                          onClick={() => handleSearchTypeSelect("ai")}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          AI Search
                        </button>
                        <button
                          onClick={() => handleSearchTypeSelect("movie")}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          Movie Search
                        </button>
                      </div>
                    )}
                  </div>
                  {isSearchOpen && searchType === "movie" && (
                    <MovieSearch
                      isSearchOpen={isSearchOpen}
                      setIsSearchOpen={setIsSearchOpen}
                    />
                  )}
                  {isSearchOpen && searchType === "ai" && (
                    <div className="mt-2 w-full">
                      {loading ? (
                        <>
                          <InputField
                            handleInputChange={(e) => setInput(e.target.value)}
                            handleQuerySubmit={handleQuerySubmit}
                            heightDiv={"h-10"}
                            placeholder={"AI SEARCH"}
                            input={input}
                            setInput={setInput}
                          />
                          <button
                            onClick={() => setIsSearchOpen(false)}
                            className="flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white focus:outline-none border-none focus:text-white bg-transparent mt-2"
                            aria-label="Close Search"
                          >
                            <FaChevronUp className="h-6 w-6" />
                          </button>
                        </>
                      ) : (
                        <>
                          <InputField
                            handleInputChange={(e) => setInput(e.target.value)}
                            handleQuerySubmit={handleQuerySubmit}
                            heightDiv={"h-10"}
                            placeholder={"AI SEARCH"}
                            input={input}
                            setInput={setInput}
                          />
                          <button
                            onClick={() => setIsSearchOpen(false)}
                            className="flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white focus:outline-none border-none focus:text-white bg-transparent mt-2"
                            aria-label="Close Search"
                          >
                            <FaChevronUp className="h-6 w-6" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
              <Link href="/about" style={{ textDecoration: "none" }}>
                <span className="hover:bg-lighter-purple px-3 py-2 rounded-md text-xl font-bold font-archivo cursor-pointer block text-center text-white">
                  About
                </span>
              </Link>
              {user && user.id && (
                <Link
                  href={`/profile/${user.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <span className="hover:bg-lighter-purple px-3 py-2 rounded-md text-base font-medium cursor-pointer block text-center text-white">
                    Profile
                  </span>
                </Link>
              )}
              <Link
                href="/"
                onClick={handleLogout}
                style={{ textDecoration: "none" }}
              >
                <span className="hover:bg-lighter-purple px-3 py-2 rounded-md text-xl font-bold font-archivo cursor-pointer block text-center text-white">
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
