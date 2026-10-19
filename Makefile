PREFIX ?= /usr
DESTDIR ?=

.PHONY: install uninstall test xpi

# The "Is this a scam?" button for Thunderbird: the thunderbird/ folder zipped
# (without the test runner). Installed with Steel Shield; the app copies it
# into Thunderbird's profile with one click.
xpi: steel-shield-scamcheck.xpi
steel-shield-scamcheck.xpi: thunderbird/manifest.json thunderbird/scamcheck.js thunderbird/popup.html thunderbird/popup.js thunderbird/icon.svg
	@if command -v python3 >/dev/null 2>&1; then 		cd thunderbird && python3 -c "import zipfile; z=zipfile.ZipFile('../$@','w',zipfile.ZIP_DEFLATED); [z.write(f) for f in ['manifest.json','scamcheck.js','popup.html','popup.js','icon.svg']]; z.close()"; 	elif command -v zip >/dev/null 2>&1; then 		cd thunderbird && zip -q "../$@" manifest.json scamcheck.js popup.html popup.js icon.svg; 	else echo "note: python3 or zip is needed to build the Thunderbird add-on; skipped"; fi

install:
	install -D -m 0755 bin/steel-shield $(DESTDIR)$(PREFIX)/bin/steel-shield
	install -D -m 0755 bin/steel-shield-guard $(DESTDIR)$(PREFIX)/libexec/steel-shield-guard
	install -D -m 0755 bin/steel-shield-dns $(DESTDIR)$(PREFIX)/libexec/steel-shield-dns
	install -D -m 0755 bin/steel-shield-extra $(DESTDIR)$(PREFIX)/libexec/steel-shield-extra
	install -D -m 0755 bin/steel-shield-system $(DESTDIR)$(PREFIX)/libexec/steel-shield-system
	install -D -m 0755 bin/steel-shield-quarantine $(DESTDIR)$(PREFIX)/libexec/steel-shield-quarantine
	install -D -m 0755 bin/steel-shield-app $(DESTDIR)$(PREFIX)/libexec/steel-shield-app
	install -D -m 0755 bin/steel-shield-scamcheck $(DESTDIR)$(PREFIX)/libexec/steel-shield-scamcheck
	$(MAKE) steel-shield-scamcheck.xpi
	@if [ -f steel-shield-scamcheck.xpi ]; then install -D -m 0644 steel-shield-scamcheck.xpi $(DESTDIR)$(PREFIX)/share/steel-shield/steel-shield-scamcheck.xpi; fi
	install -d $(DESTDIR)$(PREFIX)/lib/systemd/system
	install -m 0644 systemd/system/*.service systemd/system/*.timer $(DESTDIR)$(PREFIX)/lib/systemd/system/
	install -D -m 0644 systemd/system/clamav-freshclam.service.d/steel-shield.conf $(DESTDIR)$(PREFIX)/lib/systemd/system/clamav-freshclam.service.d/steel-shield.conf
	install -D -m 0644 share/polkit-1/actions/org.steel-os.shield.policy $(DESTDIR)$(PREFIX)/share/polkit-1/actions/org.steel-os.shield.policy
	install -d $(DESTDIR)$(PREFIX)/lib/systemd/user
	install -m 0644 systemd/user/* $(DESTDIR)$(PREFIX)/lib/systemd/user/
	install -D -m 0644 share/applications/steel-shield.desktop $(DESTDIR)$(PREFIX)/share/applications/steel-shield.desktop
	install -D -m 0644 share/kio/servicemenus/steel-shield.desktop $(DESTDIR)$(PREFIX)/share/kio/servicemenus/steel-shield.desktop
	install -D -m 0644 share/icons/hicolor/scalable/apps/steel-shield.svg $(DESTDIR)$(PREFIX)/share/icons/hicolor/scalable/apps/steel-shield.svg

uninstall:
	rm -f $(DESTDIR)$(PREFIX)/bin/steel-shield
	rm -f $(DESTDIR)$(PREFIX)/libexec/steel-shield-guard $(DESTDIR)$(PREFIX)/libexec/steel-shield-dns $(DESTDIR)$(PREFIX)/libexec/steel-shield-extra $(DESTDIR)$(PREFIX)/libexec/steel-shield-system $(DESTDIR)$(PREFIX)/libexec/steel-shield-quarantine $(DESTDIR)$(PREFIX)/libexec/steel-shield-app $(DESTDIR)$(PREFIX)/libexec/steel-shield-scamcheck
	rm -f $(DESTDIR)$(PREFIX)/lib/systemd/system/steel-shield-definitions.service $(DESTDIR)$(PREFIX)/lib/systemd/system/clamav-freshclam.service.d/steel-shield.conf
	rm -f $(DESTDIR)$(PREFIX)/share/polkit-1/actions/org.steel-os.shield.policy
	rm -f $(DESTDIR)$(PREFIX)/share/steel-shield/steel-shield-scamcheck.xpi
	rm -f $(DESTDIR)$(PREFIX)/lib/systemd/system/steel-shield-extra.*
	rm -f $(DESTDIR)$(PREFIX)/lib/systemd/user/steel-shield-*
	rm -f $(DESTDIR)$(PREFIX)/share/applications/steel-shield.desktop
	rm -f $(DESTDIR)$(PREFIX)/share/kio/servicemenus/steel-shield.desktop
	rm -f $(DESTDIR)$(PREFIX)/share/icons/hicolor/scalable/apps/steel-shield.svg

test:
	bash tests/selftest.sh bin/steel-shield
	bash bin/steel-shield-guard selftest
	bash -n bin/steel-shield-dns && bash -n bin/steel-shield-extra && bash -n bin/steel-shield-system && bash -n bin/steel-shield-quarantine
	if command -v python3 >/dev/null; then python3 -c "import ast,sys; ast.parse(open(sys.argv[1]).read())" bin/steel-shield-app; bash tests/scamcheck/run.sh bin/steel-shield-scamcheck; fi
