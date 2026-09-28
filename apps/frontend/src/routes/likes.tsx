import { createFileRoute } from "@tanstack/react-router";

import { LikesPage } from "@/features/likes/pages/likes-page";

export const Route = createFileRoute("/likes")({
  component: LikesPage,
});
