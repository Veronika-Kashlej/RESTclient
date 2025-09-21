import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from '../components/header/header';

vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ locale: 'en' })),
  usePathname: vi.fn(() => '/en'),
  useRouter: vi.fn(() => ({ replace: vi.fn() })),
}));

vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useTransition: vi.fn(() => [false, vi.fn()]),
  };
});

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      home: 'Home',
      client: 'Client',
      history: 'History',
      variables: 'Variables',
      mainPage: 'Main Page',
      select: 'Select Language',
      english: 'English',
      russian: 'Русский',
      spanish: 'Español',
    };
    return translations[key] || key;
  }),
  useLocale: vi.fn(() => 'en'),
}));

vi.mock('../components/authContext/authContext', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
    error: null,
    signOut: vi.fn(),
  })),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    className: string;
  }) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    width,
    height,
    ...props
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
  }) => <img src={src} alt={alt} width={width} height={height} {...props} />, // eslint-disable-line @next/next/no-img-element
}));

vi.mock('../Navigation', () => ({
  default: () => <div data-testid="navigation">Navigation</div>,
}));

vi.mock('../../assets/rss-logo.svg', () => ({
  default: 'mocked-rss-logo.svg',
}));

describe('Header Component', () => {
  it('should render header with correct test id and className', () => {
    render(<Header className="test-header" />);

    const header = screen.getByTestId('header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('test-header');
  });

  it('should render RSS logo with home link', () => {
    render(<Header className="test-header" />);

    const logo = screen.getByAltText('RSS Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('width', '80');
    expect(logo).toHaveAttribute('height', '80');

    const logoLink = logo.closest('a');
    expect(logoLink).toHaveAttribute('href', '/en');
  });

  it('should render Navigation component', () => {
    render(<Header className="test-header" />);

    const navigation = screen.getByTestId('navigation');
    expect(navigation).toBeInTheDocument();
    expect(navigation).toHaveTextContent('HomeClientHistoryVariables');
  });

  it('should render sign in button', () => {
    render(<Header className="test-header" />);

    const signInButton = screen.getByText('Sign In');
    expect(signInButton).toBeInTheDocument();
    expect(signInButton.closest('a')).toHaveAttribute('href', '/en/sign-in');
    expect(signInButton.closest('a')).toHaveClass('btn-primary');
  });

  it('should render sign up button', () => {
    render(<Header className="test-header" />);

    const signUpButton = screen.getByText('Sign Up');
    expect(signUpButton).toBeInTheDocument();
    expect(signUpButton.closest('a')).toHaveAttribute('href', '/en/sign-up');
    expect(signUpButton.closest('a')).toHaveClass('btn-primary');
  });

  it('should render header buttons container', () => {
    render(<Header className="test-header" />);

    const buttonsContainer = screen.getByText('Sign In').closest('div');
    expect(buttonsContainer).toHaveClass('header__btns');
  });

  it('should render all header elements', () => {
    render(<Header className="test-header" />);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByAltText('RSS Logo')).toBeInTheDocument();
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('should render header with custom className', () => {
    const customClassName = 'custom-header-class';
    render(<Header className={customClassName} />);

    const header = screen.getByTestId('header');
    expect(header).toHaveClass(customClassName);
  });
});
