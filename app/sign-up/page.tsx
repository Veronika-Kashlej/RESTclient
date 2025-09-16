'use client';

import { useState, FormEvent } from 'react';
import { auth } from '../firebase/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function SignUp() {
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
      setError('Passwords do not match');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('A new error occurred');
    }
  };

  return (
    <div className="auth-page">
      <h1>Sign Up</h1>
      <p className="h2">Create your account to get started.</p>
      <div className="h3 auth-wrapper">
        <form className="sign-upForm" onSubmit={handleRegister}>
          <input
            className="ui-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <br />
          <input
            className="ui-input"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <br />
          <input
            className="ui-input"
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
          />
          <label className="ui-checkbox">
            <p className="h3">Show password</p>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            ></input>
            <span></span>
          </label>
          <button className="signup-btn" type="submit">
            Register
          </button>
        </form>
        {error && <p className="auth-wrapper__error">{error}</p>}
      </div>
    </div>
  );
}
