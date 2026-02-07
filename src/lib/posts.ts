import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import rehypeImageDimensions from "./rehype-image-dimensions";

const postsDirectory = path.join(process.cwd(), "content/posts");

export interface SeriesInfo {
  name: string;
  slug: string;
  part: number;
  total: number;
}

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags?: string[];
  series?: SeriesInfo;
}

export interface Post extends PostMeta {
  contentHtml: string;
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const posts = fileNames
    .filter((name) => name.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title || slug,
        date: data.date || new Date().toISOString(),
        excerpt: data.excerpt || "",
        tags: data.tags || [],
        series: data.series || undefined,
      };
    });

  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getSeriesPosts(seriesSlug: string): PostMeta[] {
  const allPosts = getAllPosts();
  return allPosts
    .filter((post) => post.series?.slug === seriesSlug)
    .sort((a, b) => (a.series?.part || 0) - (b.series?.part || 0));
}

export function getSeriesNavigation(slug: string): {
  previousPost: PostMeta | null;
  nextPost: PostMeta | null;
} {
  const post = getAllPosts().find((p) => p.slug === slug);
  if (!post?.series) return { previousPost: null, nextPost: null };

  const seriesPosts = getSeriesPosts(post.series.slug);
  const currentIndex = seriesPosts.findIndex((p) => p.slug === slug);

  return {
    previousPost: currentIndex > 0 ? seriesPosts[currentIndex - 1] : null,
    nextPost:
      currentIndex < seriesPosts.length - 1
        ? seriesPosts[currentIndex + 1]
        : null,
  };
}

export interface SeriesGroup {
  seriesSlug: string;
  seriesName: string;
  posts: PostMeta[];
}

export function getPostsBySeriesGroups(): {
  seriesGroups: SeriesGroup[];
  standalonePosts: PostMeta[];
} {
  const allPosts = getAllPosts();
  const seriesMap = new Map<string, PostMeta[]>();
  const standalonePosts: PostMeta[] = [];

  allPosts.forEach((post) => {
    if (post.series) {
      if (!seriesMap.has(post.series.slug)) {
        seriesMap.set(post.series.slug, []);
      }
      seriesMap.get(post.series.slug)!.push(post);
    } else {
      standalonePosts.push(post);
    }
  });

  const seriesGroups: SeriesGroup[] = Array.from(seriesMap.entries()).map(
    ([seriesSlug, posts]) => {
      posts.sort((a, b) => (a.series?.part || 0) - (b.series?.part || 0));
      return {
        seriesSlug,
        seriesName: posts[0].series?.name || seriesSlug,
        posts,
      };
    }
  );

  // Sort series by the date of their most recent post
  seriesGroups.sort((a, b) => {
    const aLatest = a.posts[a.posts.length - 1]?.date || "";
    const bLatest = b.posts[b.posts.length - 1]?.date || "";
    return bLatest > aLatest ? 1 : -1;
  });

  return { seriesGroups, standalonePosts };
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeImageDimensions)
    .use(rehypeKatex)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);

  const contentHtml = processedContent.toString();

  return {
    slug,
    title: data.title || slug,
    date: data.date || new Date().toISOString(),
    excerpt: data.excerpt || "",
    tags: data.tags || [],
    series: data.series || undefined,
    contentHtml,
  };
}
