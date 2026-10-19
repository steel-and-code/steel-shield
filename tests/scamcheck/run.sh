#!/usr/bin/bash
# Steel Shield scam checker: every sample in scam/ must come out "scam" or
# "careful", every sample in safe/ must come out "safe". Offline (no Quad9).
# Run by the image build and by `make test` in steel-shield.
set -uo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
checker="${1:-/usr/libexec/steel-shield-scamcheck}"
fail=0
for f in "$here"/scam/*; do
    "${PYTHON:-python3}" -I "$checker" --offline "$f" >/dev/null 2>&1; rc=$?
    if (( rc == 0 )); then echo "MISSED  $(basename "$f") (came out safe)"; fail=1; else echo "caught  $(basename "$f") (rc $rc)"; fi
done
for f in "$here"/safe/*; do
    "${PYTHON:-python3}" -I "$checker" --offline "$f" >/dev/null 2>&1; rc=$?
    if (( rc != 0 )); then echo "FALSE ALARM  $(basename "$f") (rc $rc):"; "${PYTHON:-python3}" -I "$checker" --offline "$f" | sed 's/^/    /'; fail=1; else echo "safe    $(basename "$f")"; fi
done
exit $fail
