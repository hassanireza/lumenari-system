import type { CSSProperties } from 'react';

type World = {
  name: string;
  language: string;
  href: string;
  color: string;
  description: string;
  status: string;
};

const worlds: World[] = [
  { name: 'Noctiluca', language: 'Python', href: 'https://hassanireza.github.io/noctiluca/', color: '#6fe3f2', description: 'Find your way through the dark.', status: 'Live' },
  { name: 'Aurora', language: 'CSS', href: 'https://hassanireza.github.io/aurora/', color: '#ffbd78', description: 'Shape the cascade.', status: 'Explore the CSS world' },
  { name: 'Vespera', language: 'HTML', href: 'https://hassanireza.github.io/vespera/', color: '#d8c18a', description: 'Build the document.', status: 'Explore the HTML world' },
  { name: 'Stellara', language: 'JavaScript', href: 'https://hassanireza.github.io/stellara/', color: '#79a8ff', description: 'Think in signals.', status: 'Explore the JavaScript world' },
  { name: 'Lunara', language: 'React', href: 'https://hassanireza.github.io/lunara/', color: '#d5a5ff', description: 'Compose something alive.', status: 'Explore the React world' },
  { name: 'Eclipsa', language: 'Django', href: 'https://hassanireza.github.io/eclipsa/', color: '#8fdaa1', description: 'Route the hidden world.', status: 'Explore the Django world' },
];

const constellation = ['#6fe3f2', '#ffbd78', '#d8c18a', '#79a8ff', '#d5a5ff', '#8fdaa1'];

export default function App() {
  return (
    <main>
      <nav>
        <a className="logo" href="#top"><span aria-hidden="true">✦</span> LUMENARI</a>
        <span className="nav-note">SIX WORLDS · ONE UNIVERSE</span>
      </nav>
      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="orbit orbit-a" />
        <div className="orbit orbit-b" />
        <div className="sun" />
        {constellation.map((color, index) => <i key={color} className={`planet p${index}`} style={{ '--c': color } as CSSProperties} />)}
        <span className="eyebrow">A CONSTELLATION OF CODE</span>
        <h1 id="hero-title">The Lumenari<br /><em>System</em></h1>
        <p>Six worlds. Six languages. A thousand small discoveries in every orbit.</p>
        <a className="scroll" href="#worlds" aria-label="Explore the six worlds">↓</a>
      </section>
      <section className="worlds" id="worlds" aria-labelledby="worlds-title">
        <header>
          <div><span className="eyebrow">CHOOSE YOUR ORBIT</span><h2 id="worlds-title">Where will you begin?</h2></div>
          <span className="count">06 WORLDS</span>
        </header>
        <div className="cards">
          {worlds.map((world, index) => (
            <a className="world" href={world.href} style={{ '--c': world.color } as CSSProperties} key={world.name}>
              <span className="planet-icon" aria-hidden="true">✧</span>
              <span className="order">0{index + 1} / 06</span>
              <h3>{world.name}</h3>
              <span className="lang">{world.language}</span>
              <span className="desc">{world.description}</span>
              <span className="status">{world.status}<b aria-hidden="true">↗</b></span>
            </a>
          ))}
        </div>
      </section>
      <footer><span>THE LUMENARI SYSTEM</span><span>ONE SKY · MANY WAYS TO LEARN</span></footer>
    </main>
  );
}
