import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CrownWing — Crafted for Comfort. Designed for Elegance.",
  description:
    "Discover premium, handcrafted furniture designed for modern living. CrownWing blends organic forms with timeless elegance.",
  keywords: [
    "furniture",
    "premium sofa",
    "modern design",
    "handcrafted",
    "CrownWing",
  ],
  openGraph: {
    title: "CrownWing — Premium Furniture Collection",
    description:
      "Discover premium, handcrafted furniture designed for modern living.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-[calc(100vh-40px)] flex flex-col m-[20px] rounded-[20px]">
        {children}
      </body>
    </html>
  );
}
