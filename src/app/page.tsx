import { Fog } from "@/components/fog/Fog";
import { Hero } from "@/components/hero/Hero";
import { BatSwarm } from "@/components/sections/BatSwarm";
import { Details } from "@/components/sections/Details";
import { Footer } from "@/components/sections/Footer";
import { Location } from "@/components/sections/Location";
import { Marquee } from "@/components/sections/Marquee";
import { Tickets } from "@/components/sections/Tickets";
import { WitchingHours } from "@/components/sections/WitchingHours";
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
        <WitchingHours />
        <Marquee tone="soot" />
        <Tickets />
        <Location />
      </main>
      <Footer />
      <Fog />
      <div className="vignette" aria-hidden />
      <div className="grain" aria-hidden />
    </>
  );
}
