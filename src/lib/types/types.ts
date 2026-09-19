export type RouteMapping = {
  name: string;
  route: route;
};
type route = "/" | `/posts/${string}`;
