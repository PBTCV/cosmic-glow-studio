import type { Metadata } from "next";
import { InsightsListPage } from "@/components/pages/insights-list-page";
import { JsonLd } from "@/components/seo/json-ld";
import { createMetadata } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import { getPosts } from "@/sanity/queries";

export const metadata: Metadata = createMetadata({
  title: "Insights",
  description:
    "Essays on Vedic strategy and cosmic clarity for executives, founders, and institutions.",
  path: "/insights",
  keywords: [
    "Vedic astrology insights",
    "business astrology articles",
    "Vastu guidance",
    "cosmic strategy",
  ],
});

export default async function Page() {
  const posts = await getPosts();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Insights", path: "/insights" },
        ])}
      />
      <InsightsListPage posts={posts} />
    </>
  );
}
