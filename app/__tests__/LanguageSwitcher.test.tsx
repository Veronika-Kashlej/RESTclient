import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LanguageSwitcher from '../components/LanguageSwitcher';

const mockReplace = vi.fn();
const mockUsePathname = vi.fn(() => '/en/client');
const mockUseLocale = vi.fn(() => 'en');
const mockUseTranslations = vi.fn(() => (key: string) => {
  const translations: Record<string, string> = {
    select: 'Select Language',
    english: 'English',
    russian: 'Русский',
    spanish: 'Español',
  };
  return translations[key] || key;
});

vi.mock('next-intl', () => ({
  useLocale: () => mockUseLocale(),
  useTranslations: () => mockUseTranslations(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => mockUsePathname(),
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders language switcher with current language', () => {
    render(<LanguageSwitcher />);

    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('🇺🇸')).toBeInTheDocument();
  });

  it('opens dropdown when button is clicked', () => {
    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Select Language');
    fireEvent.click(button);

    expect(screen.getByText('Русский')).toBeInTheDocument();
    expect(screen.getByText('Español')).toBeInTheDocument();
  });

  it('closes dropdown when language is selected', () => {
    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Select Language');
    fireEvent.click(button);

    const russianOption = screen.getByText('Русский');
    fireEvent.click(russianOption);

    expect(mockReplace).toHaveBeenCalledWith('/ru/client');
  });

  it('handles click outside to close dropdown', () => {
    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Select Language');
    fireEvent.click(button);

    expect(screen.getByText('Русский')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByText('Русский')).not.toBeInTheDocument();
  });

  it('handles escape key to close dropdown', () => {
    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Select Language');
    fireEvent.click(button);

    expect(screen.getByText('Русский')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByText('Русский')).not.toBeInTheDocument();
  });

  it('shows correct flags for each language', () => {
    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Select Language');
    fireEvent.click(button);

    expect(screen.getAllByText('🇺🇸')).toHaveLength(2);
    expect(screen.getByText('🇷🇺')).toBeInTheDocument();
    expect(screen.getByText('🇪🇸')).toBeInTheDocument();
  });

  it('disables current language option', () => {
    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Select Language');
    fireEvent.click(button);

    const englishOption = screen
      .getAllByText('English')
      .find((el) => el.closest('.language-option'));

    expect(englishOption?.closest('button')).toBeDisabled();
  });

  it('handles different locales correctly', () => {
    mockUseLocale.mockReturnValue('ru');
    mockUsePathname.mockReturnValue('/ru/variables');

    render(<LanguageSwitcher />);

    expect(screen.getByText('🇷🇺')).toBeInTheDocument();
    expect(screen.getByText('Русский')).toBeInTheDocument();

    const button = screen.getByLabelText('Select Language');
    fireEvent.click(button);

    const englishOption = screen.getByText('English');
    fireEvent.click(englishOption);

    expect(mockReplace).toHaveBeenCalledWith('/en/variables');
  });
});
