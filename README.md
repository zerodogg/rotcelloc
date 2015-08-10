# rotcelloc - the hacker's movie, tv-series and game collection manager

Rotcelloc is an application that manages your movie, TV-series and games
collection. It takes CSV-files, or a Steam username, as its input, and
outputs JSON files and a static web application that can be used to view
and search a collection.

Rotcelloc will download posters for your collection, download metadata (plot
summary, developer or director name, metascore) and generate a pretty (static)
web application that can be used to view, search, filter and sort your
collection in many ways. All functionality (search, filter, sort) in the web
application is performed in javascript on the client, so there are ny
requirements for the web server and no server side configuration needed. Simply
generate the collection on your local machine and upload it to a web server.

## User guide

### Installation

Run `npm install` to install all dependencies. Then follow the rest of the user
guide to configure your instance.

**Note**: you will have to manually install a patched version of "movie-art"
for the time being, as upstream does not yet have the patches we require.
Install the patched version from https://github.com/zerodogg/movie-art/tree/tv-support

### Creating a collection

Rotcelloc uses CSV-files that you write yourself to manage your collection.
You enter your collection in the CSV file, and then configure rotcelloc to use
that file. A single collection can consist of several input files, and each
file gets treated as a "group". Groups will be displayed in the interface.
Rotcelloc does not enforce any organizational pattern on your files, so you're
free to handle them however you want - one way could be to have the file
designating where the items are, for instance "OnShelf.csv" and "InFolder.csv"
- or you can simply have a "My(Movie|Series|Game)Collection.csv". You can enter
as little or as much information in the file as you wish. Rotcelloc will do its
best to retrieve the rest.

Because the files are simple CSV-files, you can easily manage them in a
revision control system, such as git, your data is not locked into any one
application, and can be easily converted to other formats in the future if you
want to. Your collection can also be viewed and searched without any
applications at all, if the need should arise.

You can use any CSV-compatible application to edit the files, everything from
something as simple as vim to something as comparatively complex as
LibreOffice. See the section on "CSV-file format" for information on how to lay
out your files, and how to tell ie. LibreOffice to export it.

In addition to the CSV-files, Rotcelloc can also retrieve your collection
automatically from Steam. This is as of now the only supported third party
source for a collection. See the tools/ directory for scrapers that you can use
with other services to generate one-off CSV-files for you to make it easier to
bootstrap your collection. If a service you're using is missing, feel free to
write one and send a pull request.

#### Configuring rotcelloc

Rotcelloc needs a configuration file to know which files to load your
collection from, what kind of collection it is as well as the name of the
collection. The configuration file is in the JSON format which requires some
care when writing.

To get a basis file to work with, copy config.json.tpl to config.json,
and then edit the latter file. You can add as many "collections" as you wish, and
each collection can have any number of files.

##### Toplevel options

menuSiteTitle - this is the title that will be displayed on the top right of
your site. Any text string is permitted.

maxMoviesPerRenderedPage - to not overload a browser on large collections by
trying to display one thousand images at once, rotcelloc uses a form of
infinite scrolling to limit the load. It only displays maxMoviesPerRenderedPage
at one time, when the user is reaching the bottom of the result, it renders the
next batch of the same number. A reasonable place to start is 100.

maxMoviesPerRenderedPageMobile - this is the same as the above, except this
version only applies to mobile browsers. Those are often running on limited
connections and generally have weaker hardware than their desktop counterparts
(and they also show fewer results on-screen at a time). It is therefore
useful to limit them more than desktops. A reasonable place to start is 40.

language - set this to the language you want rotcelloc to use. The supported
languages can be found in i18n/. Additional translations are welcome.

##### Collection options

The name of a collection is its key. Its value is another object/hash of key-value
pairs. The following keys are premitted:

"type" (*required*) - this key which defines what kind of collection it is. These can be
"movies", "series" or "games". This is needed because it tells rotcelloc how to
retrieve metadata information.

"defaultSort" (optional) - this key sets the default sorting for this
collection. It accepts "year" and "rating". If this is not set then it will be
automatic (which is "alphanumeric" sorting for collections without any
disneyClassicNo, and a special disney classic sorting + alphanumeric for those
that have disneyClassicNo entries).

