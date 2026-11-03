"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";

/** A 13x13 pixel icon from a predicate, drawn with crisp squares. */
function PixelIcon({ on }: { on: (x: number, y: number) => boolean }) {
  const cells: [number, number][] = [];
  for (let y = 0; y < 13; y++) for (let x = 0; x < 13; x++) if (on(x, y)) cells.push([x, y]);
  return (
    <svg width="20" height="20" viewBox="0 0 13 13" shapeRendering="crispEdges" aria-hidden="true" fill="currentColor">
      {cells.map(([x, y]) => (
        <rect key={`${x},${y}`} x={x} y={y} width="1" height="1" />
      ))}
    </svg>
  );
}
const dist = (x: number, y: number, cx: number, cy: number) => Math.hypot(x - cx, y - cy);
// crescent moon: a disc with a bite taken out
const moon = (x: number, y: number) => dist(x, y, 6, 6) <= 5.6 && dist(x, y, 9, 4) > 4.6;
// sun: a disc with eight rays
const sun = (x: number, y: number) => {
  const r = dist(x, y, 6, 6);
  if (r <= 2.6) return true;
  const dx = x - 6, dy = y - 6;
  const onRay = dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy);
  return onRay && r >= 4 && r <= 6.2;
};

/**
 * Inner pages' header: the gold "Joseph" name tag (home) and the nav, over a
 * strip of the landing scene. Hidden on the home page, which is the scene.
 */
export function Header() {
  const { theme, toggleTheme, mounted } = useTheme();
  const pathname = usePathname();

  if (pathname === "/") return null;

  const night = !mounted || theme === "dark";
  const onBlog = pathname === "/blog" || pathname.startsWith("/blog/");
  // line the header up with the page's own column
  const width = onBlog ? "max-w-3xl" : "max-w-5xl";

  return (
    <header className="site-header">
      <nav className={`site-nav mx-auto ${width} px-4`} aria-label="Site">
        <Link href="/" className="px-tag" aria-label="Joseph, home">
          Joseph
        </Link>
        <div className="flex items-center gap-5">
          <Link href="/blog" className="nav-link" aria-current={pathname === "/blog" ? "page" : onBlog ? "location" : undefined}>
            Blog
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="icon-btn"
            aria-label={night ? "Switch to the daytime (light) theme" : "Switch to the night (dark) theme"}
            title={night ? "Day" : "Night"}
          >
            <PixelIcon on={night ? sun : moon} />
          </button>
        </div>
      </nav>
    </header>
  );
}
