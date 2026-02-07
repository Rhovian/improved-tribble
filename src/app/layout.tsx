import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://improved-tribble-three.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "J — Portfolio & Blog",
    template: "%s | J",
  },
  description:
    "Developer, writer, and tinkerer. I build things and occasionally write about them.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "J — Portfolio & Blog",
    title: "J — Portfolio & Blog",
    description:
      "Developer, writer, and tinkerer. I build things and occasionally write about them.",
  },
  twitter: {
    card: "summary",
    title: "J — Portfolio & Blog",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 transition-colors">
        <ThemeProvider>
          <Header />
          <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
