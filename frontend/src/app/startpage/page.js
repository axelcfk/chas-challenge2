import Navbar from "../components/Navbar";
import Link from "next/link";
import SlideMenu, {
  SlideMenuMixCard,
  SlideMenuMovieCard,
} from "../components/SlideMenu";

//TODO: texten i rutan ska var lite större

export default function Startpage() {
  return (
    <div className="bg-[#3F295E] pb-8">
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
      <div className="list-container flex justify-center flex-col text-white mt-[-240px] space-y-8">
        <h2 className="ml-4 text-xl">Search history</h2>
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
        <div className="ml-4 text-xl">Popular today</div>
        <SlideMenu>
          <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
          <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
          <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
          <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
          <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
          <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
          <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
          <SlideMenuMovieCard poster={"/troll-poster.jpg"} />
        </SlideMenu>
        <h2 className="ml-4 text-xl">Movie mixes</h2>
        <div>
          <SlideMenu>
            <SlideMenuMixCard  imgSrc={"/mix-img.png"}></SlideMenuMixCard>
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
    </div>
  );
}
