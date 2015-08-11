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
translations:
	xgettext --copyright-holder 'Eskild Hustvedt' --package-name Rotcelloc --keyword=translate --from-code utf-8 --language JavaScript --add-comments=Translators: src/rotcelloc.js ./rotcelloc -o i18n/translate.pot
	perl -pi -e 's/^# SOME DESCRIPTIVE TITLE./# Rotcelloc/g' i18n/translate.pot
	for f in i18n/*po; do msgmerge -U $$f i18n/translate.pot;done
