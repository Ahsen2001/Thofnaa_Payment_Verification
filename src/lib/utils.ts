import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLKR(amount: number): string {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatRegNumber(val: string): string {
  // Cleans and formats input into THF-26-XXXX format
  const cleaned = val.toUpperCase().replace(/[^A-Z0-9-]/g, "");
  return cleaned;
}
