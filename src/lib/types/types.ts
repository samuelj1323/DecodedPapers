export type RouteMapping = {
  name: string;
  route: route;
};
type route = "/" | `/posts/${string}`;

export type PostMetaData = {
  title: string;
  summary: string;
  date: string;
  draft?: boolean;
  tags: { topics: string[]; technologies: string[]; companies: string[] };
  source: { label: string; url: string };
};

export type PostListItem = PostMetaData & { slug: string };
