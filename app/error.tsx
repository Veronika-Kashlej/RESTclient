'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import styles from './error.module.css';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    toast.error('Application error occurred');
  }, [error]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>Something went wrong!</h2>
        <button onClick={reset} className={styles.button}>
          Try again
        </button>
      </div>
    </div>
  );
}
