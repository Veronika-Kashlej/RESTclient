'use client';
import { useState, FormEvent, useEffect } from 'react';
import { auth } from '../../firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '../../components/authContext/authContext';

export default function SignIn() {
  const t = useTranslations('auth');
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.push(`/${locale}`);
    }
  }, [user, loading, router, locale]);
  if (loading) {
    return <div className="loading-text">{t('loading')}</div>;
  }

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push(`/${locale}`);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('A new error occurred');
    }
  };

  return (
    <>
      <h1>{t('signIn')}</h1>
      <p className="h2">{t('welcomeBackMessage')}</p>
      <div className="h3 auth-wrapper">
        <form onSubmit={handleLogin}>
          <input
            className="ui-input"
            type="email"
            placeholder={t('email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <br />
          <input
            className="ui-input"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <br />
          <label className="ui-checkbox">
            <p className="h3">{showPassword ? t('hidePassword') : t('showPassword')}</p>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            ></input>
            <span></span>
          </label>
          <button className="signin-btn" type="submit">
            {t('loginButton')}
          </button>
        </form>
        {error && <p className="auth-wrapper__error">{error}</p>}
      </div>
    </>
  );
}
