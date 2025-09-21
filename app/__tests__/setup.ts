import '@testing-library/jest-dom';
import dotenv from 'dotenv';
import { vi } from 'vitest';

dotenv.config({ path: '.env.local' });

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => key),
  useLocale: vi.fn(() => 'en'),
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('next-intl/server', () => ({
  getMessages: vi.fn(() => Promise.resolve({})),
  getRequestConfig: vi.fn(),
}));
