# Contributing
Contributions are most welcome. Fork the project on
[GitHub](https://github.com/zerodogg/rotcelloc) and send pull-requests, or
submit your patches via e-mail to code@zerodogg.org.

# Overview

rotcelloc consists of two components: the local command-line application that builds
the database and prepares the webapp, and the webapp which loads the database
and gives the user a nice UI for it.

## command-line application (rotcelloc)

The command-line application that does all of the parsing of a
collection, downloads metadata and posters, builds the JSON-database, compiles
JS and CSS, and then renders the HTML through our EJS-template.

## webapp

The webapp consists of some almost-empty HTML-files that bootstraps the
javascript. The javascript then downloads the database and generates the rest
of the UI and handles user input. It makes a few assumptions about elements on
the page, and that the CSS has been loaded - other than that it is fairly
self-contained.

# Code style

The base code style is: 4 spaces for each indentation level, curly braces on
their own lines (except for in object declarations).

Each function should have a comment above it declaring what it does.

In the command-line application functions that are related to each other should be
grouped together in the various objects that are declared there. It can also
use any JS syntxa that the current node.js version supports.

In the client-side code, one can use the latest lodash and jquery versions. It
should work in any recent version of modern browsers (which means no "for of"
yet).  Supporting IE is not a priority, though it should be supported when that
does not complicate things too much - loading shims when needed is a decent
solution. Degraded functionality in IE is perfectly acceptable. The application
should work well on both mobile and desktop.

jshint should not output any warnings or errors.
