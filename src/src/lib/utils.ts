import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    // As 'YYYY-MM-DD' is a standard format, this should work reliably.
    return date.toLocaleDateString('en-CA'); // 'en-CA' gives YYYY-MM-DD format
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Fallback to original string if parsing fails
  }
} 