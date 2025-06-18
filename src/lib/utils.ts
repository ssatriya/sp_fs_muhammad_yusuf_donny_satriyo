import { FormatDateTimeOptions } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(
  dateInput: Date | string | number,
  {
    locale = "id-ID",
    dateFormatOptions = { year: "numeric", month: "long", day: "2-digit" },
    timeFormatOptions,
    timeSeparator = " ",
  }: FormatDateTimeOptions = {}
): string {
  const date =
    typeof dateInput === "string" || typeof dateInput === "number"
      ? new Date(dateInput)
      : dateInput;

  if (isNaN(date.getTime())) return "Invalid date";

  const dateString = new Intl.DateTimeFormat(locale, dateFormatOptions).format(
    date
  );

  if (timeFormatOptions) {
    const timeString = new Intl.DateTimeFormat(
      locale,
      timeFormatOptions
    ).format(date);
    return `${dateString}${timeSeparator}${timeString}`;
  }

  return dateString;
}

export const isExpired = (expiresAt: Date) => {
  return new Date() > expiresAt;
};
