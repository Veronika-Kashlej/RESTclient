'use client';

import { useState, FormEvent } from 'react';
import { auth } from '../../firebase/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function SignUp() {
  const t = useTranslations('auth');
  const params = useParams();
  const locale = params.locale as string;
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push(`/${locale}`);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('A new error occurred');
    }
  };

  return (
    <div className="auth-page">
      <h1>{t('signUp')}</h1>
      <p className="h2">Create your account to get started.</p>
      <div className="h3 auth-wrapper">
        <form className="sign-upForm" onSubmit={handleRegister}>
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
          <input
            className="ui-input"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('confirmPassword')}
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
          />
          <label className="ui-checkbox">
            <p className="h3">{showPassword ? t('hidePassword') : t('showPassword')}</p>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            ></input>
            <span></span>
          </label>
          <button className="signup-btn" type="submit">
            {t('registerButton')}
          </button>
        </form>
        {error && <p className="auth-wrapper__error">{error}</p>}
      </div>
    </div>
  );
}
