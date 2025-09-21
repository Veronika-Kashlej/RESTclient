'use client';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

const Navigation = () => {
  const t = useTranslations('navigation');
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;

  const navItems = [
    { href: `/${locale}`, label: t('home'), icon: '🏠' },
    { href: `/${locale}/client`, label: t('client'), icon: '🚀' },
    { href: `/${locale}/history`, label: t('history'), icon: '📊' },
    { href: `/${locale}/variables`, label: t('variables'), icon: '⚙️' },
  ];

  return (
    <nav className="navigation" data-testid="navigation">
      <ul className="navigation__list">
        {navItems.map((item) => (
          <li key={item.href} className="navigation__item">
            <Link
              href={item.href}
              className="navigation__link"
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              <span className="nav-text">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
