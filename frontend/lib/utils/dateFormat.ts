/**
 * Formats a date string to dd/mm/yyyy format using Spanish locale
 * @param dateString - ISO date string, YYYY-MM-DD, or dd/mm/yyyy format
 * @returns Formatted date string in dd/mm/yyyy format
 */
export function formatDate(dateString: string): string {
  // If already in dd/mm/yyyy format, return as is
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return dateString;
  }
  
  // Handle date-only strings (YYYY-MM-DD) to avoid timezone issues
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }
  
  // For datetime strings, use toLocaleDateString
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}
