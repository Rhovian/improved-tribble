"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Inner pages' header: a gold "Home" tag and the nav, over a strip of the
 * landing scene. Hidden on the home page, which is the scene.
 */
export function Header() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  const onBlog = pathname === "/blog" || pathname.startsWith("/blog/");
  // line the header up with the page's own column
  const width = onBlog ? "max-w-3xl" : "max-w-5xl";

  return (
    <header className="site-header">
      <nav className={`site-nav mx-auto ${width} px-4`} aria-label="Site">
        <Link href="/" className="px-tag">
          Home
        </Link>
        <Link href="/blog" className="nav-link" aria-current={pathname === "/blog" ? "page" : onBlog ? "location" : undefined}>
          Blog
        </Link>
      </nav>
    </header>
  );
}
