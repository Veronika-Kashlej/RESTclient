import type { Metadata } from 'next';
import { ReactNode } from 'react';
import './App.scss';

export const metadata: Metadata = {
  title: 'REST Client',
  description: 'A lightweight Postman alternative for testing REST APIs',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
