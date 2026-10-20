import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, UnifrakturMaguntia } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Halloween Party — Oct 31, 2026 · 1 Massey Square, Toronto",
  description:
    "A one-night gothic Halloween party. Oct 31, 22:00–05:00 at 1 Massey Square, East York, Toronto. Advance CA$25 · Door CA$40.",
  openGraph: {
    title: "Halloween Party — Oct 31, 2026",
    description: "22:00–05:00 · 1 Massey Square, East York, Toronto · Advance CA$25 · Door CA$40",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b090a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} ${cinzel.variable} ${fraktur.variable} antialiased`}>
      <body>
        <OrganicDefs />
        {children}
      </body>
    </html>
  );
}
