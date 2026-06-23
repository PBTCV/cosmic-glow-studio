import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "../../sanity/schemaTypes";
import { dataset, projectId } from "./env";

export default defineConfig({
  name: "cosmic-glow-studio",
  title: "The Cosmic Voice",
  projectId,
  dataset,
  plugins: [structureTool()],
  schema: { types: schemaTypes },
});
