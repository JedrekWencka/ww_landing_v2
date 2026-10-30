import { LINKS } from "../links.js";
import { slides } from "../data/slides.js";
import Marquee from "./Marquee.jsx";
import Slider from "./Slider.jsx";

export default function Hero({ t }) {
  return (
    <section className="hero split" id="home">
      <div className="hero-left">
        <div className="hero-brand">
          <h1>
            <img src="/wordmark.png" width="1408" height="221" alt={t.hero.wordmarkAlt} />
          </h1>
        </div>

        <Marquee className="marquee-hero" items={t.hero.ticker} />

        <div className="hero-mail">
          <a href={`mailto:${LINKS.email}`}>{LINKS.email}</a>
        </div>

        <p className="hero-lead">
          {t.hero.lead.map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
          <a href={LINKS.bandcamp} target="_blank" rel="noopener noreferrer">
            {t.hero.leadLink}
          </a>
          .
        </p>
      </div>

      <div className="hero-right">
        <Slider slides={slides} t={t} />
      </div>
    </section>
  );
}
