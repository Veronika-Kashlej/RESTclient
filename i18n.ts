import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'ru', 'es'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    console.error('Invalid locale:', locale);
    notFound();
  }

  try {
    const messages = (await import(`./messages/${locale}.json`)).default as Record<string, unknown>;

    return {
      locale,
      messages,
    };
  } catch (error) {
    console.error('Failed to load messages for locale:', locale, error);
    notFound();
  }
});

export const defaultLocale: Locale = 'en';
