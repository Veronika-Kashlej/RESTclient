import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>404 - Page Not Found</h1>
      <p className="h2">Sorry, the page you are looking for does not exist.</p>
      <div className="h3">
        <p>You can go back to the home page or try one of these links:</p>
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/client">Client</Link>
          </li>
          <li>
            <Link href="/history">History</Link>
          </li>
          <li>
            <Link href="/variables">Variables</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
