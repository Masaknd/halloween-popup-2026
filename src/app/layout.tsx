import type { Metadata, Viewport } from "next";
import { Anton, JetBrains_Mono, Special_Elite } from "next/font/google";
import "./globals.css";

const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });
const elite = Special_Elite({ variable: "--font-elite", weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Halloween Party — Oct 31, 2026 · 1 Massey Square, Toronto",
  description:
    "A one-night Halloween pop-up by Massh. Oct 31, 22:00–05:00 at 1 Massey Square, East York, Toronto. Advance CA$25 · Door CA$40.",
  openGraph: {
    title: "Halloween Party — Oct 31, 2026",
    description: "22:00–05:00 · 1 Massey Square, East York, Toronto · Advance CA$25 · Door CA$40",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0c0b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${anton.variable} ${jetbrains.variable} ${elite.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
