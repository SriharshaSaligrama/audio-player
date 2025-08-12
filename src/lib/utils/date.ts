/**
 * Formats a date to DD MMM YYYY format (e.g., "23 Aug 2025")
 * @param date - Date object, ISO string, or timestamp
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | number | null | undefined): string {
    if (!date) return '—';

    try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return '—';

        return dateObj.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch {
        return '—';
    }
}

/**
 * Formats a date for HTML date input (YYYY-MM-DD format)
 * @param date - Date object, ISO string, or timestamp
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateForInput(date: Date | string | number | null | undefined): string {
    if (!date) return '';

    try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return '';

        return dateObj.toISOString().split('T')[0];
    } catch {
        return '';
    }
}

/**
 * Gets the year from a date
 * @param date - Date object, ISO string, or timestamp
 * @returns Year as number or null if invalid
 */
export function getYear(date: Date | string | number | null | undefined): number | null {
    if (!date) return null;

    try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return null;

        return dateObj.getFullYear();
    } catch {
        return null;
    }
}