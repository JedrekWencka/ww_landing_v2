#!/usr/bin/env python3
"""Builds the privacy policy pages (PL + EN) from src/privacy.json.

Same file in impala-site and ww_landing_v2. Run after the main build (site.sh does it):
the pages reuse the site's own stylesheet(s) and icons, taken from $OUT_DIR/index.html.
The policy page can also change the cookie choice (buttons at the end of the analytics section).
"""
import html, json, os, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(os.environ.get("OUT_DIR") or ROOT / "dist")
PREVIEW = os.environ.get("SITE_ENV") == "preview"
data = json.loads((ROOT / "src/privacy.json").read_text(encoding="utf-8"))
SITE = data["site"]

index = (OUT / "index.html").read_text(encoding="utf-8")
head_links = "\n  ".join(m.group(0) for m in re.finditer(r'<link\b[^>]*rel="(?:stylesheet|icon|apple-touch-icon)"[^>]*>', index))

CSS = """
.legal{max-width:760px;margin:0 auto;padding:clamp(28px,5vw,64px) 24px 80px;line-height:1.6;font-size:17px}
.legal__top{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:clamp(28px,5vw,56px);font-size:14px;letter-spacing:.06em;text-transform:uppercase}
.legal__top a{color:inherit;text-underline-offset:4px}
.legal__lang a{opacity:.55;text-decoration:none;margin-left:10px}.legal__lang a[aria-current]{opacity:1;text-decoration:underline}
.legal h1{font-size:clamp(34px,5vw,56px);line-height:1.05;margin:0 0 10px}
.legal__updated{opacity:.65;font-size:14px;margin:0 0 28px}
.legal__intro{font-size:19px;margin:0 0 36px}
.legal h2{font-size:21px;line-height:1.25;margin:40px 0 10px}
.legal p,.legal ul{margin:0 0 14px}.legal ul{padding-left:1.2em}.legal li{margin:4px 0}
.legal a{color:inherit;text-underline-offset:3px}
.legal code{font-size:.9em;padding:1px 5px;border-radius:4px;background:rgba(127,127,127,.15)}
.legal__consent{margin:18px 0 6px;padding:16px 18px;border:1px solid currentColor;border-radius:10px}
.legal__consent p{margin:0 0 12px}
.legal__consent button{font:inherit;font-size:15px;font-weight:600;padding:8px 20px;margin:0 8px 0 0;border-radius:999px;border:1.5px solid currentColor;background:none;color:inherit;cursor:pointer}
.legal__consent button[data-legal-consent=granted]{background:currentColor}
.legal__consent button[data-legal-consent=granted] span{filter:invert(1)}
"""

SCRIPT = """(function(){var K=%s,ID=%s,T=%s,st=document.getElementById("legal-consent-status");
function get(){try{return localStorage.getItem(K)}catch(e){return null}}
function show(){var v=get();st.textContent=T[v==="granted"?"granted":v==="denied"?"denied":"none"]}
function drop(){var h=location.hostname.replace(/^www\\./,"");document.cookie.split(";").forEach(function(c){var n=c.split("=")[0].trim();if(!/^_ga/.test(n))return;["","; domain="+h,"; domain=."+h].forEach(function(d){document.cookie=n+"=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"+d})})}
document.querySelectorAll("[data-legal-consent]").forEach(function(b){b.addEventListener("click",function(){var v=b.getAttribute("data-legal-consent");try{localStorage.setItem(K,v)}catch(e){}if(v==="denied"){drop();window["ga-disable-"+ID]=true}show()})});show()})();"""

langs = [k for k in ("pl", "en") if k in data]
for lang in langs:
    d = data[lang]
    other = [l for l in langs if l != lang]
    sw = "".join(f'<a href="{data[l]["path"]}" hreflang="{l}" lang="{l}"' + (' aria-current="page"' if l == lang else "") + f'>{l.upper()}</a>' for l in langs)
    alts = "\n  ".join(f'<link rel="alternate" hreflang="{l}" href="{SITE}{data[l]["path"]}">' for l in langs)
    sections = []
    for i, s in enumerate(d["sections"]):
        block = f'<h2>{html.escape(s["h"])}</h2>\n{s["html"]}'
        if "Google Analytics" in s["h"]:
            block += (f'\n<div class="legal__consent"><p id="legal-consent-status"></p>'
                      f'<button type="button" data-legal-consent="granted"><span>{html.escape(d["accept"])}</span></button>'
                      f'<button type="button" data-legal-consent="denied">{html.escape(d["decline"])}</button></div>')
        sections.append(block)
    robots = '<meta name="robots" content="noindex, nofollow">' if PREVIEW else ""
    page = f"""<!doctype html>
<html lang="{lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(d["title"])}</title>
  <meta name="description" content="{html.escape(d["description"])}">
  {robots}
  <link rel="canonical" href="{SITE}{d["path"]}">
  {alts}
  {head_links}
  <style>{CSS}</style>
</head>
<body>
<main class="legal">
  <div class="legal__top"><a href="{d["home"]}">{html.escape(d["back"])}</a><span class="legal__lang">{sw}</span></div>
  <h1>{html.escape(d["heading"])}</h1>
  <p class="legal__updated">{html.escape(d["updated_label"])}: {data["updated"]}</p>
  <p class="legal__intro">{d["intro"]}</p>
  {chr(10).join(sections)}
</main>
<script>{SCRIPT % (json.dumps(data["consent_key"]), json.dumps(data["ga_id"]), json.dumps(d["consent_status"], ensure_ascii=False))}</script>
</body>
</html>
"""
    dest = OUT / d["path"].strip("/") / "index.html"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(page, encoding="utf-8")
    print(f"built {dest.relative_to(OUT.parent)}  ({SITE}{d['path']})")
