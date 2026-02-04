import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      {posts.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">No posts yet.</p>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
            >
              <article>
                <time className="text-sm text-zinc-500 dark:text-zinc-500">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <h2 className="text-2xl font-semibold mt-2 mb-2">
                  {post.title}
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {post.excerpt}
                </p>
                {post.tags && (
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
          ))}
        </div>
      )}
    </div>
  );
}
