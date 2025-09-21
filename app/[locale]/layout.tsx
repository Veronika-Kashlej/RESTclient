import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '../../i18n';
import MainLayout from '../components/MainLayout';
import { AuthProvider } from '../components/authContext/authContext';
import { ToastProvider } from '../providers/ToastProvider';
import ErrorBoundary from '../components/ErrorBoundary';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <AuthProvider>
        <ErrorBoundary>
          <MainLayout>{children}</MainLayout>
        </ErrorBoundary>
      </AuthProvider>
      <ToastProvider />
    </NextIntlClientProvider>
  );
}
