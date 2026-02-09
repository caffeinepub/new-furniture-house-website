// Hash-based routing utilities for stable URLs and browser history support

export type Route =
  | { type: 'home' }
  | { type: 'admin' }
  | { type: 'orders' }
  | { type: 'checkout' }
  | { type: 'product'; productId: string }
  | { type: 'not-found' };

/**
 * Parse the current hash into a Route object
 */
export function parseHash(hash: string): Route {
  // Remove leading '#' if present
  const path = hash.startsWith('#') ? hash.slice(1) : hash;

  // Handle empty or root path
  if (!path || path === '/') {
    return { type: 'home' };
  }

  // Match specific routes
  if (path === '/admin') {
    return { type: 'admin' };
  }

  if (path === '/orders') {
    return { type: 'orders' };
  }

  if (path === '/checkout') {
    return { type: 'checkout' };
  }

  // Match product detail route with ID
  const productMatch = path.match(/^\/product\/(.+)$/);
  if (productMatch && productMatch[1]) {
    return { type: 'product', productId: productMatch[1] };
  }

  // Unknown route
  return { type: 'not-found' };
}

/**
 * Build a hash string from a Route object
 */
export function buildHash(route: Route): string {
  switch (route.type) {
    case 'home':
      return '#/';
    case 'admin':
      return '#/admin';
    case 'orders':
      return '#/orders';
    case 'checkout':
      return '#/checkout';
    case 'product':
      return `#/product/${route.productId}`;
    case 'not-found':
      return '#/not-found';
    default:
      return '#/';
  }
}

/**
 * Navigate to a route by setting the hash
 */
export function navigateToRoute(route: Route): void {
  window.location.hash = buildHash(route);
}
