import React from 'react';
import Image from 'next/image';
import rsLogo from '../../assets/rss-logo.svg';

const Footer = () => {
  return (
    <footer data-testid="footer" className="footer">
      <a
        className="h3"
        rel="noreferrer"
        target="_blank"
        href="https://github.com/Veronika-Kashlej/rest-client-app/tree/main"
      >
        rest-client-app
      </a>
      <p className="h4">2025</p>
      <a rel="noreferrer" target="_blank" href="https://rs.school/courses/reactjs">
        <Image src={rsLogo} alt="404 error" width={80} height={80} />
      </a>
    </footer>
  );
};

export default Footer;
