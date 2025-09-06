import React from 'react';

import Image from 'next/image';

const Footer = () => {
  return (
    <footer data-testid="footer" className="footer">
      <a className="h3" href="https://github.com/Veronika-Kashlej/rest-client-app/tree/main">
        rest-client-app
      </a>
      <p className="h4">2025</p>
      <Image
        src="https://avatars.githubusercontent.com/u/11501370?s=280&v=4"
        alt="404 error"
        width={1200}
        height={600}
      />
    </footer>
  );
};

export default Footer;
