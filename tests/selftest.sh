#!/usr/bin/bash
# Detection and quarantine test, without a desktop or the real definitions:
# scan the EICAR test file with a one-line test definition and check that it
# ends up in quarantine. Usage: tests/selftest.sh [path/to/steel-shield]
set -euo pipefail

bin="$(realpath "${1:-bin/steel-shield}")"
st="$(mktemp -d)"
trap 'rm -rf "$st"' EXIT
mkdir -p "$st/home/Downloads"
printf '%s' 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' > "$st/home/Downloads/eicar.com"
printf '%s:%s:Win.Test.EICAR_HDB-1\n' "$(md5sum "$st/home/Downloads/eicar.com" | cut -d' ' -f1)" \
    "$(stat -c %s "$st/home/Downloads/eicar.com")" > "$st/test.hdb"

HOME="$st/home" XDG_DATA_HOME="$st/home/.local/share" XDG_STATE_HOME="$st/home/.local/state" \
    XDG_CONFIG_HOME="$st/home/.config" STEEL_SHIELD_DB="$st/test.hdb" \
    "$bin" selftest-scan "$st/home/Downloads/eicar.com"

if [[ -e "$st/home/Downloads/eicar.com" ]] || ! ls "$st"/home/.local/share/steel-shield/quarantine/*/file >/dev/null 2>&1; then
    echo "Steel Shield self-test FAILED: the test file was not quarantined" >&2
    exit 1
fi
"$bin" explain Win.Test.EICAR_HDB-1
"$bin" explain Win.Trojan.Agent-12345
echo "Steel Shield self-test passed: test file detected and quarantined"
