import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://wsmath.com"),
  title: "WSMath — Winson Siu · International Mathematics Exam Strategist",
  description: "International Mathematics Exam Strategist",

  openGraph: {
    type: "website",
    url: "https://wsmath.com/",
    title: "WSMath — Winson Siu · International Mathematics Exam Strategist",
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
    title: "WSMath — Winson Siu · International Mathematics Exam Strategist",
    description: "International Mathematics Exam Strategist",
    images: ["/opengraph-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#1c0848",
};

/**
 * The reveal system hides `.mvt-rev` only once `body.js` is present, so a
 * reader without JavaScript never meets a blank page. Setting the class from
 * an inline script that is the first child of <body> means the flag lands
 * before the browser paints anything below it — no flash of revealed content.
 */
const JS_FLAG = "document.body.classList.add('js')";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* `suppressHydrationWarning` is scoped to <body>'s own attributes: the
          inline script below adds `js` before React hydrates, and without this
          React reports the extra class as a mismatch. Children still hydrate
          under the normal checks. */}
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG }} />
        {children}
      </body>
    </html>
  );
}
