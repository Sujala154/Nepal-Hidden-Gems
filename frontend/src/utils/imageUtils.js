/**
 * Resolves the full URL for a destination image.
 * Handles both relative paths (from backend uploads) and external URLs.
 */
export const getImageUrl = (path) => {
    if (!path || typeof path !== 'string') return 'https://placehold.co/800x600?text=Nepal+Hidden+Gems';

    if (path.startsWith('http')) {
        return path;
    }

    // If the path starts with /uploads, it will be proxied by Vite in dev
    // and served by the same server in production.
    if (path.startsWith('/uploads')) {
        return path;
    }

    // Fallback for cases where the path might be just a filename
    if (path) {
        return `/uploads/destinations/${path}`;
    }

    return 'https://placehold.co/800x600?text=Nepal+Hidden+Gems';
};
