import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CrownWing — Crafted for Comfort. Designed for Elegance.",
  description:
    "Premium handcrafted furniture blending organic forms with timeless elegance. Discover sofas, chairs, and statement pieces designed for modern living.",
  keywords: ["furniture", "luxury", "sofas", "handcrafted", "CrownWing"],
  openGraph: {
    title: "CrownWing — Crafted for Comfort",
    description: "Premium handcrafted furniture for modern living.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#06080f] relative">
        <Navbar />
        <main className="flex-1 relative z-[1]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
