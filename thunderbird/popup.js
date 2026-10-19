// "Is this a scam?": take the email Thunderbird is showing, run the rules in
// scamcheck.js, show the verdict. Only the links' domain names ever leave
// the computer (Quad9 look-up), never the email.
//
// "Report this scam" feeds the community lists that already protect every
// browser and mail provider (no list of our own): a forward of the email,
// attached, to APWG and Netcraft, which the user sends; and Google's report
// form opened in the browser for the scam link.

"use strict";

const REPORT_TO = ["reportphishing@apwg.org", "scam@netcraft.com"];
const GOOGLE_REPORT = "https://safebrowsing.google.com/safebrowsing/report_phish/?url=";

async function openInBrowser(url) {
  try { await browser.windows.openDefaultBrowser(url); }
  catch (e) { await browser.tabs.create({ url }); }
}

async function report(header, result) {
  const btn = document.getElementById("reportbtn"), note = document.getElementById("reportnote");
  btn.disabled = true;
  const done = [];
  try {
    await browser.compose.beginForward(header.id, "forwardAsAttachment",
      { to: REPORT_TO, subject: "Phishing report: " + (header.subject || "(no subject)") });
    done.push("A message to the anti-phishing groups is open with the email attached: press Send.");
  } catch (e) {
    done.push("The forward couldn't be opened: " + e);
  }
  if (result.report_url) {
    try { await openInBrowser(GOOGLE_REPORT + encodeURIComponent(result.report_url)); done.push("Google's report page is open in your browser: press Submit Report."); }
    catch (e) { done.push("Google's report page couldn't be opened: " + e); }
  }
  note.textContent = done.join(" ");
  // Count-only ping for the "scams reported" number on steel-os.org: one
  // request for a tiny file, nothing about the email or the user.
  fetch("https://downloads.steel-os.org/ping/scam-reported?t=" + Date.now(), { cache: "no-store" }).catch(() => {});
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
