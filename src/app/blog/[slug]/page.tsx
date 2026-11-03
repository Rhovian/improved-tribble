import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getAllPosts, getSeriesNavigation, getSeriesPosts } from "@/lib/posts";
import { ContinueReading, SeriesProgress, formatDate } from "@/components/blog";

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
      card: "summary_large_image",
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
  const seriesPosts = post.series ? getSeriesPosts(post.series.slug) : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    url: `${siteUrl}/blog/${slug}`,
    author: {
      "@type": "Person",
      name: "Joseph",
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
    <article className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href="/blog" className="mb-8 inline-block font-pixel text-base text-muted hover:text-gold">
        ◂ All posts
      </Link>

      {post.series && (
        <SeriesProgress name={post.series.name} part={post.series.part} total={post.series.total} posts={seriesPosts} />
      )}

      <header className="mb-10">
        <p className="meta">
          <time dateTime={post.date}>{formatDate(post.date, "long")}</time>
          <span aria-hidden="true"> &middot; </span>
          {post.readingMinutes} min read
        </p>
        <h1 className="pixel-title mt-3 text-[2rem] leading-tight sm:text-5xl">{post.title}</h1>
        {post.tags && post.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((tag: string) => (
              <span key={tag} className="px-chip">{tag}</span>
            ))}
          </div>
        )}
      </header>

      <div className="prose prose-lapis" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />

      <ContinueReading previous={previousPost} next={nextPost} part={post.series?.part} total={post.series?.total} />
    </article>
  );
}
