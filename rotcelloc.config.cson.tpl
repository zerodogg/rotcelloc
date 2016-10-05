# vim: set ft=coffee noexpandtab :
#
# Rotcelloc configuration file.
#
# The format of this file is «CSON», which is a slightly prettier version of
# JSON using the CoffeeScript syntax. See
# http://coffeescript.org/#objects_and_arrays for a quick reference
#
# See README.md for configuration instructions.

# The title of the collection, displayed in the menu
menuSiteTitle: "My Rotcelloc-collection"

# To not overload the browser, rotcelloc uses a form of infinite scrolling
# rendering only «maxMoviesPerRenderedPage» at any one time (rendering another
# «maxMoviesPerRenderedPage» number of entries once the user reaches the end).
maxMoviesPerRenderedPage: 100

# This is used instead of maxMoviesPerRenderedPage on mobile phones. They
# generally have slower connections and are somewhat slower than desktops. It
# is thus reasonable to render fewer entries at any one time on mobile.
maxMoviesPerRenderedPageMobile: 40

# The locale you want the webapp to use. See the i18n/-directory for a list of
# available locales.
language: "en"

# Where to deploy when rotcelloc is executed with --deploy. This is used as the
# target for rsync. Be careful with the target, all other files in the
# deployment target will be deleted. It can be a remote target in the form
# remote:/directory or a local target in the form /directory.
deployTo: null

# This option enables automatic "added" dates on entries in the database
# based upon when a line was added to git. This requires that you keep your
# rotcelloc collection in a git repository. Set it to false to disable, anything
# else to enable.
enableAutoAdded: true

# Your collections
collections:
	# The name of a collection
	"My Movies":
		# The type of a collection
		type: "movies"
		# Sources for data for this collection entry. See README.md
		sources: [
			{
				file: "animation.csv"
				name: "Animation"
				disneySort: true
			}
			{
				file: "otherMovies.csv"
				name: "Other movies"
			}
		]
	# The name of a collection
	"My TV series":
		# The type of a collection
		type: "series"
		# Sources for data for this collection entry. See README.md
		sources: [
			{
				file: "series.csv"
				name: "Series"
			}
		]
	# The name of a collection
	"My Games":
		# The type of a collection
		type: "games"
		# The default sorting for this collection
		defaultSort: "year"
		# Sources for data for this collection entry. See README.md
		sources: [
			{
				name: "My Steam account"
				source: "steam"
				user: "MYSTEAMACCOUNT"
			}
			{
				name: "My physical games"
				file: "games.csv"
			}
		]
