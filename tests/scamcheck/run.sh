#!/usr/bin/bash
# Steel Shield scam checker: every sample in scam/ must come out "scam" or
# "careful", every sample in safe/ must come out "safe". Offline (no Quad9).
# Run by the image build and by `make test` in steel-shield.
#
#   run.sh [CHECKER] [THUNDERBIRD_DIR]
#
# When node is installed and the Thunderbird add-on's folder is found, the
# add-on's rules (scamcheck.js) are run on the same samples too, so the
# button in Thunderbird and the Python checker always agree.
set -uo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
checker="${1:-/usr/libexec/steel-shield-scamcheck}"
PY="${PYTHON:-python3}"
jsdir="${2:-}"
if [[ -z "$jsdir" ]]; then
    for d in "$here/../../thunderbird" "$here/../../system_files/usr/share/steel-shield/thunderbird" /usr/share/steel-shield/thunderbird; do
        [[ -f "$d/test-run.js" ]] && { jsdir="$d"; break; }
    done
fi
fail=0
verdict_py() { "$PY" -I "$checker" --offline "$1" >/dev/null 2>&1; echo $?; }
verdict_js() { "$PY" -I "$checker" --parse-json "$1" | node "$jsdir/test-run.js" >/dev/null 2>&1; echo $?; }

for f in "$here"/scam/*; do
    rc="$(verdict_py "$f")"
    if (( rc == 0 )); then echo "MISSED  $(basename "$f") (came out safe)"; fail=1; else echo "caught  $(basename "$f") (rc $rc)"; fi
done
for f in "$here"/safe/*; do
    rc="$(verdict_py "$f")"
    if (( rc != 0 )); then echo "FALSE ALARM  $(basename "$f") (rc $rc):"; "$PY" -I "$checker" --offline "$f" | sed 's/^/    /'; fail=1; else echo "safe    $(basename "$f")"; fi
done

if [[ -n "$jsdir" ]] && command -v node >/dev/null 2>&1; then
    echo "-- the Thunderbird add-on's rules ($jsdir)"
    for f in "$here"/scam/*; do
        rc="$(verdict_js "$f")"
        if (( rc == 0 )); then echo "MISSED  $(basename "$f") (add-on: safe)"; fail=1; else echo "caught  $(basename "$f") (add-on rc $rc)"; fi
    done
    for f in "$here"/safe/*; do
        rc="$(verdict_js "$f")"
        if (( rc != 0 )); then echo "FALSE ALARM  $(basename "$f") (add-on rc $rc):"; "$PY" -I "$checker" --parse-json "$f" | node "$jsdir/test-run.js" | sed 's/^/    /'; fail=1; else echo "safe    $(basename "$f") (add-on)"; fi
    done
else
    echo "-- node not installed or add-on folder not found: the add-on's rules were not run here"
fi
exit $fail
