export default function Band({ t }) {
  const b = t.band;
  return (
    <section className="band" id="band">
      <h2 className="label">{b.title}</h2>
      <p className="statement">{b.text}</p>

      <div className="band-grid split">
        <div aria-hidden="true" />
        <div className="band-side">
          <dl className="facts">
            <div>
              <dt>{b.genreLabel}</dt>
              <dd>{b.genre}</dd>
            </div>
            <div>
              <dt>{b.baseLabel}</dt>
              <dd>{b.base}</dd>
            </div>
            <div>
              <dt>{b.lineupLabel}</dt>
              <dd>{b.lineup}</dd>
            </div>
            <div>
              <dt>{b.influencesLabel}</dt>
              <dd>
                <ul className="influences">
                  {b.influences.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
          <a className="pill pill-dashed" href="#listen">
            {b.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
