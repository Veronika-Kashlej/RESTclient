'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navigation = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/client', label: 'Client', icon: '🚀' },
    { href: '/history', label: 'History', icon: '📊' },
    { href: '/variables', label: 'Variables', icon: '⚙️' },
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
