// Shipping: one flat rate per order, by destination. EDIT THE NUMBERS HERE.
// Amounts are minor units (1500 = 15.00).

const EU = "AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE".split(" ");
const EUROPE_OTHER = "GB CH NO IS LI AD MC SM VA ME MK RS AL BA XK MD UA TR GI IM JE GG FO".split(" ");

// Every country we ship to (the rest of the world is anything else on Stripe's list below).
const WORLD = (
  "AE AG AI AM AO AQ AR AU AW AZ BB BD BF BH BI BJ BL BM BN BO BQ BR BS BT BW BZ CA CD CF CG CI CK CL CM CN CO CR CV CW " +
  "DJ DM DO DZ EC EG ER ET FJ FK GA GD GE GF GH GM GN GP GQ GT GU GW GY HK HN HT ID IL IN IQ JM JO JP KE KG KH KI KM KN " +
  "KR KW KY KZ LA LB LC LK LR LS MA MG ML MM MN MO MQ MR MS MU MV MW MX MY MZ NA NC NE NG NI NP NR NU NZ OM PA PE PF PG " +
  "PH PK PM PR PY QA RE RW SA SB SC SG SL SN SO SR SS ST SV SX SZ TC TD TG TH TJ TL TM TN TO TT TV TW TZ UG US UY UZ VC " +
  "VE VG VN VU WF WS YE YT ZA ZM ZW"
).split(" ");

// Customers pay in the currency of the page: PLN on the Polish page, EUR on the English one.
// Amounts per zone are given in both. (PLACEHOLDER: the EUR rates for Poland/Europe and the PLN rate for
// "Outside Europe" are my conversions; please confirm or change them.)
export const CURRENCIES = ["PLN", "EUR"];
export const currencyForLang = (lang) => (lang === "pl" ? "PLN" : "EUR");

export const ZONES = [
  { id: "PL", countries: ["PL"], amount: { PLN: 1500, EUR: 400 }, days: [2, 3], name: { en: "Poland", pl: "Polska" } },
  {
    id: "EUROPE",
    countries: [...EU.filter((c) => c !== "PL"), ...EUROPE_OTHER],
    amount: { PLN: 6000, EUR: 1400 },
    days: [4, 10],
    name: { en: "Europe", pl: "Europa" },
  },
  { id: "WORLD", countries: WORLD, amount: { PLN: 10500, EUR: 2500 }, days: [8, 21], name: { en: "Outside Europe", pl: "Poza Europą" } },
];

// Optional: free shipping when the goods cost at least this much (minor units, 0 = never).
export const FREE_SHIPPING_FROM = { PLN: 0, EUR: 0 };

export const COUNTRIES = ZONES.flatMap((z) => z.countries);

export function zoneFor(country) {
  return ZONES.find((z) => z.countries.includes(country)) ?? null;
}

/** → { zone, currency, amount, days } or null when we don't ship there. goodsTotal is in `currency`. */
export function quoteShipping(country, goodsTotal = 0, currency = "PLN") {
  const zone = zoneFor(country);
  if (!zone || !CURRENCIES.includes(currency)) return null;
  const free = FREE_SHIPPING_FROM[currency] > 0 && goodsTotal >= FREE_SHIPPING_FROM[currency];
  return { zone: zone.id, name: zone.name, currency, amount: free ? 0 : zone.amount[currency], days: zone.days };
}
