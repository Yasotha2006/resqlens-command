import { createFileRoute } from "@tanstack/react-router";
import { ResQLensApp } from "@/components/resqlens/resqlens-app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ResQLens — See the Risk. Explore the Response." },
      { name: "description", content: "AI-powered visual safety intelligence for exploring risks, responses, and potential outcomes." },
      { property: "og:title", content: "ResQLens — See the Risk. Explore the Response." },
      { property: "og:description", content: "A cinematic safety intelligence command center for risk understanding and response exploration." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResQLensApp,
});