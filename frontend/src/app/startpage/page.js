import Navbar from "../components/Navbar";
import Link from "next/link";
import SlideMenu, { SlideMenuMixCard } from "../components/SlideMenu";

//TODO: texten i rutan ska var lite större

export default function Startpage() {
  return (
    <>
      <Navbar />
      <div className="wrapper">
      <main className="startpage-main text-white flex justify-center">
        <div className="flex align-items-center justify-center pt-28 px-4 container">
          <div className="hero-container">
            <div className="flex flex-col">
              <p className="hero-p">
                Don't know <br />
                what to watch?
              </p>
              <p className="hero-p">
                Let CinemAI <br />
                help you!
              </p>
              <Link href={"/chatpage2"}>
                <button className="hero-btn">FIND A MOVIE</button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      </div>
      <div className="list-container flex justify-center flex-col text-white">
        <div>Search history slide</div>
        <div>Popular today slide</div>
        <div>
          <SlideMenu>
            <SlideMenuMixCard imgSrc={"/mix-img.png"}></SlideMenuMixCard>
            <SlideMenuMixCard imgSrc={"/mix-img.png"}></SlideMenuMixCard>
            <SlideMenuMixCard imgSrc={"/mix-img.png"}></SlideMenuMixCard>
            <SlideMenuMixCard imgSrc={"/mix-img.png"}></SlideMenuMixCard>
            <SlideMenuMixCard imgSrc={"/mix-img.png"}></SlideMenuMixCard>
            <SlideMenuMixCard imgSrc={"/mix-img.png"}></SlideMenuMixCard>
            <SlideMenuMixCard imgSrc={"/mix-img.png"}></SlideMenuMixCard>
            <SlideMenuMixCard imgSrc={"/mix-img.png"}></SlideMenuMixCard>
          </SlideMenu>
        </div>
      </div>
    </>
  );
}
