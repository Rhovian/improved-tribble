import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Selected projects, experiments, and work from J.",
  alternates: {
    canonical: "/portfolio",
  },
};

const projects = [
  {
    title: "Signal Lab",
    description:
      "Interactive notes and visual explainers for audio, electronics, and digital systems.",
    tags: ["Writing", "Visualization", "Audio"],
  },
  {
    title: "Dev Tools",
    description:
      "Small utilities and workflow experiments built to make everyday engineering feel smoother.",
    tags: ["Tools", "Automation", "DX"],
  },
  {
    title: "Creative Systems",
    description:
      "Playful prototypes that mix code, design, and simulation into explorable experiences.",
    tags: ["Prototype", "Design", "Web"],
  },
];

export default function PortfolioPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 px-4 py-8">
      <section className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Portfolio
        </p>
        <h1 className="text-4xl font-bold">Selected work</h1>
        <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          A placeholder collection for projects, experiments, and shipped work.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <article
            key={project.title}
            className="flex min-h-56 flex-col justify-between rounded-lg border border-zinc-200 p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
          >
            <div>
              <h2 className="text-xl font-semibold">{project.title}</h2>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                {project.description}
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
