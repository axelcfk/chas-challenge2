import Link from "next/link";
import MovieSearch from "../searchtest/page";

export default function Navbar() {
  return (
    <main className="text-white bg-gray-800 flex justify-between py-4 px-5">
      <div className="logo flex items-center">
        <Link href="/">Logo</Link>
      </div>
      <div className="flex items-center ">
        <MovieSearch />
      </div>
      <div>
        <ul>
          <li>
            <Link href="/chatpage2">Ai search</Link>
          </li>
          <li>
            <Link href="/services">About Us</Link>
          </li>
          <li>
            <Link href="/contact">Log Out</Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
