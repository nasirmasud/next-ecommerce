import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//convert prisma object to a regular js object
export function prismaToJsObject<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
