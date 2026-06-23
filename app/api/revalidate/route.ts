import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { revalidateSecret } from "@/sanity/env";

export async function POST(request: NextRequest) {
  const secret =
    request.nextUrl.searchParams.get("secret") || request.headers.get("x-revalidate-secret");

  if (!revalidateSecret || secret !== revalidateSecret) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      slug?: { current?: string };
    };
    const slug = body.slug?.current;

    revalidatePath("/insights");
    if (slug) {
      revalidatePath(`/insights/${slug}`);
    } else {
      revalidatePath("/insights", "layout");
    }
    revalidatePath("/");

    return NextResponse.json({ revalidated: true, now: Date.now(), slug: slug ?? null });
  } catch {
    return NextResponse.json({ message: "Error revalidating" }, { status: 500 });
  }
}
