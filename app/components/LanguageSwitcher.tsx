'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales, type Locale } from '../../i18n';
import { useState, useTransition, useEffect, useRef } from 'react';

export default function LanguageSwitcher() {
  const t = useTranslations('language');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleLanguageChange = (newLocale: Locale) => {
    startTransition(() => {
      const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
      const newPath = `/${newLocale}${pathWithoutLocale}`;
      router.replace(newPath);
      setIsOpen(false);
    });
  };

  const getLanguageName = (loc: Locale) => {
    switch (loc) {
      case 'en':
        return t('english');
      case 'ru':
        return t('russian');
      case 'es':
        return t('spanish');
      default:
        return (loc as string).toUpperCase();
    }
  };

  const getCurrentFlag = (loc: Locale) => {
    switch (loc) {
      case 'en':
        return '🇺🇸';
      case 'ru':
        return '🇷🇺';
      case 'es':
        return '🇪🇸';
      default:
        return '🌐';
    }
  };

  return (
    <div className="language-switcher" ref={dropdownRef}>
      <button
        className={`language-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        aria-label={t('select')}
      >
        <span className="flag">{getCurrentFlag(locale)}</span>
        <span className="language-name">{getLanguageName(locale)}</span>
        <span className="arrow">▼</span>
      </button>

      {isOpen && (
        <div className="language-dropdown">
          {locales.map((loc) => (
            <button
              key={loc}
              className={`language-option ${loc === locale ? 'active' : ''}`}
              onClick={() => handleLanguageChange(loc)}
              disabled={isPending || loc === locale}
            >
              <span className="flag">{getCurrentFlag(loc)}</span>
              <span className="language-name">{getLanguageName(loc)}</span>
            </button>
          ))}
        </div>
      )}

      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx>{`
        .language-switcher {
          position: relative;
          display: inline-block;
        }

        .language-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
          min-width: 120px;
        }

        .language-button:hover {
          background: #f5f5f5;
          border-color: #ccc;
        }

        .language-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .language-button.open {
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
          border-bottom-color: transparent;
        }

        .flag {
          font-size: 16px;
        }

        .language-name {
          flex: 1;
          text-align: left;
        }

        .arrow {
          font-size: 10px;
          transition: transform 0.2s ease;
        }

        .language-button.open .arrow {
          transform: rotate(180deg);
        }

        .language-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-top: none;
          border-radius: 0 0 6px 6px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }

        .language-option {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          text-align: left;
          transition: background-color 0.2s ease;
        }

        .language-option:hover {
          background: #f5f5f5;
        }

        .language-option:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .language-option.active {
          background: #e6f3ff;
          font-weight: 500;
        }

        .language-option:last-child {
          border-radius: 0 0 6px 6px;
        }
      `}</style>
    </div>
  );
}
