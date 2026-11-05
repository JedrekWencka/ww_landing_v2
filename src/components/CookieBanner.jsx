import { useEffect, useState } from "react";
import { CONSENT_EVENT, getConsent, setConsent } from "../analytics.js";

// Asks once; the footer's "Cookie settings" link opens it again. Rendered only in the browser
// (after mount), so the pre-rendered HTML is identical for everyone and hydration stays clean.
export default function CookieBanner({ t }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (getConsent() === null) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(CONSENT_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_EVENT, reopen);
  }, []);

  if (!open) return null;

  const choose = (choice) => {
    setConsent(choice);
    setOpen(false);
  };

  return (
    <div className="consent" role="dialog" aria-label={t.consent.label}>
      <p>
        {t.consent.text} <a href={t.consent.privacyUrl}>{t.consent.privacy}</a>
      </p>
      <div className="consent-actions">
        <button type="button" className="pill pill-dashed" onClick={() => choose("denied")}>
          {t.consent.decline}
        </button>
        <button type="button" className="pill consent-accept" onClick={() => choose("granted")}>
          {t.consent.accept}
        </button>
      </div>
    </div>
  );
}
