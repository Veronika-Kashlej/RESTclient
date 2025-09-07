import React from 'react';

import rsLogo from '../../assets/rss-logo.svg';
import Image from 'next/image';

const Header = () => {
  return (
    <header data-testid="header" className="header">
      <a rel="noreferrer" target="_blank" href="https://rs.school/courses/reactjs">
        <Image src={rsLogo} alt="404 error" width={80} height={80} />
      </a>
      <button className="btn-language">Change to DE</button>
      <div className="header__btns">
        <button className="btn-primary">Sign in</button>
        <button className="btn-primary">Sign up</button>
      </div>
    </header>
  );
};

export default Header;
