'use client';
import { useState, FormEvent } from 'react';
import { auth } from '../firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('A new error occurred');
    }
  };

  return (
    <>
      <h1>Sign In</h1>
      <p className="h2">Welcome back! Please sign in to your account.</p>
      <div className="h3 auth-wrapper">
        <form onSubmit={handleLogin}>
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
          <label className="ui-checkbox">
            <p className="h3">Show password</p>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            ></input>
            <span></span>
          </label>
          <button className="signin-btn" type="submit">
            Login
          </button>
        </form>
        {error && <p className="auth-wrapper__error">{error}</p>}
      </div>
    </>
  );
}
