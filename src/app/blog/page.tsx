import type { Metadata } from "next";
import { getPostsBySeriesGroups } from "@/lib/posts";
import { PostRow, SeriesQuest } from "@/components/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing from Joseph: long-form posts and series.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const { seriesGroups, standalonePosts } = getPostsBySeriesGroups();
  const postCount = seriesGroups.reduce((n, g) => n + g.posts.length, 0) + standalonePosts.length;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <header className="mb-10">
        <p className="kicker">
          {postCount} {postCount === 1 ? "post" : "posts"}
          {seriesGroups.length > 0 && ` · ${seriesGroups.length} ${seriesGroups.length === 1 ? "series" : "series"}`}
        </p>
        <h1 className="pixel-title mt-3 text-5xl">Blog</h1>
      </header>

      {postCount === 0 ? (
        <p className="text-lg">Nothing here yet.</p>
      ) : (
        <div className="space-y-12">
          {seriesGroups.map((group) =>
            group.posts.length === 1 && !(group.posts[0].series && group.posts[0].series.total > 1) ? (
              <PostRow key={group.seriesSlug} post={group.posts[0]} />
            ) : (
              <SeriesQuest key={group.seriesSlug} name={group.seriesName} posts={group.posts} />
            ),
          )}
          {standalonePosts.map((post) => (
            <PostRow key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
