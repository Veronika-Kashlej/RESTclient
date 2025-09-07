'use client';
import './App.scss';

import { useState, useEffect } from 'react';

import Header from './components/header/header';
import Footer from './components/footer/footer';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', onScroll);
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div className="app" data-testid="app">
      <Header className={isScrolled ? 'header _active' : 'header'}></Header>
      <main style={{ flex: 1 }}>
        <p>Postman clone is here</p>
        <p className="h2">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
          exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
          neque eligendi aspernatur quia quidem, natus harum quos.
        </p>
        <p className="h2">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
          exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
          neque eligendi aspernatur quia quidem, natus harum quos.
        </p>
        <p className="h2">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
          exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
          neque eligendi aspernatur quia quidem, natus harum quos.
        </p>
        <p className="h2">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
          exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
          neque eligendi aspernatur quia quidem, natus harum quos.
        </p>
        <p className="h3">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
          exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
          neque eligendi aspernatur quia quidem, natus harum quos.
        </p>
        <p className="h3">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
          exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
          neque eligendi aspernatur quia quidem, natus harum quos.
        </p>
        <p className="h3">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
          exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
          neque eligendi aspernatur quia quidem, natus harum quos.
        </p>
        <p className="h3">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
          exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
          neque eligendi aspernatur quia quidem, natus harum quos.
        </p>
        <p className="h2">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
          exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
          neque eligendi aspernatur quia quidem, natus harum quos.
        </p>
        <p className="h2">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
          exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
          neque eligendi aspernatur quia quidem, natus harum quos.
        </p>
        <p className="h2">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
          exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
          neque eligendi aspernatur quia quidem, natus harum quos.
        </p>
        <p className="h2">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
          exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
          neque eligendi aspernatur quia quidem, natus harum quos.
        </p>
        <p className="h2">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
          exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
          neque eligendi aspernatur quia quidem, natus harum quos.
        </p>
        <p className="h2">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
          exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
          neque eligendi aspernatur quia quidem, natus harum quos.
        </p>
        <p className="h2">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
          exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
          neque eligendi aspernatur quia quidem, natus harum quos.
        </p>
        <p className="h2">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
          exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
          neque eligendi aspernatur quia quidem, natus harum quos.
        </p>
      </main>
      <Footer></Footer>
    </div>
  );
}
