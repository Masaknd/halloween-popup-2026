import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, IM_Fell_English, UnifrakturMaguntia } from "next/font/google";
import localFont from "next/font/local";
import { OrganicDefs } from "@/components/ui/OrganicDefs";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});
const cinzel = Cinzel({ variable: "--font-cinzel", weight: ["400", "600"], subsets: ["latin"] });
const fraktur = UnifrakturMaguntia({ variable: "--font-fraktur", weight: "400", subsets: ["latin"] });
// Headings and titles: IM Fell English (Igino Marini, SIL OFL), a revival of 17th-century Fell types
const fell = IM_Fell_English({ variable: "--font-fell", weight: "400", style: ["normal", "italic"], subsets: ["latin"] });
// Marquees: MalkmusEX (Smile Studio / Tohru Fukushima), web licence held by the organizer; subset to Basic Latin + em dash
const malkmus = localFont({ src: "../assets/fonts/MalkmusEX.woff2", variable: "--font-malkmus", display: "swap" });

export const metadata: Metadata = {
  title: "Halloween Party — Oct 31, 2026 · 100 Queen St W, Toronto",
  description:
    "A one-night gothic Halloween party. Oct 31, 22:00–05:00 at 100 Queen St W, Toronto. Advance CA$25 · Door CA$40.",
  openGraph: {
    title: "Halloween Party — Oct 31, 2026",
    description: "22:00–05:00 · 100 Queen St W, Toronto · Advance CA$25 · Door CA$40",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0706",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fell.variable} ${malkmus.variable} ${cormorant.variable} ${cinzel.variable} ${fraktur.variable} antialiased`}>
      <body>
        <OrganicDefs />
        {children}
      </body>
    </html>
  );
}
