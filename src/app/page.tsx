import Link from "next/link";

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
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-5xl font-bold mb-4">Hi, I&apos;m J</h1>
      <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-xl">
        Developer, writer, and tinkerer. I build things and occasionally write
        about them.
      </p>
      <div className="flex gap-4">
        <Link
          href="/blog"
          className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
        >
          Read Blog
        </Link>
        <a
          href="https://github.com/Rhovian"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          GitHub
        </a>
      </div>
    </div>
  );
}
