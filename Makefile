# Part of rotcelloc - the hacker's movie, tv-series and game collection
# manager
#
# Copyright (C) Eskild Hustvedt 2015
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

ifndef prefix
# This little trick ensures that make install will succeed both for a local
# user and for root. It will also succeed for distro installs as long as
# prefix is set by the builder.
prefix=$(shell perl -e 'if($$< == 0 or $$> == 0) { print "/usr" } else { print "$$ENV{HOME}/.local"}')

# Some additional magic here, what it does is set BINDIR to ~/bin IF we're not
# root AND ~/bin exists, if either of these checks fail, then it falls back to
# the standard $(prefix)/bin. This is also inside ifndef prefix, so if a
# prefix is supplied (for instance meaning this is a packaging), we won't run
# this at all
BINDIR ?= $(shell perl -e 'if(($$< > 0 && $$> > 0) and -e "$$ENV{HOME}/bin") { print "$$ENV{HOME}/bin";exit; } else { print "$(prefix)/bin"}')
endif
VERSION=$(shell grep version package.json|perl -p -e 's/[^\d\.]+//g')
BINDIR ?= $(prefix)/bin

default: deps localinstall

# Install deps
deps:
	if which yarn &>/dev/null; then yarn install;else npm install;fi

# Install symlinks
localinstall:
	mkdir -p "$(BINDIR)"
	ln -sf $(shell pwd)/rotcelloc $(BINDIR)/
# Update PO(T)-files
translations:
	xgettext --copyright-holder 'Eskild Hustvedt' --package-name Rotcelloc --keyword=translate --from-code utf-8 --language JavaScript --add-comments=Translators: src/rotcelloc.js ./rotcelloc -o i18n/translate.pot
	perl -pi -e 's/^# SOME DESCRIPTIVE TITLE./# Rotcelloc/g' i18n/translate.pot
	for f in i18n/*po; do msgmerge -U $$f i18n/translate.pot;done
clean:
	rm -rf rotcelloc-$(VERSION)
	rm -f rotcelloc-$(VERSION).tar.bz2
distclean: clean
	rm -f src/deps/*
	rm -f */*~
distrib: distclean
	mkdir -p rotcelloc-$(VERSION)/examples
	cp -r Makefile rotcelloc src *.md *.json *.tpl TODO tools i18n rotcelloc-$(VERSION)/
	cp examples/*csv examples/*cson rotcelloc-$(VERSION)/examples
	tar -jcf ./rotcelloc-$(VERSION).tar.bz2 ./rotcelloc-$(VERSION)
	rm -rf rotcelloc-$(VERSION)
