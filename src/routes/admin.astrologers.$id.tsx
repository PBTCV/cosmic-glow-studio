import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AstrologerEditor } from "@/components/admin/astrologer-editor";

const searchSchema = z.object({
  tab: z.enum(["profile", "services", "availability"]).optional(),
});

export const Route = createFileRoute("/admin/astrologers/$id")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Edit Astrologer — Admin" }, { name: "robots", content: "noindex" }] }),
  component: EditAstrologerPage,
});

function EditAstrologerPage() {
  const { id } = Route.useParams();
  const { tab } = Route.useSearch();
  return <AstrologerEditor id={id} initialTab={tab} />;
}
