import type { Metadata, Viewport } from "next";
import { Cinzel, Inter, STIX_Two_Text, Uncial_Antiqua } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

// The title font: a fairy-tale uncial, for the dark fairy-core look the students asked for.
const uncial = Uncial_Antiqua({
  variable: "--font-uncial",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Variables in problems are set in a serif italic, as in a textbook.
const stix = STIX_Two_Text({
  variable: "--font-stix",
  subsets: ["latin"],
  style: "italic",
});

export const metadata: Metadata = {
  title: "MathTree",
  description: "Competition math, one branch at a time: from clever arithmetic to MATHCOUNTS and AMC 8.",
};

export const viewport: Viewport = {
  themeColor: "#0b100e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cinzel.variable} ${uncial.variable} ${inter.variable} ${stix.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
