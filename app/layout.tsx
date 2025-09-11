import type { Metadata } from 'next';
import './App.scss';
import MainLayout from './components/MainLayout';
import { AuthProvider } from './components/authContext/authContext';

export const metadata: Metadata = {
  title: 'REST Client',
  description: 'A lightweight Postman alternative for testing REST APIs',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <MainLayout>{children}</MainLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