"sources" (*required*) - this is an array that lists all files that are to be
included into this collection. Each array entry can contain the following keys:

- "source" (optional) - the source to load from. Defaults to "file". Can also
  be "steam".
- "file" (*required* when source=file) - the path to the file to load
- "user" (*required* when source=steam) - the name of the Steam community
  profile to load the collection from
- "name" (*required*) - the name to call this group of collection entries
- "disneySort" (optional) - boolean, defaults to false. Enable or disable
  disneyClassicNo-style sorting.
- "contentType" (optional) - string. Set this to "anime" to include links to
  animenfo for all entries from this file. The default is no contentType, in
  which case animenfo entries are not included.

See the examples/ directory for examples of more advanced configurations.


### CSV-file format

rotcelloc expects a ;-separated JSON file. You can have comments in the file if
you want, using a hash (#). All columns are optional except for the title. The
column titles are case insensitive (will all be converted to lowercase
internally). You can add any columns you wish and Rotcelloc will simply ignore
any it does not know what to do about.

#### Columns

##### Columns valid for all types

title - The title of the item (ie. game, movie or TV series title)

origTitle - The original title of the item (ie. if the title is localized. Not
required, but can make it easier to download metadata)

altTitle - An alternate title for the item (ie. the English title if the
origTitle is not in English, and the title is localized. Having this can make
it easier to download metadata in these cases)

year - the year the item was released (while not required, it is a recommended
field as it makes the metadata extractor much more accurate).

genre - a comma-separated list of genres. `rotcelloc` can also be configured to
generate this from the downloaded metadata by setting a key in the config.

note - a generic text field for additional information you want to be displayed
with the entry. This field is searchable in the webapp.

rating - your custom rating for this game (1-6)

customCover - a complete URL for a HTTP resource to download the cover for this
item from. If omitted the cover will be auto-detected. This field can be useful
in the few cases where `rotcelloc` is unable to find a cover on its own.

##### Columns only valid for movies and TV series

seasons - a comman-separated list of the seasons of a TV series that you own

imdbID - the IMDB id for this item. This is to help `rotcelloc` find metadata
for the item, or force it to use a certain entry if it detects the wrong one.
As we use the OMDB, if this is omitted we will do what we can to autodetect it
using OMDB (which usually works very well).

actors - a list of actors for the item, will be extracted from metadata if
omitted

disneyClassicNo - this is a special entry, it sets the «Disney Classics»
number. It is used to provide special sorting for Disney Classics, and to
display the number.

format - the format of the item, ie. BluRay, DVD

##### Columns only valid for games

platform - which platform the game is on, ie. Linux, Windows, PS3, Vita.

format - the format of the game, ie. DVD, Steam, GOG, PSN, BluRay etc.

## Standing on the shoulders of giants

rotcelloc uses a huge amount of libraries and metadata soures, and wouldn't be
possible without them.

### Metadata sources

[OMDb API](http://omdbapi.com/) - The Open Movie Database. Used for all movie
and TV series metadata and fallback movie and TV series posters.

[The Movie Database](https://www.themoviedb.org/). Used for movie and TV series
posters.

[TheGamesDB.net](http://thegamesdb.net/). Used for game metadata and posters.

[Steam](http://store.steampowered.com/). Used to retrieve metadata on Steam
games and fallback game posters.

### Libraries

`rotcelloc` uses *many* libraries, not all are listed here. See the source for
the others. Thanks for making great libraries available as free software.

[Bootstrap](http://getbootstrap.com/) - used for the layout for the webapp.

[csv-parse](https://www.npmjs.com/package/csv-parse) - used to parse the CSV
files.

[wait.for](https://www.npmjs.com/package/wait.for) - used to convert async
libraries to synchronous

[commander](https://www.npmjs.com/package/commander) - used to parse
command-line parameters

[movie-art](https://www.npmjs.com/package/movie-art) - used to retrieve posters
from TMDb

[jQuery](http://jquery.com/) - used for DOM-traversal and manipulation in the
webapp

[lodash](https://lodash.com/) - used for various utility functions in both the
command-line and web apps

## Thanks

Thanks to Lisbeth Helen Storebø and Helene Hemstad for ongoing feedback and
testing.

## License
Copyright &copy; Eskild Hustvedt 2015

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
