// Endless horizontal ticker (pure CSS animation). The visible track is hidden from
// screen readers; a plain-text copy is provided for them and for search engines.
export default function Marquee({ items, className = "" }) {
  const group = [...items, ...items].map((item, i) => (
    <span key={i}>
      {item}
      <i className="marquee-sep" aria-hidden="true" />
    </span>
  ));
  return (
    <div className={`marquee ${className}`}>
      <div className="marquee-track" aria-hidden="true">
        <div className="marquee-group">{group}</div>
        <div className="marquee-group">{group}</div>
      </div>
      <span className="visually-hidden">{items.join(", ")}</span>
    </div>
  );
}
