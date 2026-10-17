PREFIX ?= /usr
DESTDIR ?=

.PHONY: install uninstall test

install:
	install -D -m 0755 bin/steel-shield $(DESTDIR)$(PREFIX)/bin/steel-shield
	install -d $(DESTDIR)$(PREFIX)/lib/systemd/user
	install -m 0644 systemd/user/* $(DESTDIR)$(PREFIX)/lib/systemd/user/
	install -D -m 0644 share/applications/steel-shield.desktop $(DESTDIR)$(PREFIX)/share/applications/steel-shield.desktop
	install -D -m 0644 share/kio/servicemenus/steel-shield.desktop $(DESTDIR)$(PREFIX)/share/kio/servicemenus/steel-shield.desktop
	install -D -m 0644 share/icons/hicolor/scalable/apps/steel-shield.svg $(DESTDIR)$(PREFIX)/share/icons/hicolor/scalable/apps/steel-shield.svg

uninstall:
	rm -f $(DESTDIR)$(PREFIX)/bin/steel-shield
	rm -f $(DESTDIR)$(PREFIX)/lib/systemd/user/steel-shield-*
	rm -f $(DESTDIR)$(PREFIX)/share/applications/steel-shield.desktop
	rm -f $(DESTDIR)$(PREFIX)/share/kio/servicemenus/steel-shield.desktop
	rm -f $(DESTDIR)$(PREFIX)/share/icons/hicolor/scalable/apps/steel-shield.svg

test:
	bash tests/selftest.sh bin/steel-shield
