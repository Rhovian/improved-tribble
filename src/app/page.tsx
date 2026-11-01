import Link from "next/link";
import { DioramaBackground } from "@/components/DioramaBackground";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://improved-tribble-three.vercel.app";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "J",
    url: siteUrl,
    jobTitle: "Developer",
    sameAs: ["https://github.com/Rhovian"],
  };

  return (
    <div className="isolate relative flex min-h-[calc(100svh-57px)] flex-col items-center justify-start overflow-hidden px-4 pb-8 pt-[8svh] text-center sm:pt-[10svh]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DioramaBackground className="z-0" />
      <div className="relative z-10 rounded-lg bg-white/75 px-4 py-6 backdrop-blur-sm dark:bg-zinc-900/70 sm:px-8">
        <h1 className="mb-4 text-5xl font-bold">Hi, I&apos;m J</h1>
        <p className="mb-8 max-w-xl text-xl text-zinc-600 dark:text-zinc-400">
          Developer, writer, and tinkerer. I build things and occasionally write
          about them.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/portfolio"
            className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Portfolio
          </Link>
          <Link
            href="/blog"
            className="rounded-lg border border-zinc-300 px-6 py-3 font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Read Blog
          </Link>
          <a
            href="https://github.com/Rhovian"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-zinc-300 px-6 py-3 font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
