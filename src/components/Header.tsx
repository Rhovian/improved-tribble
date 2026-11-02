"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";

export function Header() {
  const { theme, toggleTheme, mounted } = useTheme();
  const pathname = usePathname();
  // on the home page the header floats, transparent, over the night scene
  const overScene = pathname === "/";
  const link = overScene
    ? "text-[#b9c6ea] hover:text-white transition-colors"
    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors";

  return (
    <header
      className={
        overScene
          ? "absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-[#03040e]/70 to-transparent text-[#b9c6ea]"
          : "border-b border-zinc-200 dark:border-zinc-800"
      }
    >
      <nav className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6 ml-auto">
          {pathname !== "/" && (
            <Link
              href="/"
              className={link}
            >
              Home
            </Link>
          )}

          {pathname !== "/portfolio" && (
            <Link
              href="/portfolio"
              className={link}
            >
              Portfolio
            </Link>
          )}

          {pathname !== "/blog" && !pathname.startsWith("/blog/") && (
            <Link
              href="/blog"
              className={link}
            >
              Blog
            </Link>
          )}

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${overScene ? "hover:bg-white/10" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
            aria-label="Toggle theme"
          >
            {mounted && theme === "dark" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                />
              </svg>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}
