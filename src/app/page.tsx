import { HomeHero } from "@/components/HomeHero";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://improved-tribble-three.vercel.app";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "J",
    url: siteUrl,
    jobTitle: "Developer",
    sameAs: ["https://github.com/Rhovian"],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeHero />
    </>
  );
}
