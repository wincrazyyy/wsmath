import type { Metadata } from "next";
import "./globals.css";
import { geistSans, geistMono, rubik } from "./_lib/fonts";

export const metadata: Metadata = {
  metadataBase: new URL("https://wsmath.com"),
  title: "WSMath",
  description: "International Mathematics Exam Strategist",

  openGraph: {
    type: "website",
    url: "https://wsmath.com/",
    title: "WSMath",
    description: "International Mathematics Exam Strategist",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "WSMath",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "WSMath",
    description: "International Mathematics Exam Strategist",
    images: ["/opengraph-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${rubik.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
