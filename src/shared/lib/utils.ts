import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneNumber(value: string): string {
  if (!value) return value;
  
  // Keep only digits
  const phoneNumber = value.replace(/[^\d]/g, "");
  
  // If it starts with 7 or 8, we handle it as +7
  let digits = phoneNumber;
  if (digits.startsWith("7") || digits.startsWith("8")) {
    digits = digits.slice(1);
  }
  
  // Limit to 10 digits (after +7)
  digits = digits.slice(0, 10);
  
  const length = digits.length;
  
  if (length === 0) return "+7 ";
  if (length < 4) return `+7 (${digits}`;
  if (length < 7) return `+7 (${digits.slice(0, 3)}) ${digits.slice(3)}`;
  if (length < 9) return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
}
