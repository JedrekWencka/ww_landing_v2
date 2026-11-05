// Legal pages of the shop (terms, privacy, returns), English and Polish.
//
// !! These are DRAFTS written as a starting point. Have a lawyer check them before you sell.
// !! Any "TODO-FILL" left in the texts makes deploy/hetzner.sh refuse to publish.

import { ZONES } from "../server/shipping.mjs";
import { money } from "./shop/cart.js";

export const SELLER = {
  name: "B19 Jędrzej Wencka",
  address: "Brzozowa 19, 63-100 Nochowo, Polska",
  nip: "PL7851707393",
  email: "kontakt.whitewater@gmail.com",
  phone: "",
  // Set to false if the company is exempt from VAT; the terms then say prices do not include VAT.
  vatPayer: true,
};

// "15,00 zł – Polska, 60,00 zł – Europa, 105,00 zł – Poza Europą" (taken from server/shipping.mjs, so it can't drift)
const rates = (lang) => {
  const cur = lang === "pl" ? "PLN" : "EUR";
  return ZONES.map((z) => `${money(z.amount[cur], cur, lang)} – ${z.name[lang]}`).join(lang === "pl" ? "; " : "; ");
};

const seller = (lang) =>
  [SELLER.name, SELLER.address, `NIP: ${SELLER.nip}`, `e-mail: ${SELLER.email}`, SELLER.phone && `tel.: ${SELLER.phone}`].filter(Boolean).join(", ");

