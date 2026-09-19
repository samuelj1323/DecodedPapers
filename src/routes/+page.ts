import type { PageLoad } from "./$types";
import type { Component } from "svelte";
import type { PostMetaData } from "$lib/types/types";

export const load: PageLoad = async ({ params }) => {
  const blogPosts = import.meta.glob("/src/posts/*.md");
  const posts = await Promise.all(
    Object.entries(blogPosts).map(async ([path, post]) => {
      const mod = await (
        post as () => Promise<{ default: Component; metadata: PostMetaData }>
      )();
      const slug = path.slice("/src/posts/".length, -".md".length);
      return {
        slug,
        title: mod.metadata.title,
        date: mod.metadata.date,
        summary: mod.metadata.summary,
      };
    }),
  );
  posts.sort((a, b) => b.date.localeCompare(a.date));
  return { posts };
};
