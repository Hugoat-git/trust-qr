import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Prize } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function weightedRandom(prizes: Prize[]): Prize {
  const total = prizes.reduce((sum, p) => sum + p.probability, 0);
  let random = Math.random() * total;

  for (const prize of prizes) {
    random -= prize.probability;
    if (random <= 0) return prize;
  }
  return prizes[0];
}

export function generateVoucherCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function getExpiryDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}
