import { LINKS } from "../links.js";
import Marquee from "./Marquee.jsx";

export default function Listen({ t }) {
  const l = t.listen;
  const cards = [
    { key: "afterlife", href: LINKS.album, src: "/gallery/album/Digipack_Mockup_3.jpg", alt: t.alt.digipackCover },
    { key: "blackfire", href: LINKS.blackfire, src: "/gallery/album/Snapseed_1.jpg", alt: t.alt.blackfireOpen },
  ];
  const streams = [
    { name: "Bandcamp", href: LINKS.album },
    { name: "Spotify", href: LINKS.spotify },
    { name: "Apple Music", href: LINKS.appleMusic },
    { name: "YouTube", href: LINKS.youtube },
  ];

  return (
    <section className="listen" id="listen">
      <div className="split-head split">
        <h2 className="label">{l.title}</h2>
        <Marquee className="marquee-big" items={l.ticker} />
      </div>

      <div className="cards split">
        {cards.map((card) => {
          const r = l.releases[card.key];
          return (
            <a key={card.key} className="card" href={card.href} target="_blank" rel="noopener noreferrer">
              <img src={card.src} alt={card.alt} loading="lazy" decoding="async" />
              <span className="card-tag">
                <i className="dot" aria-hidden="true" />
                {r.title}
              </span>
              <span className="card-foot">
                <span className="card-meta">
                  {r.meta}
                  <b>{r.status}</b>
                </span>
                <span className="pill pill-dashed pill-ghost">{l.cta} ↗</span>
              </span>
            </a>
          );
        })}
      </div>

      <div className="rows-block">
        <p className="rows-intro">{l.text}</p>
        <ul className="rows">
          {streams.map((s) => (
            <li key={s.name}>
              <a href={s.href} target="_blank" rel="noopener noreferrer">
                {s.name}
                <span className="rows-arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
