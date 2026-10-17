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
- **Quarantine, never silent deletion:** anything detected is moved to a
  quarantine folder. **Restore** puts it back, and **Always allow** stops it
  being flagged again.
- **Plain English:** a finding says what the file is ("a Windows program that
  steals passwords"), where it was and what to do next. The technical name is
  under Details.
- **Honest status:** the dashboard says plainly when definitions are old or a
  part has stopped, and never shows a green tick for something that failed.
- **Light:** the scanner runs only while scanning, then exits. Every scan runs
  at the lowest CPU and disk priority.

Virus definitions come from ClamAV (Cisco Talos) and update every hour through
ClamAV's own `freshclam` service.

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
sudo systemctl enable --now clamav-freshclam.service
```

Log out and back in. Open **Steel Shield** from the application menu.

On Fedora: `sudo dnf install clamav clamav-freshclam inotify-tools libnotify kdialog`.
On Debian and Ubuntu: `sudo apt install clamav clamav-freshclam inotify-tools libnotify-bin kdialog`.

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
