// Steel Shield scam checker: the rules, for the Thunderbird add-on.
// The same rules as steel-shield-scamcheck (Python), kept in step by the
// shared test messages in tests/scamcheck/. Fixed rules, no AI: a scam
// can't talk its way past them. Nothing from the message leaves the PC,
// except (when online) each link's domain name, looked up on Quad9.
//
// check(msg) takes {from_name, from_addr, reply_to, subject, text, links:
// [[href, label], ...], attachments: [name, ...]} and returns
// {verdict: "scam"|"careful"|"safe", headline, reasons: [{level, text}]}.

"use strict";

const BRANDS = {
  paypal: ["paypal.com", "paypal.me"],
  microsoft: ["microsoft.com", "live.com", "outlook.com", "office.com", "hotmail.com", "microsoftonline.com", "msn.com", "xbox.com", "azure.com", "office365.com"],
  outlook: ["outlook.com", "live.com", "microsoft.com", "office.com"],
  apple: ["apple.com", "icloud.com", "me.com"],
  icloud: ["icloud.com", "apple.com"],
  amazon: ["amazon.com", "amazon.co.uk", "amazon.ca", "amazon.de", "amazon.fr", "amazon.es", "amazon.it", "amazon.com.au", "amazon.in", "amazon.co.jp", "amazon.com.mx", "amazonaws.com", "primevideo.com"],
  google: ["google.com", "gmail.com", "youtube.com", "googlemail.com", "goo.gl", "withgoogle.com", "google.co.uk"],
  gmail: ["gmail.com", "google.com", "googlemail.com"],
  netflix: ["netflix.com"],
  facebook: ["facebook.com", "fb.com", "facebookmail.com", "meta.com", "messenger.com"],
  instagram: ["instagram.com", "facebook.com", "meta.com"],
  whatsapp: ["whatsapp.com", "whatsapp.net", "meta.com"],
  chase: ["chase.com", "jpmorganchase.com", "jpmorgan.com"],
  bankofamerica: ["bankofamerica.com", "bofa.com"],
  wellsfargo: ["wellsfargo.com"],
  citibank: ["citi.com", "citibank.com", "citigroup.com"],
  capitalone: ["capitalone.com"],
  usps: ["usps.com", "usps.gov"],
  ups: ["ups.com"],
  fedex: ["fedex.com"],
  dhl: ["dhl.com", "dhl.de", "dhl.co.uk"],
  irs: ["irs.gov"],
  socialsecurity: ["ssa.gov"],
  medicare: ["medicare.gov", "cms.gov"],
  steam: ["steampowered.com", "steamcommunity.com", "valvesoftware.com", "steamgames.com"],
  discord: ["discord.com", "discord.gg", "discordapp.com"],
  ebay: ["ebay.com", "ebay.co.uk", "ebay.de", "ebay.ca", "ebay.com.au"],
  dropbox: ["dropbox.com"],
  docusign: ["docusign.com", "docusign.net"],
  linkedin: ["linkedin.com"],
  walmart: ["walmart.com"],
  costco: ["costco.com", "costco.ca"],
  venmo: ["venmo.com"],
  zelle: ["zellepay.com", "zelle.com"],
  cashapp: ["cash.app", "squareup.com"],
  coinbase: ["coinbase.com"],
  binance: ["binance.com", "binance.us"],
  verizon: ["verizon.com", "verizonwireless.com", "vzw.com"],
  xfinity: ["xfinity.com", "comcast.com", "comcast.net"],
  comcast: ["comcast.com", "comcast.net", "xfinity.com"],
  spotify: ["spotify.com"],
  adobe: ["adobe.com"],
  zoom: ["zoom.us", "zoom.com"],
  roblox: ["roblox.com"],
  epicgames: ["epicgames.com", "unrealengine.com"],
  playstation: ["playstation.com", "sony.com", "sonyentertainmentnetwork.com"],
  nintendo: ["nintendo.com", "nintendo.net"],
  geeksquad: ["bestbuy.com", "geeksquad.com"],
  bestbuy: ["bestbuy.com"],
  norton: ["norton.com", "nortonlifelock.com", "gendigital.com"],
  mcafee: ["mcafee.com"],
  att: ["att.com", "att.net"],
  tmobile: ["t-mobile.com"],
  sparkasse: ["sparkasse.de"],
  steelos: ["steel-os.org", "steelandcode.com"],
};
const FREEMAIL = new Set(["gmail.com", "googlemail.com", "yahoo.com", "outlook.com", "hotmail.com", "live.com", "aol.com", "icloud.com", "proton.me", "protonmail.com", "mail.com", "gmx.com", "gmx.de", "yandex.com", "zoho.com"]);
const SHORTENERS = new Set(["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly", "cutt.ly", "rb.gy", "shorturl.at", "tiny.cc", "lnkd.in", "t.ly", "rebrand.ly"]);
const DANGEROUS_EXT = new Set([".exe", ".scr", ".bat", ".cmd", ".com", ".pif", ".msi", ".js", ".jse", ".vbs", ".vbe", ".wsf", ".ps1", ".hta", ".lnk", ".iso", ".img", ".jar", ".apk", ".dll", ".reg"]);
const RISKY_EXT = new Set([".zip", ".rar", ".7z", ".docm", ".xlsm", ".pptm", ".html", ".htm", ".svg", ".one"]);
const PRESSURE = [
  /\burgent(ly)?\b/, /\bimmediately\b/, /within (24|48) hours/, /\baccount (has been |will be |is )?(suspended|locked|limited|closed|disabled|compromised|on hold)/,
  /\bverify (your|the) (account|identity|information|payment)/, /\bconfirm your (account|identity|password|payment)/,
  /\bunusual (sign[- ]?in|activity|login)/, /\bsuspicious (activity|sign[- ]?in|login)/, /\bpassword (has )?expire/,
  /\bfinal (notice|warning|reminder)/, /\blast (chance|warning)/, /\baction required\b/, /\bfailed to deliver/,
  /\bdelivery (attempt|failed|could not)/, /\bredelivery\b/, /\bcustoms (fee|duty|charge)/, /\brefund\b/,
  /\bprize\b/, /\byou('ve| have) (been selected|won)/, /\blottery\b/, /\binheritance\b/, /\bbeneficiary\b/,
  /\bdo not (share|tell)/, /\bkeep this (confidential|secret)/,
];
const MONEY = [/\bgift ?cards?\b/, /\bitunes card/, /\bgoogle play card/, /\bbitcoin\b/, /\bcrypto(currency)?\b/,
  /\bwire transfer\b/, /\bwestern union\b/, /\bmoneygram\b/, /\bzelle\b/, /\bvenmo\b/, /\bcash ?app\b/,
  /\bpay(ment)? (now|today|immediately)/, /\bprocessing fee\b/, /\b(bank|card) details\b/,
  /\bsocial security number\b/, /\bssn\b/, /\bdate of birth\b/, /\bmother'?s maiden name\b/];
const CONFUSABLE = { "0": "o", "1": "l", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "9": "g", "$": "s", "@": "a", "|": "l", "!": "i" };
const DOMAIN_IN_TEXT = /\b([a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|co\.uk|gov|edu|io|me|app|us|ca|de|fr|es|it|au|nl))\b/i;
const TWO_LEVEL = new Set(["co.uk", "org.uk", "ac.uk", "gov.uk", "com.au", "net.au", "co.nz", "co.jp", "com.br", "com.mx", "co.in", "com.ar", "co.za", "com.sg", "com.hk", "com.tr"]);

function decodeIdna(host) {
  // Thunderbird and browsers give punycode hosts; show the look-alike letters where we can.
  try { return new URL("http://" + host).hostname === host && typeof host.normalize === "function" ? host : host; } catch (e) { return host; }
}

function registrable(host) {
  host = (host || "").toLowerCase().replace(/\.+$/, "");
  const parts = host.split(".");
  if (parts.length >= 3 && TWO_LEVEL.has(parts.slice(-2).join("."))) return parts.slice(-3).join(".");
  return parts.length >= 2 ? parts.slice(-2).join(".") : host;
}

function core(domain) {
  const d = registrable(domain);
  const name = d.includes(".") ? d.split(".")[0] : d;
  return name.replace(/[0134578 9$@|!]/g, c => CONFUSABLE[c] || c).replace(/[-_]/g, "");
}

function close(a, b) {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a.length === b.length) { let d = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++; return d === 1; }
  const [s, l] = a.length < b.length ? [a, b] : [b, a];
  let i = 0; while (i < s.length && s[i] === l[i]) i++;
  return s.slice(i) === l.slice(i + 1);
}

function imitatedBrand(domain) {
  const d = registrable(domain);
  if (!d || !d.includes(".")) return null;
  for (const legit of Object.values(BRANDS)) if (legit.includes(d) || legit.some(x => d.endsWith("." + x))) return null;
  const c = core(d);
  for (const brand of Object.keys(BRANDS)) {
    if (c.includes(brand) || close(c, brand) || c.replace(/rn/g, "m").includes(brand.replace(/rn/g, "m"))) return brand;
  }
  return null;
}

function hostOf(url) {
  const u = /^[a-z][a-z0-9+.-]*:\/\//i.test(url) ? url : "http://" + url;
  try { return new URL(u).hostname.toLowerCase(); } catch (e) { return ""; }
}

async function quad9Blocks(domain) {
  try {
    const r = await fetch("https://dns.quad9.net:5053/dns-query?name=" + encodeURIComponent(domain) + "&type=A",
      { headers: { accept: "application/dns-json" } });
    const data = await r.json();
    return data.Status === 3 && !(data.Authority && data.Authority.length);
  } catch (e) { return null; }
}

function firstMatch(patterns, text) {
  const found = new Set();
  for (const p of patterns) { const m = text.match(p); if (m) found.add(m[0]); }
  return [...found].sort().slice(0, 3);
}

async function check(m, online = true) {
  const reasons = [];
  const add = (level, text) => { if (!reasons.some(r => r.level === level && r.text === text)) reasons.push({ level, text }); };
  const textL = ((m.subject || "") + "\n" + (m.text || "")).toLowerCase();
  const fromAddr = (m.from_addr || "").toLowerCase();
  const fromDom = fromAddr.includes("@") ? registrable(fromAddr.split("@").pop()) : "";
  const fromName = m.from_name || "";

  if (fromName) {
    const nameCore = fromName.toLowerCase().replace(/[0134578 9$@|!]/g, c => CONFUSABLE[c] || c).replace(/[^a-z]/g, "");
    for (const [brand, legit] of Object.entries(BRANDS)) {
      if (nameCore.includes(brand) && fromDom && !legit.includes(fromDom) && !legit.some(x => fromDom.endsWith("." + x))) {
        const Brand = brand[0].toUpperCase() + brand.slice(1);
        if (FREEMAIL.has(fromDom)) add("scam", `Sent as "${fromName}" from a free ${fromDom} address. ${Brand} would write from its own domain.`);
        else add("scam", `Sent as "${fromName}" but from ${fromDom}, which is not ${Brand}'s own domain.`);
        break;
      }
    }
  }
  if (fromAddr) { const b = imitatedBrand(fromDom); if (b) add("scam", `The sender's domain ${fromDom} looks like ${b[0].toUpperCase() + b.slice(1)} but isn't.`); }
  const replyTo = (m.reply_to || "").toLowerCase();
  if (replyTo.includes("@") && fromDom) {
    const rt = registrable(replyTo.split("@").pop());
    if (rt !== fromDom) add("careful", `Replies would go to ${rt}, a different address from the sender (${fromDom}).`);
  }

  const seen = new Set();
  const lookups = [];
  for (const [href, label] of (m.links || [])) {
    if (!href || /^(mailto|tel):/i.test(href)) continue;
    const host = hostOf(href);
    if (!host) continue;
    const dom = registrable(host);
    const key = dom + "\u0001" + (label || "");
    if (seen.has(key)) continue;
    seen.add(key);
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) { add("scam", `A link goes to a bare numeric address (${host}) instead of a website name.`); continue; }
    if (host.startsWith("xn--") || host.includes(".xn--")) add("scam", `A link uses look-alike foreign characters in its address (${dom}).`);
    const b = imitatedBrand(dom);
    if (b) add("scam", `A link goes to ${dom}, which looks like ${b[0].toUpperCase() + b.slice(1)} but isn't.`);
    if (SHORTENERS.has(dom)) add("careful", `A link is shortened (${dom}), so you can't see where it really goes.`);
    const shown = (label || "").match(DOMAIN_IN_TEXT);
    if (shown && registrable(hostOf(shown[1])) !== dom) add("scam", `A link says "${shown[1]}" but really goes to ${dom}.`);
    if (/https?:\/\/[^/]*@/i.test(href)) add("scam", "A link hides its real destination behind an @ sign.");
    if (online) lookups.push(quad9Blocks(dom).then(blocked => { if (blocked) add("scam", `The site ${dom} is on Quad9's list of known malware and phishing sites.`); }));
  }
  await Promise.all(lookups);
  const linkCount = seen.size;

  for (const name of (m.attachments || [])) {
    const low = name.toLowerCase();
    const ext = low.includes(".") ? "." + low.split(".").pop() : "";
    if (DANGEROUS_EXT.has(ext)) add("scam", `The attachment "${name}" is a program, not a document. Don't open it.`);
    else if (RISKY_EXT.has(ext)) add("careful", `The attachment "${name}" can hide a program. Only open it if you were expecting it.`);
    if (/\.(pdf|doc|docx|xls|xlsx|jpg|png|txt)\.[a-z]{2,4}$/.test(low)) add("scam", `The attachment "${name}" pretends to be a document with a second, hidden file type.`);
  }

  const pressure = firstMatch(PRESSURE, textL);
  const money = firstMatch(MONEY, textL);
  if (pressure.length && (linkCount || (m.attachments || []).length)) add("careful", `It pushes you to act fast (${pressure.join(", ")}) and gives you something to click or open. Real companies don't rush you.`);
  else if (pressure.length) add("info", `It uses pressure words (${pressure.join(", ")}).`);
  if (money.length) add(pressure.length ? "scam" : "careful", `It asks for money or private details (${money.join(", ")}). No real company asks for gift cards, crypto or your password by message.`);
  if (/\b(password|passcode|pin|one[- ]time code|verification code|2fa code)\b/.test(textL) && /\b(enter|send|reply with|provide|confirm|type)\b/.test(textL))
    add("scam", "It asks you to send or enter a password or code. Nobody legitimate asks for those by message.");

  const levels = new Set(reasons.map(r => r.level));
  const verdict = levels.has("scam") ? "scam" : levels.has("careful") ? "careful" : "safe";
  if (verdict === "safe") reasons.push({ level: "info", text: (fromAddr || linkCount) ? "No scam signs found: the sender, links and wording look ordinary. Still, only click links you expected." : "No scam signs found in this text." });
  return { verdict, headline: { scam: "Looks like a scam", careful: "Be careful", safe: "Looks safe" }[verdict], reasons };
}

if (typeof module !== "undefined") module.exports = { check, registrable, imitatedBrand };
