export const LOCALES = ['en','es','fr','de','it'] as const;
export type Locale = typeof LOCALES[number];

export function assertLocale(lang: string): lang is Locale {
  return (LOCALES as readonly string[]).includes(lang);
}

export function pickByLocale<T extends Record<string, any>>(obj: T, lang: Locale, baseKey: string) {
  const key = `${baseKey}_${lang}` as keyof T;
  const enKey = `${baseKey}_en` as keyof T;
  return (obj[key] ?? obj[enKey]) as any;
}

export function pickListByLocale<T extends Record<string, any>>(obj: T, lang: Locale, baseKey: string) {
  const key = `${baseKey}_${lang}` as keyof T;
  const enKey = `${baseKey}_en` as keyof T;
  const v = (obj[key] ?? obj[enKey]) as any;
  return Array.isArray(v) ? v : [];
}

export function youtubeEmbed(value?: string) {
  if (!value) return null;
  // accept full url or id
  const m = value.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/);
  const id = m?.[1] ?? value;
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}`;
}