export function legalDocs(lang) {
  const S = seller(lang);
  const vatEn = SELLER.vatPayer ? "All prices are gross prices and include VAT." : "The seller is exempt from VAT; prices do not include VAT.";
  const vatPl = SELLER.vatPayer ? "Wszystkie ceny są cenami brutto, czyli zawierają podatek VAT." : "Sprzedawca jest zwolniony z VAT; ceny nie zawierają podatku VAT.";

  if (lang === "pl")
    return {
      terms: {
        title: "Regulamin sklepu",
        updated: "Obowiązuje od: listopad 2026",
        sections: [
          { h: "1. Sprzedawca", p: [`Sklep internetowy WHITEWATER prowadzi: ${S} (dalej: „Sprzedawca”).`, "Kontakt w sprawie zamówień: " + SELLER.email + "."] },
          { h: "2. Produkty i ceny", p: ["Sklep oferuje płyty CD i koszulki zespołu WHITEWATER. Na polskiej wersji strony (/pl/) ceny podano w złotych (PLN), a na wersji międzynarodowej (angielskiej) w euro (EUR). Waluta zamówienia jest widoczna w koszyku i w kasie.", vatPl, "Cena końcowa, wraz z kosztem wysyłki, jest widoczna w koszyku i w kasie przed zapłatą."] },
          { h: "3. Zamówienia", p: ["Zamówienie składa się, dodając produkty do koszyka i przechodząc do kasy. Umowa sprzedaży zostaje zawarta z chwilą potwierdzenia płatności.", "Potwierdzenie zamówienia i płatności klient otrzymuje e-mailem. Sprzedawca może odmówić realizacji zamówienia, jeśli produkt jest niedostępny; w takim przypadku płatność zostanie zwrócona."] },
          { h: "4. Płatności", p: ["Płatności obsługuje Stripe Payments Europe, Ltd. Dostępne metody płatności (np. karty, Apple Pay, Google Pay, BLIK, Przelewy24) zależą od kraju klienta i są wyświetlane w kasie. Sprzedawca nie przechowuje danych kart płatniczych."] },
          { h: "5. Wysyłka", p: ["Wysyłamy na całym świecie, z wyjątkiem krajów niewymienionych na liście w koszyku. Koszt wysyłki jest stały dla zamówienia: " + rates("pl") + ".", "Przewidywany czas dostawy: Polska 2–3 dni robocze, Europa 4–10 dni roboczych, pozostałe kraje 8–21 dni roboczych, licząc od zaksięgowania płatności. W przypadku wysyłki poza Unię Europejską odbiorca może być obciążony cłem i podatkami importowymi, które pobierają organy kraju przeznaczenia."] },
          { h: "6. Odstąpienie od umowy", p: ["Konsument ma prawo odstąpić od umowy w terminie 14 dni bez podania przyczyny. Szczegóły i wzór formularza znajdują się na stronie „Zwroty”."] },
          { h: "7. Reklamacje", p: ["Sprzedawca odpowiada za zgodność towaru z umową na zasadach określonych w przepisach prawa. Reklamację można zgłosić e-mailem na adres " + SELLER.email + ", opisując problem i dołączając, jeśli to możliwe, zdjęcia. Odpowiemy w ciągu 14 dni."] },
          { h: "8. Dane osobowe", p: ["Zasady przetwarzania danych osobowych opisuje Polityka prywatności."] },
          { h: "9. Postanowienia końcowe", p: ["W sprawach nieuregulowanych stosuje się prawo polskie, z zachowaniem praktyk ochrony konsumentów mających zastosowanie w kraju zamieszkania konsumenta. Sprzedawca może zmienić regulamin; zmiany nie dotyczą zamówień już złożonych."] },
        ],
      },
      privacy: {
        title: "Polityka prywatności",
        updated: "Obowiązuje od: listopad 2026",
        sections: [
          { h: "1. Administrator", p: [`Administratorem danych osobowych jest ${S}. Kontakt: ${SELLER.email}.`] },
          { h: "2. Jakie dane i po co", p: ["Realizacja zamówienia: imię i nazwisko, adres dostawy, adres e-mail, numer telefonu (potrzebny kurierowi), zawartość zamówienia. Podstawa: wykonanie umowy (art. 6 ust. 1 lit. b RODO).", "Rachunkowość i podatki: dane z zamówienia i faktur, przechowywane 5 lat od końca roku podatkowego (art. 6 ust. 1 lit. c RODO).", "Dochodzenie lub obrona roszczeń: art. 6 ust. 1 lit. f RODO.", "Statystyki odwiedzin (Google Analytics): tylko po wyrażeniu zgody w banerze cookies (art. 6 ust. 1 lit. a RODO). Zgodę można w każdej chwili zmienić przyciskiem „Ustawienia cookies” w stopce."] },
          { h: "3. Odbiorcy danych", p: ["Stripe Payments Europe, Ltd. (płatności, faktury, ochrona przed nadużyciami), firmy kurierskie i pocztowe (dostawa), dostawca hostingu (Hetzner Online GmbH), Google Ireland Limited (statystyki, po zgodzie). Niektórzy odbiorcy mogą przetwarzać dane poza EOG; wtedy stosuje się mechanizmy przewidziane w RODO (np. standardowe klauzule umowne)."] },
          { h: "4. Okres przechowywania", p: ["Dane zamówień: 5 lat od końca roku podatkowego. Dane do celów statystycznych: zgodnie z ustawieniami Google Analytics."] },
          { h: "5. Twoje prawa", p: ["Masz prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia oraz sprzeciwu, a także prawo do wycofania zgody w dowolnym momencie. Napisz na " + SELLER.email + ". Masz też prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych (uodo.gov.pl)."] },
          { h: "6. Dobrowolność", p: ["Podanie danych jest dobrowolne, ale niezbędne do realizacji zamówienia."] },
        ],
      },
      returns: {
        title: "Zwroty i odstąpienie od umowy",
        updated: "Obowiązuje od: listopad 2026",
        sections: [
          { h: "Prawo odstąpienia (14 dni)", p: ["Jako konsument możesz odstąpić od umowy w ciągu 14 dni od dnia, w którym otrzymałeś(-aś) towar, bez podawania przyczyny. Wystarczy przed upływem terminu wysłać oświadczenie na " + SELLER.email + " lub pocztą na adres: " + SELLER.address + ". Możesz skorzystać z formularza poniżej."] },
          { h: "Zwrot towaru i pieniędzy", p: ["Odeślij towar niezwłocznie, nie później niż w ciągu 14 dni od odstąpienia, na adres: " + SELLER.address + ". Bezpośredni koszt odesłania towaru ponosi kupujący. Zwrócimy płatność, w tym koszt podstawowej wysyłki do Ciebie, w ciągu 14 dni od otrzymania oświadczenia, tą samą metodą płatności; możemy wstrzymać zwrot do czasu otrzymania towaru lub dowodu jego odesłania.", "Odpowiadasz za zmniejszenie wartości towaru wynikające z korzystania z niego w sposób wykraczający poza konieczny do stwierdzenia jego charakteru, cech i funkcjonowania. Płyty CD otwarte po zdjęciu folii mogą być zwrócone, jeśli nie noszą śladów używania."] },
          { h: "Wzór formularza odstąpienia", p: ["Adresat: " + S, "Ja/My (*) niniejszym informuję/informujemy (*) o moim/naszym odstąpieniu od umowy sprzedaży następujących towarów: ........ Data zawarcia umowy / odbioru: ........ Imię i nazwisko konsumenta: ........ Adres konsumenta: ........ Data i podpis (tylko jeśli formularz jest w wersji papierowej): ........  (*) Niepotrzebne skreślić."] },
          { h: "Reklamacje", p: ["Jeśli towar ma wadę, napisz na " + SELLER.email + ". Przysługują Ci uprawnienia z tytułu niezgodności towaru z umową na zasadach określonych w przepisach."] },
        ],
      },
    };

  return {
    terms: {
      title: "Terms of sale",
      updated: "Effective: November 2026",
      sections: [
        { h: "1. Seller", p: [`The WHITEWATER online shop is run by: ${S} (the “Seller”).`, `Contact for orders: ${SELLER.email}.`] },
        { h: "2. Products and prices", p: ["The shop sells WHITEWATER CDs and T-shirts. Prices are in euro (EUR) on the English (international) version of the site and in Polish złoty (PLN) on the Polish version (/pl/). The currency of your order is shown in the cart and at checkout.", vatEn, "The final price, including shipping, is shown in the cart and at checkout before you pay."] },
        { h: "3. Orders", p: ["You order by adding products to the cart and going to checkout. The contract of sale is concluded when your payment is confirmed.", "You receive confirmation of the order and payment by e-mail. If a product turns out to be unavailable, the Seller may cancel the order and refund the payment."] },
        { h: "4. Payment", p: ["Payments are processed by Stripe Payments Europe, Ltd. The payment methods offered at checkout (for example cards, Apple Pay, Google Pay, BLIK, Przelewy24) depend on your country. The Seller does not store card details."] },
        { h: "5. Shipping", p: ["We ship worldwide to the countries offered in the cart. Shipping is a flat rate per order: " + rates("en") + ".", "Estimated delivery times, counted from confirmed payment: Poland 2–3 working days, Europe 4–10 working days, rest of the world 8–21 working days. For destinations outside the European Union, customs duties and import taxes may be charged by the authorities of the destination country."] },
        { h: "6. Right of withdrawal", p: ["If you are a consumer you may withdraw from the purchase within 14 days without giving a reason. Details and a model form are on the Returns page."] },
        { h: "7. Complaints", p: [`The Seller is responsible for goods that do not conform to the contract, as provided by law. Send complaints to ${SELLER.email} with a description of the problem and, if possible, photos. We will reply within 14 days.`] },
        { h: "8. Personal data", p: ["How personal data is handled is described in the Privacy policy."] },
        { h: "9. Final provisions", p: ["Polish law applies, without removing the mandatory consumer protection of your country of residence. The Seller may change these terms; changes do not affect orders already placed."] },
      ],
    },
    privacy: {
      title: "Privacy policy",
      updated: "Effective: November 2026",
      sections: [
        { h: "1. Controller", p: [`The controller of your personal data is ${S}. Contact: ${SELLER.email}.`] },
        { h: "2. What data, and why", p: ["Fulfilling your order: name, delivery address, e-mail address, phone number (needed by the courier) and the content of the order. Legal basis: performance of a contract (Art. 6(1)(b) GDPR).", "Accounting and tax: order and invoice data, kept for 5 years after the end of the tax year (Art. 6(1)(c) GDPR).", "Establishing or defending legal claims: Art. 6(1)(f) GDPR.", "Visit statistics (Google Analytics): only if you accept in the cookie banner (Art. 6(1)(a) GDPR). You can change your choice at any time with “Cookie settings” in the footer."] },
        { h: "3. Recipients", p: ["Stripe Payments Europe, Ltd. (payments, invoices, fraud prevention), courier and postal companies (delivery), the hosting provider (Hetzner Online GmbH) and Google Ireland Limited (statistics, with your consent). Some recipients may process data outside the EEA; in that case the safeguards required by the GDPR apply (for example standard contractual clauses)."] },
        { h: "4. Retention", p: ["Order data: 5 years after the end of the tax year. Statistics data: according to the Google Analytics settings."] },
        { h: "5. Your rights", p: [`You have the right to access, rectify and erase your data, to restrict or object to processing, to data portability, and to withdraw consent at any time. Write to ${SELLER.email}. You may also complain to the supervisory authority (in Poland: the President of the Personal Data Protection Office, uodo.gov.pl).`] },
        { h: "6. Voluntary", p: ["Providing your data is voluntary, but necessary to fulfil an order."] },
      ],
    },
    returns: {
      title: "Returns and withdrawal",
      updated: "Effective: November 2026",
      sections: [
        { h: "Right of withdrawal (14 days)", p: [`As a consumer you can withdraw from the purchase within 14 days of receiving the goods, without giving a reason. Before the deadline ends, send a clear statement to ${SELLER.email} or by post to ${SELLER.address}. You can use the form below.`] },
        { h: "Returning goods and refunds", p: [`Send the goods back without delay, and no later than 14 days after you withdraw, to: ${SELLER.address}. The buyer pays the direct cost of returning the goods. We refund the payment, including the standard shipping cost to you, within 14 days of receiving your statement, using the same payment method; we may hold the refund until we receive the goods or proof that you sent them back.`, "You are liable for any loss in value caused by handling the goods beyond what is needed to establish their nature, characteristics and functioning. CDs whose shrink-wrap you removed can be returned if they show no signs of use."] },
        { h: "Model withdrawal form", p: ["To: " + S, "I/We (*) hereby give notice that I/We (*) withdraw from my/our (*) contract of sale of the following goods: ........ Ordered on / received on (*): ........ Name of consumer: ........ Address of consumer: ........ Signature (only if this form is notified on paper): ........ Date: ........  (*) Delete as appropriate."] },
        { h: "Defective goods", p: [`If an item is faulty, write to ${SELLER.email}. You have the rights provided by law for goods that do not conform to the contract.`] },
      ],
    },
  };
}
