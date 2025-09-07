'use client';
import Link from 'next/link';

const Navigation = () => {
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/client', label: 'Client' },
    { href: '/history', label: 'History' },
    { href: '/variables', label: 'Variables' },
  ];

  return (
    <nav className="navigation" data-testid="navigation">
      <ul className="navigation__list">
        {navItems.map((item) => (
          <li key={item.href} className="navigation__item">
            <Link href={item.href} className="navigation__link">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
