import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Drop Whisk — Instant Cross-Device File Sharing",
    short_name: "Drop Whisk",
    description:
      "Share files, images, videos, audio and text across mobile, PC, Android and iPhone instantly.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0c",
    theme_color: "#6366f1",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
