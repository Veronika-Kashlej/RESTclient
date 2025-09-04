import styles from './page.module.scss';

export default function Home() {
  return (
    <div className={styles.app} data-testid="app">
      <header className={styles.header} data-testid="header">
        <h1 className={styles.title}>Welcome to Next.js</h1>
        <p className={styles.description}>
          This is a Next.js application with TypeScript, ESLint, Prettier, and Vitest
        </p>
      </header>
    </div>
  );
}
