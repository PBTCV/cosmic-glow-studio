import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, readToken } from "./env";

export const client = createClient({
  projectId: projectId || "placeholder",
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  stega: {
    enabled: false,
    studioUrl: "/studio",
  },
  token: readToken,
});

// Only used when Sanity is configured; placeholder avoids client init errors in imports.
