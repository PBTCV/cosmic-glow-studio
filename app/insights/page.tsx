import type { Metadata } from "next";
import { InsightsListPage } from "@/components/pages/insights-list-page";
import { getPosts } from "@/sanity/queries";

export const metadata: Metadata = {
  title: "Insights — The Cosmic Voice",
  description:
    "Essays on Vedic strategy, timing, and cosmic clarity for executives, founders, and institutions.",
};

export default async function Page() {
  const posts = await getPosts();
  return <InsightsListPage posts={posts} />;
}
