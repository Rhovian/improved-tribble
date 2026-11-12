import Link from "next/link";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 pb-24 pt-10">
      <div className="relative">
        <span className="px-tag absolute -top-3.5 left-5 z-10" aria-hidden="true">
          Joseph
        </span>
        <div className="px-panel">
          <h1 className="pixel-title text-2xl">Nothing out here but the sea.</h1>
          <p className="mt-2 text-lg">The page you were looking for isn&apos;t on this shore.</p>
          <ul className="mt-5 space-y-3">
            <li>
              <Link href="/" className="px-choice">
                <span className="px-choice-title text-lg">Back to the cabin</span>
              </Link>
            </li>
            <li>
              <Link href="/blog" className="px-choice">
                <span className="px-choice-title text-lg">Read the blog</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
