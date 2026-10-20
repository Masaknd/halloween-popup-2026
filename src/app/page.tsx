import { Hero } from "@/components/hero/Hero";
import { BatSwarm } from "@/components/sections/BatSwarm";
import { Collage } from "@/components/sections/Collage";
import { Details } from "@/components/sections/Details";
import { Footer } from "@/components/sections/Footer";
import { Location } from "@/components/sections/Location";
import { Marquee } from "@/components/sections/Marquee";
import { Tickets } from "@/components/sections/Tickets";
import { Cursor } from "@/components/ui/Cursor";
import { Header } from "@/components/ui/Header";
import { Loader } from "@/components/ui/Loader";
import { SmoothScroll } from "@/components/ui/SmoothScroll";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Loader />
      <Cursor />
      <Header />
      <main>
        <Hero />
        <Marquee />
        <Details />
        <BatSwarm />
        <Collage />
        <Marquee tone="orange" />
        <Tickets />
        <Location />
      </main>
      <Footer />
      <div className="grain" aria-hidden />
    </>
  );
}
