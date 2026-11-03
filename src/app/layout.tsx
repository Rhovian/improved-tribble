import type { Metadata } from "next";
import { IBM_Plex_Mono, Literata, Pixelify_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import "./globals.css";

// pixel: names, titles and UI (as in the landing dialogue); serif: reading;
// mono: dates, counts, code. Only the pixel face is used on the landing page,
// so the other two load on demand rather than being preloaded everywhere.
const pixel = Pixelify_Sans({ subsets: ["latin"], variable: "--font-pixel", display: "swap" });
const serif = Literata({ subsets: ["latin"], variable: "--font-serif", display: "swap", style: ["normal", "italic"], axes: ["opsz"], preload: false });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap", preload: false });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://improved-tribble-three.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Joseph — Portfolio & Blog",
    template: "%s | Joseph",
  },
  description:
    "Developer, writer, and tinkerer. I build things and occasionally write about them.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Joseph — Portfolio & Blog",
    title: "Joseph — Portfolio & Blog",
    description:
      "Developer, writer, and tinkerer. I build things and occasionally write about them.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Joseph — Portfolio & Blog",
    description:
      "Developer, writer, and tinkerer. I build things and occasionally write about them.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${pixel.variable} ${serif.variable} ${mono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'){document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}})()`,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
