'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './components/authContext/authContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/firebase';
import styles from './page.module.scss';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading, error: authError, signOut } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    async function fetchMessage() {
      try {
        const docRef = doc(db, 'testCollection', 'testDoc');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setMessage(docSnap.data().message);
        } else {
          setError('No such document!');
        }
      } catch (err) {
        setError('Failed to fetch document');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchMessage();
  }, [user]);

  if (authLoading) return <p className="loading-text">Loading...</p>;

  if (!user)
    return (
      <>
        <h1 className="title">Welcome!</h1>
        <div className="header__btns">
          <Link href="/sign-in" className="btn-primary">
            Sign in
          </Link>
          <Link href="/sign-up" className="btn-primary">
            Sign up
          </Link>
        </div>
      </>
    );

  if (loading) return <p className="loading-text">Loading...</p>;

  if (authError) return <p className="error-text">Error: {authError}</p>;

  if (error) return <p className="error-text">Error: {error}</p>;

  return (
    <div className={styles['home-page']}>
      <h1 className="title">Postman clone is here</h1>
      <h2>Welcome back, {user.email}</h2>
      <div className="h3">
        A simple example query to Firebase works and was placed here:
        <p> {message}</p>
      </div>
      <button className="signup-btn" onClick={() => signOut()}>
        Logout
      </button>
    </div>
  );
}
