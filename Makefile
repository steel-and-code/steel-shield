PREFIX ?= /usr
DESTDIR ?=

.PHONY: install uninstall test

install:
	install -D -m 0755 bin/steel-shield $(DESTDIR)$(PREFIX)/bin/steel-shield
	install -D -m 0755 bin/steel-shield-guard $(DESTDIR)$(PREFIX)/libexec/steel-shield-guard
	install -D -m 0755 bin/steel-shield-dns $(DESTDIR)$(PREFIX)/libexec/steel-shield-dns
	install -D -m 0755 bin/steel-shield-extra $(DESTDIR)$(PREFIX)/libexec/steel-shield-extra
	install -D -m 0755 bin/steel-shield-system $(DESTDIR)$(PREFIX)/libexec/steel-shield-system
	install -D -m 0755 bin/steel-shield-quarantine $(DESTDIR)$(PREFIX)/libexec/steel-shield-quarantine
	install -D -m 0755 bin/steel-shield-app $(DESTDIR)$(PREFIX)/libexec/steel-shield-app
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
	rm -f $(DESTDIR)$(PREFIX)/libexec/steel-shield-guard $(DESTDIR)$(PREFIX)/libexec/steel-shield-dns $(DESTDIR)$(PREFIX)/libexec/steel-shield-extra $(DESTDIR)$(PREFIX)/libexec/steel-shield-system $(DESTDIR)$(PREFIX)/libexec/steel-shield-quarantine $(DESTDIR)$(PREFIX)/libexec/steel-shield-app
	rm -f $(DESTDIR)$(PREFIX)/lib/systemd/system/steel-shield-definitions.service $(DESTDIR)$(PREFIX)/lib/systemd/system/clamav-freshclam.service.d/steel-shield.conf
	rm -f $(DESTDIR)$(PREFIX)/share/polkit-1/actions/org.steel-os.shield.policy
	rm -f $(DESTDIR)$(PREFIX)/lib/systemd/system/steel-shield-extra.*
	rm -f $(DESTDIR)$(PREFIX)/lib/systemd/user/steel-shield-*
	rm -f $(DESTDIR)$(PREFIX)/share/applications/steel-shield.desktop
	rm -f $(DESTDIR)$(PREFIX)/share/kio/servicemenus/steel-shield.desktop
	rm -f $(DESTDIR)$(PREFIX)/share/icons/hicolor/scalable/apps/steel-shield.svg

test:
	bash tests/selftest.sh bin/steel-shield
	bash bin/steel-shield-guard selftest
	bash -n bin/steel-shield-dns && bash -n bin/steel-shield-extra && bash -n bin/steel-shield-system && bash -n bin/steel-shield-quarantine
	python3 -c "import ast,sys; ast.parse(open(sys.argv[1]).read())" bin/steel-shield-app
