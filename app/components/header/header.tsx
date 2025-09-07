import React from 'react';
import Link from 'next/link';
import rsLogo from '../../assets/rss-logo.svg';
import Image from 'next/image';
import Navigation from '../Navigation';
import type { Header } from '@/types/interfaces';

const Header = (props: Header) => {
  return (
    <header data-testid="header" className={props.className}>
      <Link href="/">
        <Image src={rsLogo} alt="RSS Logo" width={80} height={80} />
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
