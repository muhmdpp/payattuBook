/**
 * Color and avatar utility functions.
 */

const COLORS = [
    '#EF4444', // Red
    '#F97316', // Orange
    '#F59E0B', // Amber
    '#84CC16', // Lime
    '#10B981', // Emerald
    '#06B6D4', // Cyan
    '#3B82F6', // Blue
    '#6366F1', // Indigo
    '#8B5CF6', // Violet
    '#D946EF', // Fuchsia
    '#F43F5E', // Rose
];

/**
 * Returns a consistent color derived from the given name string.
 * This guarantees that "Nasar" will always get the same color.
 */
export function getAvatarColor(name: string): string {
    if (!name) return '#9CA3AF'; // Default gray

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % COLORS.length;
    return COLORS[index];
}

/**
 * Generates 1 or 2 letter initials from a single or multi-word name.
 */
export function getInitials(name: string): string {
    if (!name) return '?';

    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }

    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
