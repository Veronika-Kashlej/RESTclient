'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../components/authContext/authContext';
import { useTranslations } from 'next-intl';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import styles from '../page.module.scss';
import Link from 'next/link';
import About from '@/components/about/About';

export default function Home() {
  const t = useTranslations('auth');
  const params = useParams();
  const locale = params.locale as string;
  const { user, loading: authLoading, error: authError, signOut } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (authLoading) return <p className="loading-text">{t('loading')}</p>;

  if (!user) {
    return (
      <>
        <h1 className="title">Welcome!</h1>
        <About />
        <div className="header__btns">
          <Link href={`/${locale}/sign-in`} className="btn-primary">
            {t('signIn')}
          </Link>
          <Link href={`/${locale}/sign-up`} className="btn-primary">
            {t('signUp')}
          </Link>
        </div>
      </>
    );
  }

  if (loading) return <p className="loading-text">{t('loading')}</p>;

  if (authError) return <p className="error-text">Error: {authError}</p>;

  if (error) return <p className="error-text">Error: {error}</p>;

  return (
    <div className={styles['home-page']}>
      <h1 className="title">Postman clone is here</h1>
      <h2>Welcome back, {user.email}</h2>
      <div className="h3">
        A simple example query to Firebase works and was placed here:
        <p>{message}</p>
      </div>
      <About />
      <div className="navigation-links">
        <Link href={`/${locale}/client`} className="btn-primary">
          Go to REST Client
        </Link>
        <Link href={`/${locale}/history`} className="btn-secondary">
          View History
        </Link>
        <Link href={`/${locale}/variables`} className="btn-secondary">
          Manage Variables
        </Link>
      </div>
      <button className="signup-btn" onClick={() => signOut()}>
        {t('signOut')}
      </button>
    </div>
  );
}
