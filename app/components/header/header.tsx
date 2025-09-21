'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import rsLogo from '../../assets/rss-logo.svg';
import Image from 'next/image';
import Navigation from '../Navigation';
import LanguageSwitcher from '../LanguageSwitcher';
import type { Header as HeaderType } from '@/types/interfaces';

const Header = (props: HeaderType) => {
  const t = useTranslations('auth');
  const params = useParams();
  const locale = params.locale as string;
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
        <Link href={`/${locale}/sign-in`} className="btn-primary">
          {t('signIn')}
        </Link>
        <Link href={`/${locale}/sign-up`} className="btn-primary">
          {t('signUp')}
        </Link>
      </div>
    </header>
  );
};

export default Header;
