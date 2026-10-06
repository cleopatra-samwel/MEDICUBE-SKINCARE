/** Resolve image paths from the API: absolute URLs pass through, "/images/..." are frontend assets. */
export const mediaUrl = (path) => path || '/images/products/placeholder.svg';
