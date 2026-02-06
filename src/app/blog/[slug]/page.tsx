import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts, getSeriesNavigation } from "@/lib/posts";
import Link from "next/link";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://improved-tribble-three.vercel.app";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: "Post Not Found" };
  }

  const title = post.series
    ? `Part ${post.series.part}: ${post.title} | ${post.series.name}`
    : post.title;

  const description = post.series
    ? `${post.series.name} - Part ${post.series.part} of ${post.series.total}. ${post.excerpt}`
    : post.excerpt;

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${siteUrl}/blog/${slug}`,
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { previousPost, nextPost } = getSeriesNavigation(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    url: `${siteUrl}/blog/${slug}`,
    author: {
      "@type": "Person",
      name: "J",
      url: siteUrl,
    },
    ...(post.tags && { keywords: post.tags.join(", ") }),
    ...(post.series && {
      isPartOf: {
        "@type": "CreativeWorkSeries",
        name: post.series.name,
        position: post.series.part,
      },
    }),
  };

  return (
    <article className="max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href="/blog"
        className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-8 inline-block"
      >
        ← Back to blog
      </Link>

      {/* Series Context Bar */}
      {post.series && (
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {post.series.name}
            </span>
            <span className="text-sm text-blue-600 dark:text-blue-400">
              Part {post.series.part} of {post.series.total}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-1.5">
            <div
              className="bg-blue-600 dark:bg-blue-400 h-1.5 rounded-full transition-all"
              style={{
                width: `${(post.series.part / post.series.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      <header className="mb-8">
        <time
          className="text-sm text-zinc-500 dark:text-zinc-500"
          dateTime={post.date}
        >
          {new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        <h1 className="text-4xl font-bold mt-2 mb-4">{post.title}</h1>
        {post.tags && (
          <div className="flex gap-2">
            {post.tags.map((tag: string) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div
        className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-pre:bg-zinc-100 dark:prose-pre:bg-zinc-900 prose-img:rounded-lg"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      {/* Series Navigation */}
      {(previousPost || nextPost) && (
        <nav className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">
            Continue reading
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {previousPost ? (
              <Link
                href={`/blog/${previousPost.slug}`}
                className="group p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
              >
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                  ← Previous
                </div>
                <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Part {previousPost.series?.part}: {previousPost.title}
                </div>
              </Link>
            ) : (
              <div />
            )}
            {nextPost && (
              <Link
                href={`/blog/${nextPost.slug}`}
                className="group p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-blue-400 dark:hover:border-blue-600 transition-colors text-right"
              >
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                  Next →
                </div>
                <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Part {nextPost.series?.part}: {nextPost.title}
                </div>
              </Link>
            )}
          </div>
        </nav>
      )}
    </article>
  );
}
