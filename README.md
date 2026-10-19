# Steel Shield

Open-source virus protection for Linux, powered by ClamAV. Free, no account,
no ads, nothing sent anywhere.

Steel Shield is the virus protection built into [Steel OS](https://steel-os.org).
This repository is its standalone home, so it can also be used on other Linux
systems.

## What it does

- **Downloads:** every new file in your Downloads folder is scanned within
  seconds.
- **USB drives:** when one is plugged in, it asks "Scan this drive?" and scans
  programs, installers and Office files with macros first.
- **Weekly:** the home folder is scanned on Tuesday afternoon at the lowest
  priority, and waits while a game is running.
- **Quick scan and Full scan:** Quick scan checks your own files. Full scan
  checks the whole computer (every user's files, /etc, /var, /opt, /srv,
  /usr/local, /tmp and plugged-in drives) in the background, after asking for
  the password. /usr and signed app images are left out: on image-based
  systems they are read-only and verified, and leaving them out keeps a full
  scan to minutes instead of hours.
- **Quarantine, never silent deletion:** anything detected is moved to a
  quarantine folder. **Restore** puts it back, and **Always allow** stops it
  being flagged again.
- **Plain English:** a finding says what the file is ("a Windows program that
  steals passwords"), where it was and what to do next. The technical name is
  under Details.
- **Honest status:** the dashboard says plainly when definitions are old or a
  part has stopped, and never shows a green tick for something that failed.
  A scan that couldn't load definitions says so instead of "no threats found".
  **Fix now** downloads the newest definitions at once and shows the result,
  or the updater's own error.
- **Light:** the scanner runs only while scanning, then exits. Every scan runs
  at the lowest CPU and disk priority.

- **An app window**, like Norton or McAfee: Status (a shield that is blue when
  you're protected and orange when something needs attention, and one card per
  protection with its own switch), Scan (with a progress bar), Quarantine and
  History. It needs Qt for Python (`python3-pyside6`); without it,
  `steel-shield` shows simple kdialog menus instead.
- **No password for everyday jobs:** Fix now (updating definitions) and Full
  scan run without one. Restoring or deleting a file the full scan found
  outside a home folder asks for it.

Virus definitions come from ClamAV (Cisco Talos) and update every hour through
ClamAV's own `freshclam` service, which Steel Shield restarts every 10 minutes
if it stops. A distribution can ship definitions with the system in
`/usr/share/steel-shield/definitions` (Steel OS does): the
`steel-shield-definitions` service puts them in place at boot when nothing
newer has downloaded, so a new install is protected before it is ever online.

## Scam checker (opt-in)

`steel-shield-scamcheck message.eml` (or pasted text on stdin) answers
*Looks like a scam*, *Be careful* or *Looks safe* with the reasons: a sender
name that doesn't match its address, links to look-alike domains or to a
different site than they say, programs as attachments, pressure wording and
requests for gift cards, codes or passwords. Fixed rules, no AI, offline;
when online each link's domain is looked up on Quad9. In the app: **Add it**
on the Scam checker card, then **Check a message**. Tests: `tests/scamcheck/`.

## Versions and releases

Every change merged to `main` is a numbered release, like Steel OS: 0.1.0,
0.1.1 … 0.1.9, 0.2.0. `VERSION` holds the starting point (major.minor, or
major.minor.start to begin at a given number); 1.0 is a decision, made by
changing it. Each release is on GitHub with a source
archive; steel-os.org/steel-shield shows the newest.

## Behaviour watching

Definitions only know threats that have been seen before, so Steel Shield also
watches what programs do. A program counts as **untrusted** when it runs from
Downloads, a temporary folder or elsewhere in the home folder (game libraries
excluded), or is a script or Windows program there. System programs and
Flatpak apps are never paused.

- **Startup watch:** something new set to start at login (autostart entry,
  user service, login script). App Store and system programs get a quiet
  note; anything else asks **Remove** or **Keep** (removal is recoverable).
- **File guard:** an untrusted program changing or renaming 40+ files in
  Documents, Desktop, Pictures, Music or Videos within 20 seconds is paused:
  **Stop it** (it goes to quarantine) or **Allow it**.
- **Miner watch:** an untrusted program, or a known miner, using 70%+ of a
  core for 6 minutes is paused with the same choice.
- **Run check:** a download made runnable is scanned at once.
- **Extra threat list:** a daily list of new malware fingerprints from abuse.ch
  MalwareBazaar, fetched by `steel-shield-extra.timer`.
- **Block dangerous websites (optional):** a dashboard switch that uses
  Quad9's malware-blocking DNS for every app, through NetworkManager.

Enable with `systemctl --global enable steel-shield-guard.service` and
`sudo systemctl enable --now steel-shield-extra.timer`.

## Requirements

- systemd (user services)
- ClamAV: `clamscan` and the `freshclam` service
- `inotify-tools`, `notify-send` (libnotify)
- KDE Plasma for the dashboard and file-manager menu (`kdialog`, Dolphin).
  GNOME support is planned.

## Install from source

```
sudo make install
systemctl --global enable steel-shield-downloads.service steel-shield-usb.path steel-shield-weekly.timer
sudo systemctl enable --now steel-shield-definitions.service clamav-freshclam.service
```

Log out and back in. Open **Steel Shield** from the application menu.

On Fedora: `sudo dnf install clamav clamav-freshclam inotify-tools libnotify kdialog python3-pyside6`.
On Debian and Ubuntu: `sudo apt install clamav clamav-freshclam inotify-tools libnotify-bin kdialog python3-pyside6.qtwidgets python3-pyside6.qtsvgwidgets`.

## Use

```
steel-shield                 the dashboard
steel-shield scan PATH...    scan files or folders now
steel-shield status          one line per check
steel-shield restore ID      put a quarantined file back
steel-shield allow ID        restore and never flag this file again
steel-shield delete ID       delete a quarantined file for good
```

In Dolphin, right-click any file or folder and choose **Scan with Steel Shield**.

## Check that it works

Download the harmless EICAR test file from
[eicar.org](https://www.eicar.org/download-anti-malware-testfile/). Within
seconds Steel Shield moves it to quarantine and tells you.

`make test` runs the same check without a desktop or real definitions: it
scans the EICAR test file with a one-line test definition and checks that it
was quarantined.

## Layout

| Path | What |
|---|---|
| `bin/steel-shield` | the program |
| `systemd/user/` | download watcher, USB check and weekly scan |
| `share/applications/` | menu entry |
| `share/kio/servicemenus/` | Dolphin "Scan with Steel Shield" |
| `share/icons/` | the Steel Shield icon |
| `tests/selftest.sh` | detection and quarantine test |

## Who maintains it

Steel Shield belongs to the steel-and-code organization and is maintained
jointly by Steel & Code and Blackbox Entertainment, with tests that run every
week even when nothing changes. See [MAINTAINERS.md](MAINTAINERS.md) for the
rules that keep it from going unmaintained, and
[CONTRIBUTING.md](CONTRIBUTING.md) to help.

## Licence

Apache License 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
