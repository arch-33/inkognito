import type { PageType } from "@/content/page.types";
import { defineCollection, z } from "astro:content";

const zodPageConfig = z.custom<PageType>();

const pagesCollection = defineCollection({
  type: "content",
  schema: zodPageConfig,
});

export const collections = {
  pages: pagesCollection,
};
