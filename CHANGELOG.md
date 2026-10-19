# Changelog

## Unreleased

- Scam checker (opt-in): `steel-shield-scamcheck` says whether an email or
  message is a scam, with the reasons, from fixed rules and offline; **Check a
  message** in the app, after **Add it** on the Scam checker card. The same
  rules as a Thunderbird add-on, **Is this a scam?**, built as an .xpi with
  every release and added to Thunderbird with one click from the app.
  **Report this scam** (app and add-on): one click forwards the message to
  APWG and Netcraft from the user's own mail app and opens Google's report
  form for the scam link; nothing goes until the user presses Send. No list of
  our own. A count-only ping (`steel-shield ping`) feeds the "scams reported"
  and "threats caught" numbers on steel-os.org; nothing else is sent.
- **Report a problem** at the bottom of the app's sidebar: screenshot, then
  Problem or Idea, a title, what happened, Send. Goes to the Steel OS team's
  report service (a Bug or a Story in their tracker, reference number back),
  no account needed. VERSION is installed so reports say which version.
- Every merge to main is a numbered release (like Steel OS: 0.1.0, 0.1.1 ... 0.1.9, 0.2.0),
  published on GitHub with a source archive. VERSION now holds the starting
  point (major.minor).
- Definitions age comes from their build date inside the file, not the file
  date (system images stamp files 1 January 1970).
- Fix now shows download progress (which list, MB of MB) in the app; only a
  closed password window is silent, any other failure shows the error.
- **App window** (`steel-shield-app`, Qt for Python): Status with the shield
  and one card per protection, Scan with real progress, Quarantine and
  History. `steel-shield` opens it when PySide6 is installed and falls back to
  the kdialog menus (`steel-shield menus`) otherwise.
- New subcommands for the app: `defs-dir`, `set downloads|guard|web on|off`,
  `log`, `record-scan`; `status` lines gain a third column, a key per check.
- Fix now and Full scan no longer ask for a password (polkit allows the
  person at the computer); restoring or deleting a system quarantine item
  moved to `steel-shield-quarantine`, which still asks.
- Built-in definitions: `steel-shield-definitions` puts definitions shipped in
  `/usr/share/steel-shield/definitions` in place at boot; the updater starts
  after it and retries every 10 minutes if it stops.
- **Fix now** updates the definitions straight away (through the new
  `steel-shield-system` helper and a clear password prompt) and shows whether
  it worked, with the updater's error if not.
- **Full scan (the whole computer)** next to **Quick scan (your files)**, with
  a system quarantine for files outside the user's home.
- A scan that couldn't load definitions now says so instead of reporting
  "no threats found".
- Behaviour watching: startup watch, file guard (ransomware-like changes),
  miner watch, run check; extra daily threat list from abuse.ch; optional
  "block dangerous websites" (Quad9).

## 0.1.0 (2026-10-17)

- First standalone release, imported from Steel OS where it ships today:
  download scanning, USB drive check, weekly scan, recoverable quarantine,
  plain-English findings and an honest status dashboard.
