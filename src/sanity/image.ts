import { createImageUrlBuilder } from "@sanity/image-url";
import { dataset, projectId } from "./env";
import type { SanityImage } from "./types";

const builder = projectId ? createImageUrlBuilder({ projectId, dataset }) : null;

export function urlFor(source: SanityImage) {
  if (!builder) return null;
  return builder.image(source);
}
