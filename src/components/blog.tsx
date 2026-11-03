import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

export const formatDate = (iso: string, month: "short" | "long" = "short") =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month, day: "numeric", timeZone: "UTC" });

/** "From Air to Bits: The Complete Path…" → "The Complete Path…" inside its own series. */
export const partTitle = (post: PostMeta) => {
  const name = post.series?.name;
  return name && post.title.startsWith(`${name}:`) ? post.title.slice(name.length + 1).trim() : post.title;
};

/** A series on the blog index, as a quest log: its parts as checkpoints. */
export function SeriesQuest({ name, posts }: { name: string; posts: PostMeta[] }) {
  const total = Math.max(posts[0]?.series?.total ?? posts.length, posts.length);
  const byPart = new Map(posts.map((p) => [p.series?.part ?? 0, p]));
  return (
    <section className="px-panel" aria-labelledby={`series-${posts[0]?.series?.slug}`}>
      <p className="kicker">
        Series &middot; {posts.length} of {total} parts
      </p>
      <h2 id={`series-${posts[0]?.series?.slug}`} className="pixel-title mt-3 text-3xl">
        {name}
      </h2>
      <p className="mt-2 text-lg leading-relaxed">{posts[0]?.excerpt}</p>
      <p className="mt-3 font-pixel text-gold tracking-[0.3em]" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (byPart.has(i + 1) ? "●" : "○")).join("")}
      </p>
      <ol className="mt-5 space-y-3">
        {Array.from({ length: total }, (_, i) => {
          const post = byPart.get(i + 1);
          return post ? (
            <li key={i}>
              <Link href={`/blog/${post.slug}`} className="px-choice">
                <span className="meta mr-3">Part {i + 1}</span>
                <span className="px-choice-title text-lg">{partTitle(post)}</span>
                <span className="meta ml-3 whitespace-nowrap">{formatDate(post.date)}</span>
              </Link>
            </li>
          ) : (
            <li key={i} className="is-locked pl-[22px]">
              <span className="meta mr-3">Part {i + 1}</span>
              <span className="font-pixel text-lg">Coming soon</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** A post that isn't part of a series: a menu choice with its excerpt. */
export function PostRow({ post }: { post: PostMeta }) {
  return (
    <article>
      <Link href={`/blog/${post.slug}`} className="px-choice">
        <span className="meta block">{formatDate(post.date)}</span>
        <span className="px-choice-title mt-1 block text-2xl">{post.title}</span>
        {post.excerpt && <span className="mt-2 block text-lg leading-relaxed text-ink">{post.excerpt}</span>}
      </Link>
      {post.tags && post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 pl-[22px]">
          {post.tags.map((t) => (
            <span key={t} className="px-chip">{t}</span>
          ))}
        </div>
      )}
    </article>
  );
}

/** Where this post sits in its series: one notched segment per part. */
export function SeriesProgress({ name, part, total, posts }: { name: string; part: number; total: number; posts: PostMeta[] }) {
  const byPart = new Map(posts.map((p) => [p.series?.part ?? 0, p]));
  return (
    <nav aria-label={`${name}, part ${part} of ${total}`} className="mb-10">
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-pixel text-lg font-semibold text-ink-strong">{name}</span>
        <span className="meta">Part {part} of {total}</span>
      </div>
      <ol className="mt-3 flex gap-2">
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1, post = byPart.get(n);
          const state = n === part ? "current" : post ? "done" : "todo";
          const seg = <span className={`series-seg is-${state}`} />;
          return (
            <li key={n} className="flex-1">
              {post && n !== part ? (
                <Link href={`/blog/${post.slug}`} aria-label={`Part ${n}: ${partTitle(post)}`} className="block py-1">
                  {seg}
                </Link>
              ) : (
                <span className="block py-1" aria-label={post ? `Part ${n} (this post)` : `Part ${n}, coming soon`}>
                  {seg}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** End of a post: the next steps, as dialogue choices. */
export function ContinueReading({ previous, next, part, total }: { previous: PostMeta | null; next: PostMeta | null; part?: number; total?: number }) {
  const upcoming = !next && part && total && part < total ? part + 1 : null;
  if (!previous && !next && !upcoming) return null;
  return (
    <nav aria-label="Continue reading" className="mt-16 border-t-2 border-dashed border-rule pt-8">
      <p className="kicker">Continue reading</p>
      <ul className="mt-4 space-y-3">
        {previous && (
          <li>
            <Link href={`/blog/${previous.slug}`} className="px-choice">
              <span className="meta mr-3">Part {previous.series?.part}</span>
              <span className="px-choice-title text-lg">{partTitle(previous)}</span>
            </Link>
          </li>
        )}
        {next && (
          <li>
            <Link href={`/blog/${next.slug}`} className="px-choice">
              <span className="meta mr-3">Part {next.series?.part}</span>
              <span className="px-choice-title text-lg">{partTitle(next)}</span>
            </Link>
          </li>
        )}
        {upcoming && (
          <li className="is-locked pl-[22px]">
            <span className="meta mr-3">Part {upcoming}</span>
            <span className="font-pixel text-lg">Coming soon</span>
          </li>
        )}
        <li>
          <Link href="/blog" className="px-choice">
            <span className="px-choice-title text-lg">All posts</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
