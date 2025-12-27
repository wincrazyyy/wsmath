import type { Metadata } from "next";
import "./globals.css";
import { geistSans, geistMono, rubik } from "./_lib/fonts";

export const metadata: Metadata = {
  title: "WSMath",
  description: "Professional Online Math Tutor",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
