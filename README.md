# Purpose

This is a svelteKit project that will host MD blog posts that will break down technical postings and concepts from popular engineering blogs.

## How blog posts will be delivered to the post route.

The route will be constructed from {domainName.xyz}/posts/{name} where the name will have a 1:1 relationship to the posts in the src/posts/[name].md
From there the server will deliver the md to the page where it will be parsed out and rendered in the page component.

## MD Make up

The MD will have a section for tags for topics, techonologies, and companies, etc. That will allow the post to be found more easily.
