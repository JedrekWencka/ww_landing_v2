export default function Tour({ t }) {
  return (
    <section className="tour split" id="tour">
      <h2 className="label">{t.tour.title}</h2>
      <p className="tour-text">{t.tour.text}</p>
    </section>
  );
}
