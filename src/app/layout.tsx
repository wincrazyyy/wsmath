import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

/**
 * The display serif — the one webfont the design ships (docs/11 §0.3, docs/12
 * §G7). Fraunces, variable on `opsz` 9–144 and `wght` 100–900, latin subset
 * only: the CJK registers set their own family, and any glyph outside the
 * subset falls through to the system serifs behind it in `--f-display`.
 * Self-hosted, so no request leaves the site; preloaded; and `next/font`
 * emits a Times-metric fallback face so the swap does not move the layout.
 * `.mvt-root` reads it through `--font-fraunces` (globals.css).
 */
const fraunces = localFont({
  src: "./fonts/fraunces-latin.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  preload: true,
  variable: "--font-fraunces",
  adjustFontFallback: "Times New Roman",
  declarations: [
    {
      // Google Fonts' latin subset range — what the file actually contains.
      // One literal on purpose: next/font reads this at compile time and cannot
      // evaluate an expression here.
      prop: "unicode-range",
      value: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
});

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
    <html lang="en" className={fraunces.variable}>
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
