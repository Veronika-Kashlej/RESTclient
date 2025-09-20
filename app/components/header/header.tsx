import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import rsLogo from '../../assets/rss-logo.svg';
import Image from 'next/image';
import Navigation from '../Navigation';
import type { Header as HeaderType } from '@/types/interfaces';

const Header = (props: HeaderType) => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header data-testid="header" className={`${props.className} ${isSticky ? 'sticky' : ''}`}>
      <Link href="/">
        <Image src={rsLogo} alt="RSS Logo" width={80} height={80} priority />
      </Link>
      <Navigation />
      <div className="header__btns">
        <Link href="/sign-in" className="btn-primary">
          Sign in
        </Link>
        <Link href="/sign-up" className="btn-primary">
          Sign up
        </Link>
      </div>
    </header>
  );
};

export default Header;
