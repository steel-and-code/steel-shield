# Maintaining Steel Shield

Short and boring on purpose. Most weeks there is nothing to do.

## What keeps itself up to date

- **Virus definitions:** ClamAV's `freshclam` service on each computer,
  hourly. No release needed.
- **The ClamAV engine:** the Linux distribution's own package updates.

Steel Shield itself is a small shell program around ClamAV, so it rarely
needs changing.

## Weekly check (automatic)

The **Test** workflow runs every Monday on Fedora and Ubuntu with the newest
packages, and once with the real ClamAV definitions. If it fails, it opens an
issue labelled `weekly-check-failed`. Whoever sees it first fixes it or
assigns it.

## Making a release

1. Make sure the Test workflow is green on `main`.
2. Update `VERSION` and add a line to `CHANGELOG.md`.
3. Tag it: `git tag v$(cat VERSION) && git push --tags`.
4. Create a GitHub release from the tag with the changelog line.

Steel OS picks up new releases in its next image build.

## When something breaks

| Symptom | Usual cause |
|---|---|
| Self-test fails on a new Fedora or Ubuntu | ClamAV changed an option or output format; adjust `run_clamscan` in `bin/steel-shield` |
| Downloads not scanned | `inotify-tools` missing or the user service disabled |
| Dashboard says definitions are old | `clamav-freshclam` service stopped or blocked by the network |
