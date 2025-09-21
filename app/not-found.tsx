import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p className="h2">Oops! The page you&lsquo;re looking for seems to have wandered off.</p>
      <div className="h3">
        <p>Don&lsquo;t worry, here are some helpful links to get you back on track:</p>
        <ul>
          <li>
            <Link href="/">🏠 Home</Link>
          </li>
          <li>
            <Link href="/client">🚀 Client</Link>
          </li>
          <li>
            <Link href="/history">📊 History</Link>
          </li>
          <li>
            <Link href="/variables">⚙️ Variables</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
