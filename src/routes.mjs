export const locales = ['de', 'en'];

export const routeDefinitions = [
  { id: 'home', path: locale => `/${locale}/`, directory: locale => `${locale}` },
  { id: 'explore', path: locale => `/${locale}/explore/`, directory: locale => `${locale}/explore` },
  { id: 'platform', path: locale => `/${locale}/explore/platform/`, directory: locale => `${locale}/explore/platform` },
  { id: 'automation', path: locale => `/${locale}/explore/automation/`, directory: locale => `${locale}/explore/automation` },
  { id: 'experience', path: locale => `/${locale}/explore/experience/`, directory: locale => `${locale}/explore/experience` },
  { id: 'profile', path: locale => `/${locale}/explore/profile/`, directory: locale => `${locale}/explore/profile` },
];

export const routeById = new Map(routeDefinitions.map(route => [route.id, route]));

export function routePath(routeId, locale) {
  const route = routeById.get(routeId);
  if (!route || !locales.includes(locale)) throw new Error(`Unknown route: ${routeId}/${locale}`);
  return route.path(locale);
}

export function outputFile(routeId, locale) {
  const route = routeById.get(routeId);
  if (!route || !locales.includes(locale)) throw new Error(`Unknown route: ${routeId}/${locale}`);
  return `${route.directory(locale)}/index.html`;
}

export function equivalentPath(routeId, locale) {
  return routePath(routeId, locale);
}

export function sitemapRoutes() {
  return routeDefinitions.flatMap(route => locales.map(locale => ({
    routeId: route.id,
    locale,
    path: route.path(locale),
  })));
}
