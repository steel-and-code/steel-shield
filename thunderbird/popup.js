// "Is this a scam?": take the email Thunderbird is showing, run the rules in
// scamcheck.js, show the verdict. Only the links' domain names ever leave
// the computer (Quad9 look-up), never the email.
//
// "Report this scam" feeds the community lists that already protect every
// browser and mail provider (no list of our own): one click sends the email
// to steel-os.org, which passes it straight on to Netcraft's reporting API
// and to APWG by email, and keeps nothing. Nothing else to do.

"use strict";

const REPORT_API = "https://steel-os.org/api/scam-report";
// The Anti-Phishing Working Group takes reports by email only: after the
// automatic report, a forward to them opens with the email attached; the
// user presses Send for that second copy, or closes it.
const APWG_TO = ["reportphishing@apwg.org"];

async function openInBrowser(url) {
  try { await browser.windows.openDefaultBrowser(url); }
  catch (e) { await browser.tabs.create({ url }); }
}

async function report(header, result) {
  const btn = document.getElementById("reportbtn"), note = document.getElementById("reportnote");
  btn.disabled = true;
  note.textContent = "Sending the report…";
  let raw = "";
  try {
    raw = await browser.messages.getRaw(header.id);
    if (raw && typeof raw !== "string") raw = await new Response(raw).text();   // newer Thunderbirds hand back a File
  } catch (e) {
    raw = "";
  }
  const links = Array.from(new Set((raw.match(/https?:\/\/[^\s<>"')\]]+/g) || []))).slice(0, 50);
  if (result.report_url && !links.includes(result.report_url)) links.unshift(result.report_url);
  try {
    const r = await fetch(REPORT_API, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: raw.slice(0, 1000000), links, subject: header.subject || "", source: "thunderbird", website: "" }),
    });
    const d = await r.json();
    if (d.ok) {
      let text = d.text || "Reported.";
      if (!d.apwg) {
        try {
          await browser.compose.beginForward(header.id, "forwardAsAttachment",
            { to: APWG_TO, subject: "Phishing report: " + (header.subject || "(no subject)") });
          text += " A forward to the Anti-Phishing Working Group is open too: press Send for that second copy, or close it.";
        } catch (e) { /* no compose permission or window: the Netcraft report already went */ }
      }
      note.textContent = text;
      // Count-only ping for the "scams reported" number on steel-os.org: one
      // request for a tiny file, nothing about the email or the user.
      fetch("https://downloads.steel-os.org/ping/scam-reported?t=" + Date.now(), { cache: "no-store" }).catch(() => {});
      try { await browser.messages.update(header.id, { junk: true }); } catch (e) { /* older Thunderbird */ }
    } else {
      note.textContent = "The report couldn't be sent: " + (d.error || "no answer") + " Try again in a moment.";
      btn.disabled = false;
    }
  } catch (e) {
    note.textContent = "The report couldn't be sent (no connection?): " + e + " Try again in a moment.";
    btn.disabled = false;
  }
}

function parseAddress(s) {
  // "Name <user@host>" -> [name, address]
  const m = /^\s*(?:"?([^"<]*)"?\s*)?<([^>]+)>\s*$/.exec(s || "");
  if (m) return [(m[1] || "").trim(), m[2].trim()];
  return ["", (s || "").trim()];
}

function linksFromParts(parts, out, texts) {
  for (const p of parts || []) {
    const type = (p.contentType || "").toLowerCase();
    if (type.startsWith("text/html") && p.body) {
      const doc = new DOMParser().parseFromString(p.body, "text/html");
      for (const a of doc.querySelectorAll("a[href]")) out.push([a.getAttribute("href").trim(), (a.textContent || "").replace(/\s+/g, " ").trim()]);
      texts.push(doc.body ? doc.body.textContent : "");
    } else if (type.startsWith("text/plain") && p.body) {
      texts.push(p.body);
      for (const m of p.body.matchAll(/\b((?:https?:\/\/|www\.)[^\s<>"')\]]+)/gi)) out.push([m[1], ""]);
    }
    if (p.parts) linksFromParts(p.parts, out, texts);
  }
}

async function run() {
  const title = document.getElementById("title"), box = document.getElementById("box");
  const list = document.getElementById("reasons"), advice = document.getElementById("advice");
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    const header = await browser.messageDisplay.getDisplayedMessage(tab.id);
    if (!header) { title.textContent = "Open an email first"; return; }
    const full = await browser.messages.getFull(header.id);
    const [fromName, fromAddr] = parseAddress(header.author);
    const replyTo = parseAddress((full.headers && full.headers["reply-to"] || [""])[0])[1];
    const links = [], texts = [];
    linksFromParts(full.parts, links, texts);
    let attachments = [];
    try { attachments = (await browser.messages.listAttachments(header.id)).map(a => a.name); } catch (e) { /* older Thunderbird */ }
    const msg = { from_name: fromName, from_addr: fromAddr, reply_to: replyTo, subject: header.subject || "",
                  text: texts.join("\n"), links, attachments };
    const result = await check(msg, navigator.onLine);
    box.className = "box " + result.verdict;
    title.textContent = result.headline;
    list.textContent = "";
    for (const r of result.reasons) {
      const li = document.createElement("li");
      li.className = r.level;
      li.textContent = r.text;
      list.appendChild(li);
    }
    advice.textContent = { scam: "Don't click any link or open any attachment in it. Delete it, or mark it as junk.",
                           careful: "Don't click its links. If it claims to be a company you use, go to their website or app yourself and check there.",
                           safe: "" }[result.verdict];
    if (result.verdict !== "safe") {
      document.getElementById("report").hidden = false;
      document.getElementById("reportbtn").addEventListener("click", () => report(header, result));
    }
  } catch (e) {
    title.textContent = "The check couldn't run";
    advice.textContent = String(e);
  }
}

run();
