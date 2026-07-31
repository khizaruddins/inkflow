import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateReadingTime(text: string): { minutes: number; wordCount: number; characterCount: number } {
  const cleanText = text.replace(/<[^>]*>/g, " ").trim();
  const words = cleanText ? cleanText.split(/\s+/).length : 0;
  const characters = cleanText.length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return { minutes, wordCount: words, characterCount: characters };
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "Draft";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function extractTOC(htmlContent: string) {
  const regex = /<h([2-3])[^>]*id="([^"]+)"[^>]*>(.*?)<\/h[2-3]>/gi;
  const toc = [];
  let match;
  while ((match = regex.exec(htmlContent)) !== null) {
    toc.push({
      level: parseInt(match[1], 10),
      id: match[2],
      text: match[3].replace(/<[^>]*>/g, ""),
    });
  }
  return toc;
}
