'use client';
import { useState, useEffect } from 'react';
import Header from './header/header';
import Footer from './footer/footer';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', onScroll);
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div className="app" data-testid="app">
      <Header className={isScrolled ? 'header _active' : 'header'} />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}
