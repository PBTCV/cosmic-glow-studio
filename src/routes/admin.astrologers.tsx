import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/astrologers")({
  head: () => ({ meta: [{ title: "Astrologers — Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => <Outlet />,
});
