import type { Metadata, Viewport } from "next";
import { Cinzel, Inter, STIX_Two_Text } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
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
  themeColor: "#0a0a14",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cinzel.variable} ${inter.variable} ${stix.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
