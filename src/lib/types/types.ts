export type RouteMapping = {
  name: string;
  route: route;
};
type route = "/" | `/posts/${string}`;

export type PostMetaData = {
  title: string;
  summary: string;
  date: string;
  tage: { topics: string[]; techonologies: string[] };
  source: { label: string; url: string };
};

export type Post = {};
