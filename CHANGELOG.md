# Changelog

## Unreleased

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
