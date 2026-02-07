import Link from "next/link";
import { getPostsBySeriesGroups, PostMeta } from "@/lib/posts";

function PostCard({ post, inSeries }: { post: PostMeta; inSeries: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`block p-4 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
        inSeries ? "border-l-2 border-l-blue-500 dark:border-l-blue-400 ml-2" : "p-6 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
      }`}
    >
      <article>
        <div className="flex items-center gap-3">
          {inSeries && post.series && (
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              Part {post.series.part}
            </span>
          )}
          <time className="text-sm text-zinc-500 dark:text-zinc-500">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
        </div>
        <h3 className={`font-semibold mt-1 ${inSeries ? "text-lg" : "text-2xl mt-2 mb-2"}`}>
          {post.title}
        </h3>
        {!inSeries && (
          <p className="text-zinc-600 dark:text-zinc-400">{post.excerpt}</p>
        )}
        {!inSeries && post.tags && (
          <div className="flex gap-2 mt-4">
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
      </article>
    </Link>
  );
}

function SeriesDropdown({ seriesName, posts }: { seriesName: string; posts: PostMeta[] }) {
  const latestPost = posts[posts.length - 1];

  return (
    <details className="group border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
      <summary className="flex items-center justify-between p-6 cursor-pointer list-none hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
              {posts.length} part series
            </span>
            <time className="text-sm text-zinc-500">
              {new Date(latestPost.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </time>
          </div>
          <h2 className="text-2xl font-semibold">{seriesName}</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            {posts[0].excerpt}
          </p>
        </div>
        <div className="ml-4 text-zinc-400 group-open:rotate-180 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </summary>
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-4 space-y-2">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} inSeries={true} />
        ))}
      </div>
    </details>
  );
}

export default function BlogPage() {
  const { seriesGroups, standalonePosts } = getPostsBySeriesGroups();
  const hasContent = seriesGroups.length > 0 || standalonePosts.length > 0;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      {!hasContent ? (
        <p className="text-zinc-600 dark:text-zinc-400">No posts yet.</p>
      ) : (
        <div className="space-y-6">
          {/* Series as dropdowns */}
          {seriesGroups.map((group) =>
            group.posts.length === 1 ? (
              <PostCard key={group.seriesSlug} post={group.posts[0]} inSeries={false} />
            ) : (
              <SeriesDropdown
                key={group.seriesSlug}
                seriesName={group.seriesName}
                posts={group.posts}
              />
            )
          )}

          {/* Standalone Posts */}
          {standalonePosts.map((post) => (
            <PostCard key={post.slug} post={post} inSeries={false} />
          ))}
        </div>
      )}
    </div>
  );
}
