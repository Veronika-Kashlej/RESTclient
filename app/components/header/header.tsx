'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import rsLogo from '../../assets/rss-logo.svg';
import Image from 'next/image';
import Navigation from '../Navigation';
import LanguageSwitcher from '../LanguageSwitcher';
import { useAuth } from '../authContext/authContext';
import type { Header as HeaderType } from '@/types/interfaces';

const Header = (props: HeaderType) => {
  const tAuth = useTranslations('auth');
  const tNav = useTranslations('navigation');
  const params = useParams();
  const locale = params.locale as string;
  const { user } = useAuth();
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
      <Link href={`/${locale}`}>
        <Image src={rsLogo} alt="RSS Logo" width={80} height={80} priority />
      </Link>
      <Navigation />
      <div className="header__btns">
        <LanguageSwitcher />
        {user ? (
          <Link href={`/${locale}`} className="btn-primary">
            {tNav('mainPage')}
          </Link>
        ) : (
          <>
            <Link href={`/${locale}/sign-in`} className="btn-primary">
              {tAuth('signIn')}
            </Link>
            <Link href={`/${locale}/sign-up`} className="btn-primary">
              {tAuth('signUp')}
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
