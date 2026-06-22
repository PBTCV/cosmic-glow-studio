import { AstrologerEditor } from "@/components/admin/astrologer-editor";

export default async function EditAstrologerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: "profile" | "services" | "availability" }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  return <AstrologerEditor id={id} initialTab={tab} />;
}
