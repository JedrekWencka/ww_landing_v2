import { useEffect, useState } from "react";

export default function Slider({ slides, t }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const go = (step) => setIndex((n) => (n + step + count) % count);

  useEffect(() => {
    if (paused) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = window.setInterval(() => setIndex((n) => (n + 1) % count), 6500);
    return () => window.clearInterval(timer);
  }, [paused, count]);

  const current = slides[index];
  const alt = (slide) => (slide.alt === "cover" ? t.hero.coverAlt : t.alt[slide.alt]);

  return (
    <div
      className="slider"
      role="group"
      aria-roledescription="carousel"
      aria-label={t.hero.slider}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {slides.map((slide, n) => (
        <figure key={slide.src} className={`slide${n === index ? " is-on" : ""}`} aria-hidden={n !== index}>
          <img className="slide-bg" src={slide.src} alt="" aria-hidden="true" loading={n === 0 ? "eager" : "lazy"} decoding="async" />
          <img
            className="slide-img"
            src={slide.src}
            alt={alt(slide)}
            loading={n === 0 ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={n === 0 ? "high" : undefined}
          />
        </figure>
      ))}

      <div className="slider-cap" aria-live="polite">
        <span className="slider-title">
          <i className="dot" aria-hidden="true" />
          {t.hero.captions[current.caption]}
        </span>
        <span className="slider-ctrl">
          <button type="button" className="arrow-btn" aria-label={t.hero.prev} onClick={() => go(-1)}>
            &lt;
          </button>
          <span className="slider-count" aria-hidden="true">
            {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
          <button type="button" className="arrow-btn" aria-label={t.hero.next} onClick={() => go(1)}>
            &gt;
          </button>
        </span>
      </div>
    </div>
  );
}
