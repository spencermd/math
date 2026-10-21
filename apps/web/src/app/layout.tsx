import type { Metadata, Viewport } from "next";
import { Cinzel, Inter } from "next/font/google";
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

export const metadata: Metadata = {
  title: "MathTree",
  description: "Grow your math skills one branch at a time, from counting to calculus.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a14",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cinzel.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
