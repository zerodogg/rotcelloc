/* vim: set foldnestmax=3 : */
/*
 * rotcelloc client-side component
 *
 * Part of rotcelloc - the hacker's movie, tv-series and game collection
 * manager
 *
 * Copyright (C) Eskild Hustvedt 2015, 2016
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
// jshint esversion: 6
/* global jQuery*/
/* global _*/
(function ($)
{
    "use strict";
    function warn(message)
    {
        if(console && console.log)
        {
            console.log('rotcelloc: warning: '+message);
        }
    }

    /*
     * Renders a single collection entry into the DOM
     */
    class rotcellocEntryRenderer
    {
        constructor (entry,dataSources)
        {
            this.entry = entry;
            this.dataSources = dataSources;
        }

        /*
         * Renders the collection entry, appending it to the DOM target
         * specified
         */
        renderToDOM ($target)
        {
            const entry = this.entry;

            $target.addClass('col-entry');

            // FIXME: This should modify the DOM
            $target.html( this.renderCover(entry) );

            let header = entry.title;
            if(entry.year)
            {
                header += ' ('+entry.year+')';
            }
            $('<h3 />').text(header).appendTo($target);

            this.renderSingleMetadata($target,null,entry.author,'author');
            this.renderSingleMetadata($target,this.translate('Seasons'),entry.seasons,'seasons');
            if(entry.origTitle && entry.origTitle != entry.title)
            {
                this.renderSingleMetadata($target,this.translate('Original title'),entry.origTitle,'original-title');
            }
            this.renderSingleMetadata($target,this.translate('Disney classics no.'),entry.disneyClassicNo,'original-title');
            this.renderSingleMetadata($target,this.translate('Genre'),entry.genre,'genre');

            let $showMoreTarget = $('<div />');
            $showMoreTarget.addClass('showMore').addClass('collapse');

            let $showMore = $('<div />');
            $showMore.addClass('showMoreLink').appendTo($target);
            $showMoreTarget.appendTo($target);

            let $showMoreLink = $('<a />');
            $showMoreLink.appendTo($showMore);
            $showMoreLink.attr('href','#').text(this.translate('Show more information'));
            $showMoreLink.click((ev) =>
            {
                ev.preventDefault();
                this.showMore($showMoreTarget,$showMore);
            });
        }

        /*
         * Render a single metadata entry
         */
        renderSingleMetadata($target,label,value,cssClass, permitHTML = false)
        {
            if(value === undefined)
            {
                return;
            }
            if(cssClass === undefined)
            {
                if(label === undefined)
                {
                    cssClass = 'metadata-entry';
                }
                else
                {
                    cssClass = label.toLowerCase().replace(/\s+/g,'-');
                }
            }
            const $entry = $('<div />');
            $entry.addClass(cssClass);
            $entry.appendTo($target);
            if(label !== undefined && label !== null)
            {
                const $labelEntry = $('<div />');
                $labelEntry.addClass('meta-label');
                $labelEntry.text(label+': ');
                $labelEntry.appendTo($entry);
            }
            const $valueEntry = $('<span />');
            let renderValue = value;
            if(Array.isArray(value))
            {
                renderValue = value.join(', ');
            }
            if(permitHTML)
            {
                $valueEntry.html(renderValue);
            }
            else
            {
                $valueEntry.text(renderValue);
            }
            $valueEntry.appendTo($entry);
        }

        /*
         * Render cover
         */
        renderCover(entry)
        {
            if(!entry.poster)
            {
                return this.generateCover(entry);
            }
            return '<div class="poster"><img src="images/'+entry.poster+'" alt="" class="img-responsive img-rounded" /></div>';
        }
        /*
         * Generate a cover
         */
        generateCover (entry)
        {
            let coverHTML = '<div class="poster img-rounded poster-generated text-center">';
            coverHTML += '<h1>'+entry.title+'</h1>';
            let secondaryText,tietaryText;
            if(entry.author)
            {
                secondaryText = entry.author;
            }
            else if (entry.seasons)
            {
                secondaryText = entry.seasons;
            }
            if(entry.publisher)
            {
                tietaryText = entry.publisher;
            }
            if(secondaryText !== undefined)
            {
                coverHTML += '<h4>'+secondaryText+'</h4>';
            }
            if(tietaryText !== undefined)
            {
                coverHTML += '<i>'+tietaryText+'</i>';
            }
            coverHTML += '</div>';
            return coverHTML;
        }

        /*
         * Renders the "more" component of a collections entry, this will be called
         * when the user clicks the "Show more information" link
         */
        showMore($target,$showMoreLink)
        {
            const data = this.entry;
            if(data.altTitle && data.altTitle != data.title)
            {
                this.renderSingleMetadata($target,this.translate('Alternative title'),data.altTitle,'altTitle');
            }
            this.renderSingleMetadata($target,this.translate('Runtime'),data.runtime,'runtime');
            this.renderSingleMetadata($target,this.translate('Platform'),data.platform,'platform');
            this.renderSingleMetadata($target,this.translate('Developer'),data.developer,'developer');
            this.renderSingleMetadata($target,this.translate('Actors'),data.actors,'actors');
            this.renderSingleMetadata($target,this.translate('Director'),data.director,'director');
            this.renderSingleMetadata($target,this.translate('Writer'),data.writer,'writer');
            if(this.dataSources > 1)
            {
                let value;
                const sources = data.bSource.split(", ");
                for(let source = 0; source < sources.length; source++)
                {
                    const sourceN = sources[source];
                    if(source > 0)
                    {
                        value += ', ';
                    }
                    // FIXME: We should be provided with the sourceToNameMap
                    value += window.rotcelloc.workingMeta.sourceToNameMap[sourceN];
                }
                this.renderSingleMetadata($target,this.translate('Group'),value,'group');
            }
            const genericEntriesOrder = [ 'rating', 'metascore','imdbRating','isbn','format','publisher' ],
                genericEntries = {
                'rating':{
                    'label':this.translate('Custom rating'),
                    'renderer':(val) =>
                    {
                        return val+'/6';
                    }
                },
                'metascore':{
                    'label':this.translate('Metascore'),
                    'renderer':(val) =>
                    {
                        return val+'/100';
                    }
                },
                'imdbRating':{
                    'label':this.translate('IMDB rating'),
                    'renderer': (val,entryData) =>
                    {
                        return entryData.imdbRating+'/10 ('+entryData.imdbVotes+' '+this.translate('votes'  )+')';
                    }
                },
                'publisher':{
                    'label':this.translate('Publisher'),
                },
                'isbn':{
                    'label':this.translate('ISBN'),
                },
                'format':{
                    'label':this.translate('Format'),
                }
            };

            for(let genericEntryCurrI = 0; genericEntryCurrI < genericEntriesOrder.length; genericEntryCurrI++)
            {
                const genericEntryCurr = genericEntriesOrder[genericEntryCurrI];
                if(data[genericEntryCurr])
                {
                    const renderRules = genericEntries[genericEntryCurr];
                    let   value       = data[genericEntryCurr];
                    if(renderRules.renderer)
                    {
                        value = renderRules.renderer(value,data);
                    }
                    this.renderSingleMetadata($target,renderRules.label,value,genericEntryCurr);
                }
            }

            this.renderSingleMetadata($target,this.translate('Links'),this.getLinks(),'links',true);
            this.renderSingleMetadata($target,this.translate('Note'),data.note,'note');
            this.renderSingleMetadata($target,this.translate('Date added'),data.addedRaw,'addedRaw');
            this.renderSingleMetadata($target,null,data.plot,'plot');
            $showMoreLink.slideUp();
            $target.slideDown();
        }

        /*
         * Retrieves a string containing a set of links relating to this result
         */
        getLinks ()
        {
            const data = this.entry;
            let links = '';

            if(data.type == 'game')
            {
                links += '<a target="_blank" href="https://www.mobygames.com/search/quick?q='+encodeURIComponent(data.title)+'">MobyGames</a>, ';
                if(data.tgdbID)
                {
                    links += '<a target="_blank" href="http://thegamesdb.net/game/'+data.tgdbID+'/">TheGamesDB</a>';
                }
                else
                {
                    links += '<a target="_blank" href="http://thegamesdb.net/search/?string='+encodeURIComponent(data.title)+'&function=Search">TheGamesDB</a>';
                }
                if(data.steamID)
                {
                    links += ', ';
                    links += '<a target="_blank" href="http://store.steampowered.com/app/'+encodeURIComponent(data.steamID)+'/">Steam</a>';
                }
            }
            else if(data.type == 'series' || data.type == 'movies')
            {
                if(data.contentType && data.contentType == 'anime')
                {
                    links += '<a target="_blank" href="https://duckduckgo.com/?q='+encodeURIComponent( (data.origTitle ? data.origTitle : data.title) +' site:animenfo.com')+'">AnimeNFO</a>';
                    links += ', ';
                }
                let imdbURL;
                if(data.imdbID)
                {
                    imdbURL = 'http://www.imdb.com/title/'+data.imdbID;
                }
                else
                {
                    imdbURL = 'http://www.imdb.com/find?s=all&amp;s=tt&amp;q='+encodeURIComponent(data.origTitle ? data.origTitle : data.title)+'&amp;ttype='+ ( data.type == 'series' ? 'tv' : 'ft' );
                }
                links += '<a target="_blank" href="'+imdbURL+'">IMDB</a>';
                links += ', ';
                links += '<a target="_blank" href="https://www.themoviedb.org/search/'+( data.type == 'series' ? 'tv' : 'movie' )+'?query='+encodeURIComponent(data.origTitle ? data.origTitle : data.title)+'">TheMovieDB</a>';
            }
            else if(data.type == 'books')
            {
                let openLibraryLink = data.openliblink;
                if(data.openliblink === undefined)
                {
                    openLibraryLink = 'https://openlibrary.org/search?q='+data.isbn;
                }
                links += '<a target="_blank" href="'+openLibraryLink+'">OpenLibrary</a>, ';
                links += '<a target="_blank" href="https://www.goodreads.com/search?utf8=%E2%9C%93&query='+data.isbn+'">Goodreads</a>, ';
                links += '<a target="_blank" href="https://www.librarything.com/search.php?search='+data.isbn+'&searchtype=38&searchtype=38&sortchoice=0">LibraryThing</a>';
            }
            else
            {
                warn('Unknown/unhandled type: '+data.type);
            }
            // Add a trailer link (to YouTube) if the type is something where a
            // trailer makes sense
            if (data.type == 'game' || data.type == 'series' || data.type == 'movies')
            {
                let trailerSearch = data.normalizedTitle;
                if(data.year)
                {
                    trailerSearch += ' '+data.year.replace(/\D.*/g,'');
                }
                if(data.type == 'game')
                {
                    trailerSearch += ' game';
                }
                else if(data.type == 'series')
                {
                    trailerSearch += ' (tv OR series)';
                }
                else if(data.type == 'movies')
                {
                    trailerSearch += ' (movie OR theatrical OR film)';
                }
                trailerSearch += ' "trailer"';
                links += ', <a target="_blank" href="https://www.youtube.com/results?search_query='+encodeURIComponent(trailerSearch)+'">Trailer (YouTube)</a>';
            }
            return links;
        }

        /*
         * Hack that proxies translations through window.rotcelloc.translate
         * FIXME: This is ugly, we need a better solution
         */
        translate(str)
        {
            return window.rotcelloc.translate(str);
        }
    }

    /*
     * Result renderer class. This handles generating a page with the
     * results of a search.
     */
    class rotcellocResultRenderer
    {
        constructor ($target, maxEntries, dataSources)
        {
            this.renderedUpTo = -1;
            this.result = null;
            this.maxEntries = maxEntries;
            this.dataSources = dataSources;
            this.$target = $target;
        }

        /*
         * Sets up a new result set and performs initial rendering of it
         */
        setResults (result)
        {
            this.result = result;
            this.renderedUpTo = -1;
            this.resetField();
            this.renderSubset();

        }

        /*
         * This will render a single subset (that is, one set of maxEntriesPerRenderedPage)
         * of our current results
         */
        renderSubset ()
        {
            this.mustHaveResult();

            let entriesOnCurrentRow = 4;
            let $currentRow;

            let totalRendered = 0;
            for(let entryNo = this.renderedUpTo+1; entryNo < this.result.length; entryNo++)
            {
                const entry = this.result[entryNo];
                if(++entriesOnCurrentRow > 4)
                {
                    $currentRow = $('<div />');
                    $currentRow.addClass('row');
                    $currentRow.appendTo(this.$target);
                    entriesOnCurrentRow = 1;
                }
                let $entryTarget = $('<div />');
                $entryTarget.addClass('col-sm-3');
                $entryTarget.appendTo($currentRow);

                this.renderedUpTo = entryNo;

                const renderer = new rotcellocEntryRenderer(entry);
                renderer.renderToDOM($entryTarget);

                if (++totalRendered >= this.maxEntries)
                {
                    break;
                }
            }
        }

        /*
         * This resets our target field, emptying it
         */
        resetField ()
        {
            this.$target.html('');
        }

        /*
         * This is a wrapper that throws an error if we don't have this.result
         * (which translates to some action being performed on us before
         * .setResults has been called)
         */
        mustHaveResult (name)
        {
            if (!this.result)
            {
                throw('Attempt to use rotcellocEntryRenderer.'+name+' without having called setResults');
            }
        }
    }

    /*
     * This is our base class, it handles data retrieval, search, rendering
     * etc., calling *Renderer classes as needed
     */
    class rotcelloc
    {
        /*
         * Initializes the page:
         * - Sets up object variables
         * - Loads data
         * - Performs initial render
         * - Sets up event handlers
         */
        constructor ()
        {
            this.currentResults = [];
            this.prevQuery      = null;
            this.getDataSet(data =>
                {
                    $('#menuToggle').text(this.translate('Show/hide menu'));
                    if (/(Android|Mobile|iOS|iPhone)/.test(navigator.userAgent))
                    {
                        this.maxEntriesPerRenderedPage = data.config.maxEntriesPerRenderedPageMobile;
                        this.mobile = true;
                    }
                    else
                    {
                        this.maxEntriesPerRenderedPage = data.config.maxEntriesPerRenderedPage;
                        this.mobile = false;
                    }
                    this.renderer = new rotcellocResultRenderer(
                        $('#collResultTarget'),
                        this.maxEntriesPerRenderedPage,
                        this.data.config.collections[this.pagetype].sources.length
                    );
                    this.renderSearchPanel();
                    this.initAutoSearcher();
                    this.renderResults(this.workingData);
                    if (!this.mobile)
                    {
                        $('#searchBox').focus();
                    }

                    $(window).scroll(() =>
                    {
                            if ($(window).scrollTop() + $(window).height() >= $(document).height() - 1000)
                            {
                                this.showNextResults();
                            }
                    });
                    $('body').removeClass('loading');
            });
        }
        /*
         * Initializes the auto-search event listeners
         */
        initAutoSearcher()
        {
            const runSearch = () =>
            {
                this.performSearchFromHTML();
            };
            $('#searchForm').on('change','input,select',runSearch);
            $('#searchForm').on('keyup','#searchBox',function ()
            {
                if($(this).val().length > 2 || $(this).val().length === 0)
                {
                    runSearch();
                }
            });
        }
        /*
         * Downloads and prepares the dataset for the collection on the current page
         */
        getDataSet(cb)
        {
            const $colResT = $('#collResultTarget');
            const pagetype = $colResT.data('pagetype');
            if(pagetype === undefined)
            {
                return;
            }
            $.getJSON(pagetype.toLowerCase().replace(/\s+/g,'_')+'.dataset.json?'+$colResT.data('checksum'),(data) =>
            {
                    this.data    = data;
                    this.pagetype    = pagetype;
                    this.workingData = data.data;
                    this.workingMeta = data.meta;
                    this.workingConfig = this.data.config.collections[pagetype];
                    if(this.data.dVer !== 0)
                    {
                        $colResT.text('ERROR: Dataset is of an unsupported version: '+this.data.dVer);
                    }
                    else
                    {
                        cb(data);
                    }
            });
        }
        /*
         * Renders a result set
         */
        renderResults(result)
        {
            this.renderer.setResults(result);
            this.setPageTitle('('+result.length+')');
        }
        /*
         * Function that gets triggered on scroll to render more items if needed
         */
        showNextResults()
        {
            this.renderer.renderSubset();
        }
        /*
         * Reads values from the DOM that will then be handed over to the search
         * function
         */
        performSearchFromHTML()
        {
            const query           = {},
                $group          = $('#group .active input'),
                platform        = $('#platform .active input').attr('data-value'),
                order           = $('#order option:selected()').attr('data-value'),
                $format         = $('#format .active input'),
                $genre          = $('#genre .active input'),
                $plotSearch     = $('#plotSearch .active input'),
                $watchedSearch     = $('#watchedSearch .active input'),
                genreSearchType = $('#genre_searchtype option:selected()').attr('data-value'),
                text            = $('#searchBox').val();
            const group         = $group.attr('data-value'),
                groupDisneySort = $group.attr('data-disneysort');
            if(group)
            {
                query.group = group;
            }
            if(platform)
            {
                query.platform = platform;
            }
            if(groupDisneySort && groupDisneySort == 'true')
            {
                query.disneySort = true;
            }
            if(text)
            {
                query.text = text.toLowerCase();
            }
            if(order)
            {
                query.order = order;
            }
            if($plotSearch && $plotSearch.attr('data-value') == 'true')
            {
                query.plotSearch = true;
            }
            if($watchedSearch && $watchedSearch.attr('data-value') == 'true')
            {
                query.watchedSearch = true;
            }
            if($genre && $genre.length)
            {
                query.genres = [];
                $genre.each(function()
                {
                    query.genres.push($(this).attr('data-value'));
                });
                query.genreSearchType = genreSearchType;
            }
            if($format && $format.length)
            {
                query.formats = [];
                $format.each(function()
                {
                    query.formats.push($(this).attr('data-value'));
                });
                query.genreSearchType = genreSearchType;
            }
            this.performSearch(query);
        }
        /*
         * Searches our dataset, handling many different fields and scoring hits
         * appropriately
         */
        performSearch(query)
        {
            let results = [];
            if(_.isEqual(query,this.prevQuery))
            {
                return;
            }
            else
            {
                this.prevQuery = query;
            }
            for(let collectionN = 0; collectionN < this.workingData.length; collectionN++)
            {
                let searchScore = 10,
                    hit;
                const collectionEntry = this.workingData[collectionN];
                if (query.watchedSearch)
                {
                    if (collectionEntry.watched === undefined || collectionEntry.watched === true)
                    {
                        continue;
                    }
                }
                if(query.group)
                {
                    if (/,/.test(collectionEntry.bSource))
                    {
                        hit = false;
                        const sources = collectionEntry.bSource.split(/,\s+/);
                        for(let keyN = 0; keyN < sources.length; keyN++)
                        {
                            if(sources[keyN] == query.group)
                            {
                                hit = true;
                            }
                        }
                        if (!hit)
                        {
                            continue;
                        }
                    }
                    else
                    {
                        if(collectionEntry.bSource != query.group)
                        {
                            continue;
                        }
                    }
                }
                if(query.formats)
                {
                    hit = true;
                    if (!collectionEntry.format)
                    {
                        continue;
                    }
                    for (const formatI in query.formats)
                    {
                        const queryFormat = query.formats[formatI];
                        let found = false;
                        for(let format = 0; format < collectionEntry.format.length; format++)
                        {
                            if(collectionEntry.format[format] == queryFormat)
                            {
                                found = true;
                                break;
                            }
                        }
                        if (!found)
                        {
                            hit = false;
                        }
                    }
                    if (!hit)
                    {
                        continue;
                    }
                }
                if(query.format)
                {
                    hit = false;
                    let fmt;
                    if(collectionEntry.format)
                    {
                        for(fmt = 0; fmt < collectionEntry.format.length; fmt++)
                        {
                            if(collectionEntry.format[fmt] == query.format)
                            {
                                hit = true;
                                break;
                            }
                        }
                    }
                    if (!hit)
                    {
                        continue;
                    }
                }
                if(query.platform)
                {
                    hit = false;
                    let platform;
                    if(query.platform != 'PC' && query.platform != 'Windows')
                    {
                        for(platform = 0; platform < collectionEntry.platform.length; platform++)
                        {
                            if(collectionEntry.platform[platform] == query.platform)
                            {
                                hit = true;
                                break;
                            }
                        }
                    }
                    else
                    {
                        // We alias "PC" to be PC, Windows, Mac or Linux,
                        // and "Windows" to be PC or Windows
                        let regexAlias;
                        if(query.platform == 'PC')
                        {
                            regexAlias = /^(PC|Windows|Mac|Linux)$/;
                        }
                        else if(query.platform == 'Windows')
                        {
                            regexAlias = /^(PC|Windows)$/;
                        }
                        for(platform = 0; platform < collectionEntry.platform.length; platform++)
                        {
                            if (regexAlias.test(collectionEntry.platform[platform]))
                            {
                                hit = true;
                                break;
                            }
                        }
                    }
                    if (!hit)
                    {
                        continue;
                    }
                }
                if(query.genres)
                {
                    hit = true;
                    if(query.genreSearchType == 'all' || query.genreSearchType == 'any')
                    {
                        if (!collectionEntry.genre)
                        {
                            continue;
                        }
                        if(query.genreSearchType == 'any')
                        {
                            hit = false;
                            for (const genreAI in query.genres)
                            {
                                if(collectionEntry.genre.indexOf(query.genres[genreAI]) != -1)
                                {
                                    hit = true;
                                    continue;
                                }
                            }
                        }
                        else
                        {
                            for (const genreI in query.genres)
                            {
                                if(collectionEntry.genre.indexOf(query.genres[genreI]) == -1)
                                {
                                    hit = false;
                                    continue;
                                }
                            }
                        }
                    }
                    else if(query.genreSearchType == 'notin')
                    {
                        hit = true;
                        if(collectionEntry.genre)
                        {
                            for (const genreNI in query.genres)
                            {
                                if(collectionEntry.genre.indexOf(query.genres[genreNI]) != -1)
                                {
                                    hit = false;
                                    continue;
                                }
                            }
                        }
                    }
                    if (!hit)
                    {
                        continue;
                    }
                }
                if(query.text)
                {
                    hit = false;
                    if(collectionEntry.title.toLowerCase().indexOf(query.text) != -1)
                    {
                        hit = true;
                    }
                    else if (collectionEntry.origTitle && collectionEntry.origTitle.toLowerCase().indexOf(query.text) != -1)
                    {
                        hit = true;
                    }
                    else if (collectionEntry.altTitle && collectionEntry.altTitle.toLowerCase().indexOf(query.text) != -1)
                    {
                        hit = true;
                    }
                    else if(collectionEntry.note && collectionEntry.note.toLowerCase().indexOf(query.text) != -1)
                    {
                        hit = true;
                    }
                    else if(collectionEntry.actors && collectionEntry.actors.toLowerCase().indexOf(query.text) != -1)
                    {
                        hit         = true;
                        searchScore = 8;
                    }
                    else if(collectionEntry.writer && collectionEntry.writer.toLowerCase().indexOf(query.text) != -1)
                    {
                        hit         = true;
                        searchScore = 8;
                    }
                    else if(collectionEntry.director && collectionEntry.director.toLowerCase().indexOf(query.text) != -1)
                    {
                        hit         = true;
                        searchScore = 8;
                    }
                    else if(collectionEntry.developer && collectionEntry.developer.toLowerCase().indexOf(query.text) != -1)
                    {
                        hit         = true;
                        searchScore = 8;
                    }
                    else if(collectionEntry.genre && collectionEntry.genre.toLowerCase().indexOf(query.text) != -1)
                    {
                        hit         = true;
                        searchScore = 7;
                    }
                    else if(collectionEntry.year && collectionEntry.year == query.text)
                    {
                        hit         = true;
                        searchScore = 5;
                    }
                    else if(collectionEntry.bSource.toLowerCase().indexOf(query.text) != -1)
                    {
                        hit         = true;
                        searchScore = 3;
                    }
                    else if (query.plotSearch && collectionEntry.plot && collectionEntry.plot.toLowerCase().indexOf(query.text) != -1)
                    {
                        hit         = true;
                        searchScore = 2;
                    }
                    if (!hit)
                    {
                        continue;
                    }
                }
                if(query.custom)
                {
                    if(query.custom.type == 'substr')
                    {
                        if (collectionEntry[query.custom.field].indexOf(query.custom.text) === -1)
                        {
                            continue;
                        }
                    }
                    else if(query.custom.type == 'not-defined')
                    {
                        if (collectionEntry[query.custom.field] !== undefined)
                        {
                            continue;
                        }
                    }
                    else if(query.custom.type == 'defined')
                    {
                        if (collectionEntry[query.custom.field] === undefined)
                        {
                            continue;
                        }
                    }
                }
                collectionEntry.searchScore = searchScore;
                results.push(collectionEntry);
            }
            let sorted = false;
            if(query.order)
            {
                const orderByOptionalField = function (optField,orderType)
                {
                    return function (a,b)
                    {
                        if(a[optField] && b[optField] && a[optField] != b[optField])
                        {
                            if(orderType == 'text')
                            {
                                return a[optField].localeCompare(b[optField]);
                            }
                            return b[optField] - a[optField];
                        }
                        if(a[optField] && !b[optField])
                        {
                            return -1;
                        }
                        else if(!a[optField] && b[optField])
                        {
                            return 1;
                        }
                        return a.title.localeCompare(b.title);
                    };
                };
                if(query.order == 'alpha')
                {
                    sorted = true;
                    results.sort((a,b) =>
                    {
                            return a.title.localeCompare(b.title,'no-nn');
                    });
                }
                else if(query.order == 'random')
                {
                    sorted  = true;
                    results = _.shuffle(results);
                }
                else if(query.order == 'rating' || query.order == 'imdbRating' || query.order == 'metascore' || query.order == 'runtimeMin' || query.order == 'sortYear' || query.order == 'normalizedRating' || query.order == 'added')
                {
                    sorted = true;
                    results.sort( orderByOptionalField(query.order,'numeric') );
                }
                else if (query.order == 'sortableAuthor')
                {
                    sorted = true;
                    results.sort( orderByOptionalField(query.order,'text') );
                }
                else
                {
                    warn('Skipping sorting by unknown method: '+query.order);
                }
            }
            if(sorted === false)
            {
                results.sort((a,b) =>
                {
                        if(a.searchScore != b.searchScore)
                        {
                            return b.searchScore - a.searchScore;
                        }
                        if(query.disneySort)
                        {
                            if(a.disneyClassicNo && b.disneyClassicNo)
                            {
                                return a.disneyClassicNo - b.disneyClassicNo;
                            }
                            if(a.disneyClassicNo && !b.disneyClassicNo)
                            {
                                return -1;
                            }
                            if(!a.disneyClassicNo && b.disneyClassicNo)
                            {
                                return 1;
                            }
                        }
                        return a.title.localeCompare(b.title);
                });
            }
            this.renderResults(results);
        }
        /*
         * Renders the search panel on the page
         */
        renderSearchPanel()
        {
            const plotSearchBool = {
                id: 'plotSearch',
                buttons: [
                    {
                        id: 'search_plot_yes',
                        value: 'true',
                        active: false,
                        name: this.translate('Yes')
                    },
                    {
                        id: 'search_plot_no',
                        value: 'false',
                        active: true,
                        name: this.translate('No')
                    }
                ],
            },
                watchedSearchBool = {
                id: 'watchedSearch',
                buttons: [
                    {
                        id: 'only_unwatched_yes',
                        value: 'true',
                        active: false,
                        name: this.translate('Yes')
                    },
                    {
                        id: 'only_unwatched_no',
                        value: 'false',
                        active: true,
                        name: this.translate('No')
                    }
                ],
            },
                orderButtons = {
                id: 'order',
                buttons: [
                    {
                        id: 'order_none',
                        value: '',
                        active: this.workingConfig.defaultSort !== 'year',
                        name: this.translate('Automatic')
                    }
                ]
            };
            if(this.workingMeta.type == 'books')
            {
                orderButtons.buttons.push(
                {
                    id: 'sortableAuthor',
                    value: 'sortableAuthor',
                    name: this.translate('Author'),
                    active: this.workingConfig.defaultSort === 'sortableAuthor'
                });
            }
            if(this.workingMeta.hasDisneySort)
            {
                orderButtons.buttons.push(
                    {
                        id: 'order_alpha',
                        value: 'alpha',
                        name: this.translate('Alphabetic')
                    }
                );
            }
            else
            {
                orderButtons.buttons[0].name = this.translate('Alphabetic');
            }
            if (this.workingMeta.fields.year)
            {
                orderButtons.buttons.push(
                    {
                        id: 'order_year',
                        value: 'sortYear',
                        name: this.translate('Year'),
                        active: this.workingConfig.defaultSort === 'year'
                    }
                );
            }
            if (this.workingMeta.fields.added)
            {
                orderButtons.buttons.push(
                    {
                        id: 'order_added',
                        value: 'added',
                        name: this.translate('Date added'),
                        active: this.workingConfig.defaultSort === 'added'
                    }
                );
            }
            orderButtons.buttons.push(
                {
                    id: 'order_rand',
                    value: 'random',
                    name: this.translate('Random')
            });

            if (this.workingMeta.type == 'movies' || this.workingMeta.type == 'series')
            {
                orderButtons.buttons.push(
                {
                    id: 'runtime',
                    value: 'runtimeMin',
                    name: this.translate('Length')
                });
            }
            if(this.workingMeta.enableNormalized)
            {
                orderButtons.buttons.push(
                    {
                        id: 'order_normalRating',
                        value: 'normalizedRating',
                        name: this.translate('Rating (smart)')
                    }
                );
            }
            if(this.workingMeta.fields.rating)
            {
                orderButtons.buttons.push(
                    {
                        id: 'order_rating',
                        value: 'rating',
                        name: this.translate('Custom rating')
                    }
                );
            }
            if (this.workingMeta.fields.metascore)
            {
                orderButtons.buttons.push(
                    {
                        id: 'order_meta',
                        value: 'metascore',
                        name: this.translate('Metascore')
                    });
            }
            if (this.workingMeta.type == 'movies' || this.workingMeta.type == 'series')
            {
                orderButtons.buttons.push(
                    {
                        id: 'order_imdb',
                        value: 'imdbRating',
                        name: this.translate('IMDB rating')
                    }
                );
            }
            const platformButtons = {
                id: 'platform',
                buttons: [{
                        id: 'platforms_none',
                        value: '',
                        active: true,
                        name: this.translate('All')
                }]
            };
            if(this.workingMeta.platforms && this.workingMeta.platforms.length > 1)
            {
                for (const platformI in this.workingMeta.platforms)
                {
                    const platform = this.workingMeta.platforms[platformI];
                    platformButtons.buttons.push({
                            id: 'platforms_'+platformI,
                            value: platform,
                            name: platform
                    });
                }
            }
            const groupButtons = {
                id: 'group',
                buttons: [{
                        id: 'groups_none',
                        value: '',
                        active: true,
                        name: this.translate('All')
                }]
            };
            for (const groupI in this.data.config.collections[this.pagetype].sources)
            {
                const group = this.data.config.collections[this.pagetype].sources[groupI];
                groupButtons.buttons.push({
                        id: 'groups_'+groupI,
                        value: group.bSource ,
                        disneySort: group.disneySort,
                        name: group.name
                });
            }
            const genreButtons = {
                id: 'genre',
                type: 'checkbox',
                buttons: []
            };
            if(this.workingMeta.genres && this.workingMeta.genres.length)
            {
                for(let genreN = 0; genreN < this.workingMeta.genres.length; genreN++)
                {
                    const genre = this.workingMeta.genres[genreN];
                    genreButtons.buttons.push({
                        id: 'genre_'+genre,
                        value: genre,
                        name: genre
                    });
                }
            }
            const formatButtons = {
                id: 'format',
                type: 'checkbox',
                buttons: []
            };
            if(this.workingMeta.formats && this.workingMeta.formats.length)
            {
                for(let formatN = 0; formatN < this.workingMeta.formats.length; formatN++)
                {
                    const format = this.workingMeta.formats[formatN];
                    formatButtons.buttons.push({
                        id: 'format_'+format,
                        value: format,
                        name: format
                    });
                }
            }
            let hasMore = false;
            if(groupButtons.buttons.length > 2 || genreButtons.buttons.length || formatButtons.buttons.length)
            {
                hasMore = true;
            }
            let html = '';
            html += '<div class="row">';
            html += '<div class="col-sm-2 form-inline row-padding">';
            if(hasMore)
            {
                html +='<div class="btn-group" data-toggle="buttons-checkbox"><a class="btn btn-primary collapse-data-btn" data-toggle="collapse" href="#moreFilters">'+this.translate('Show filter')+'</a></div>';
            }
            html += '</div>';
            html += '<div class="col-sm-10 form-inline row-padding text-right"><div class="input-group"><div class="input-group-addon">'+this.translate('Order')+'</div>'+this.renderSelectElement(orderButtons)+'</div><input type="text" class="form-control pull-right" placeholder="'+this.translate('Search')+'" id="searchBox" /></div>';
            if(hasMore)
            {
                html += '</div><div class="collapse" id="moreFilters"><div class="well">';
            }
            if(groupButtons.buttons.length > 2)
            {
                html += '<div class="row"><div class="col-sm-12 row-padding"><div class="searchbar-label">'+this.translate('Group')+':</div>'+this.renderRadioOrCheckButtons(groupButtons)+'</div></div>';
            }
            if(platformButtons.buttons.length > 2)
            {
                html += '<div class="row"><div class="col-sm-12 row-padding"><div class="searchbar-label">'+this.translate('Platform')+':</div>'+this.renderRadioOrCheckButtons(platformButtons)+'</div></div>';
            }
            if(formatButtons.buttons.length > 1)
            {
                html += '<div class="row"><div class="col-sm-12 row-padding"><div class="searchbar-label">'+this.translate('Format')+':</div>'+this.renderRadioOrCheckButtons(formatButtons)+'</div></div>';
            }
            if(genreButtons.buttons.length)
            {
                const genreType = {
                    id: 'genre_searchtype',
                    buttons: [
                        {
                            id: 'genre_inall',
                            value: 'all',
                            active: true,
                            name: this.translate('In genre (all selected)'),
                        },
                        {
                            id: 'genre_inany',
                            value: 'any',
                            active: false,
                            name: this.translate('In genre (any selected)')
                        },
                        {
                            id: 'genre_notin',
                            value: 'notin',
                            active: false,
                            name: this.translate('Not in genre'),
                        },
                    ]
                };

                html += '<div class="row"><div class="col-sm-12 row-padding"><div class="searchbar-label genre-select-line form-inline">'+this.renderSelectElement(genreType)+':</div>'+this.renderRadioOrCheckButtons(genreButtons)+'</div></div>';
            }
            if(this.workingMeta.fields.watched || this.workingMeta.fields.plot)
            {
                html += '<div class="row"><div class="col-sm-12 row-padding">';
                if(this.workingMeta.fields.plot)
                {
                    html += '<div class="searchbar-label-inline">'+this.translate('Search in plot descriptions')+'</div>'+this.renderRadioOrCheckButtons(plotSearchBool);
                }
                if(this.workingMeta.fields.watched === true)
                {
                    html += '<div class="searchbar-additional searchbar-label-inline">'+this.translate('Only display unwatched titles')+'</div>'+this.renderRadioOrCheckButtons(watchedSearchBool);
                }
                html += '</div></div>';
            }
            if(hasMore)
            {
                html += '</div>';
            }
            html += '</div>';
            $('#searchForm').html(html);
        }
        /*
         * Sets the page title. Useful because it also tracks the original title
         * for us and just appends whatever we supply to this function to the
         * original title
         */
        setPageTitle(add)
        {
            const $title    = $('title');
            let origTitle = $title.text();
            if($title.attr('orig-title'))
            {
                origTitle = $title.attr('orig-title');
            }
            $title.attr('orig-title',origTitle);
            $title.text(origTitle+' '+add);
        }
        /*
         * Renders a single "select"
         */
        renderSelectElement(data)
        {
            let html = '<select class="form-control" id="'+data.id+'">';
            for(let buttonI = 0; buttonI < data.buttons.length; buttonI++)
            {
                const button = data.buttons[buttonI];
                html += '<option data-value="'+button.value+'"'+(button.active ? ' selected' : '' )+'>'+button.name+'</option>';
            }
            html += '</select>';
            return html;
        }
        /*
         * Renders a single set of radio or check-style buttons
         */
        renderRadioOrCheckButtons(data)
        {
            let html = '',
                type = 'radio';
            if(data.type == 'checkbox')
            {
                type = 'checkbox';
            }
            let htmlClass = 'btn-group';
            let allText = '';
            for(let buttonI = 0; buttonI < data.buttons.length; buttonI++)
            {
                const button = data.buttons[buttonI];
                html += '<label class="btn btn-primary';
                if(button.active)
                {
                    html += ' active';
                }
                html += '">';
                html += '<input type="'+type+'" name="options" id="'+button.id+'" autocomplete="off" data-value="'+button.value+'"';
                if(button.disneySort)
                {
                    html += ' data-disneysort="true"';
                }
                if(button.active)
                {
                    html += ' checked';
                }
                html += '> '+button.name;
                html +='</label>';
                allText += button.name;
            }
            const avgLength = allText.length/data.buttons.length;
            if( ( allText.length > 115 && avgLength < 9.5) || allText.length > 140 || data.buttons.length > 25)
            {
                htmlClass += ' btn-group-xs';
            }
            else if(allText.length > 100 || data.buttons.length > 20)
            {
                htmlClass += ' btn-group-sm';
            }
            html = '<div class="'+htmlClass+'" data-toggle="buttons" id="'+data.id+'">'+html+'</div>';
            return html;
        }
        /*
         * Translates a single string
         */
        translate(s)
        {
            if(this.data.i18n[s])
            {
                return this.data.i18n[s];
            }
            return s;
        }
    }
    /*
     * Runs our init function on jquery load
     */
    $(() =>
    {
        // Expose the object so that it can be called from the console
        window.rotcelloc = new rotcelloc();
    });
})(jQuery);
