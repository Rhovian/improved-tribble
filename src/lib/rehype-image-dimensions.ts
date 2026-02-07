import { visit } from "unist-util-visit";
import type { Root, Element } from "hast";
import fs from "fs";
import path from "path";
import sizeOf from "image-size";

export default function rehypeImageDimensions() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "img") return;

      // Parse size hint from alt text (e.g. "alt text|wide" or "alt text|full")
      const alt = (node.properties?.alt as string) || "";
      const sizeMatch = alt.match(/\|(wide|full)$/);
      if (sizeMatch) {
        node.properties = {
          ...node.properties,
          alt: alt.replace(/\|(wide|full)$/, "").trim(),
          className: `img-${sizeMatch[1]}`,
        };
      }

      const src = node.properties?.src as string | undefined;
      if (!src) return;

      // Skip external URLs
      if (src.startsWith("http://") || src.startsWith("https://")) {
        // Add loading="lazy" for external images
        node.properties = {
          ...node.properties,
          loading: "lazy",
        };
        return;
      }

      // Local image - add dimensions
      try {
        // Handle paths starting with / (relative to public dir)
        const imagePath = src.startsWith("/")
          ? path.join(process.cwd(), "public", src)
          : path.join(process.cwd(), "public", src);

        if (!fs.existsSync(imagePath)) {
          console.warn(`Image not found: ${imagePath}`);
          return;
        }

        const buffer = fs.readFileSync(imagePath);
        const dimensions = sizeOf(buffer);

        if (dimensions.width && dimensions.height) {
          node.properties = {
            ...node.properties,
            width: dimensions.width,
            height: dimensions.height,
            loading: "lazy",
          };
        }
      } catch (err) {
        console.warn(`Could not determine dimensions for image: ${src}`, err);
      }
    });
  };
}
