import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Selected projects, experiments, and work from Joseph.",
  alternates: {
    canonical: "/portfolio",
  },
  // placeholder projects for now: keep this page out of search results
  robots: { index: false, follow: true },
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

/** Projects as an inventory: notched panels in a grid. Placeholder content for now. */
export default function PortfolioPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6">
      <header className="mb-10 max-w-2xl">
        <p className="kicker">Portfolio</p>
        <h1 className="pixel-title mt-3 text-5xl">Selected work</h1>
        <p className="mt-3 text-lg">A placeholder collection for projects, experiments, and shipped work.</p>
      </header>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <li key={project.title} className="px-panel flex flex-col">
            <h2 className="pixel-title text-2xl">{project.title}</h2>
            <p className="mt-3 flex-1 leading-relaxed">{project.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span key={tag} className="px-chip">{tag}</span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
