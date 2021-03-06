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
     * Base class that provides translation functionality
     */
    class rotcellocBase
    {
        constructor(i18n)
        {
            this.i18n = i18n;
        }

        translate (str)
        {
            if(this.i18n[str])
            {
                return this.i18n[str];
            }
            return str;
        }
    }

    /*
     * Renders a single collection entry into the DOM
     */
    class rotcellocEntryRenderer extends rotcellocBase
    {
        constructor (i18n,entry,dataSources,filters)
        {
            super(i18n);
            this.entry = entry;
            this.dataSources = dataSources;
            this.filters = filters;
            this.$domItem = null;
        }

        /*
         * Renders the collection entry, appending it to the DOM target
         * specified
         */
        renderToDOM ($parent)
        {
            if(this.$domItem)
            {
                this.$domItem.appendTo($parent);
                return;
            }
            const $target = $('<div />');
            $target.addClass('col-sm-3');
            $target.appendTo($parent);
            this.$domItem = $target;

            const entry = this.entry;

            $target.addClass('col-entry');

            this.renderCover(entry).appendTo($target);

            const $header = $('<h3 />');
            $header.text(entry.title).appendTo($target);
            if(entry.year)
            {
                $header.append(' (');
                $('<span />').addClass('special-searchable').click(() =>
                {
                    this.filters.toggleFilter('year',entry.year);
                }).text(entry.year).appendTo($header);
                $header.append(')');
            }

            this.renderSingleMetadata($target,null,entry.author,'author',true);
            this.renderSingleMetadata($target,this.translate('Seasons'),entry.seasons,'seasons');
            if(entry.origTitle && entry.origTitle !== entry.title)
            {
                this.renderSingleMetadata($target,this.translate('Original title'),entry.origTitle,'original-title');
            }
            this.renderSingleMetadata($target,this.translate('Disney classics no.'),entry.disneyClassicNo,'original-title');
            this.renderSingleMetadata($target,this.translate('Genre'),entry.genres,'genre',true);

            const $showMoreTarget = $('<div />');
            $showMoreTarget.addClass('showMore').addClass('collapse');

            const $showMore = $('<div />');
            $showMore.addClass('showMoreLink').appendTo($target);
            $showMoreTarget.appendTo($target);

            const $showMoreLink = $('<a />');
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
        renderSingleMetadata($target,label,value,cssClass, isSearchable = false, permitHTML = false)
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
            if (!Array.isArray(value))
            {
                if(isSearchable)
                {
                    value = value.split(/,\s+/);
                }
                else
                {
                    value = [ value ];
                }
            }
            const toggler = (toggleValue) =>
            {
                return () =>
                {
                    this.filters.toggleFilter(cssClass,toggleValue);
                };
            };
            for(const entryI in value)
            {
                const entry = value[entryI];
                if(entry === undefined)
                {
                    continue;
                }
                const $element = $('<span />');
                if(isSearchable)
                {
                    $element.addClass('special-searchable');
                    $element.click( toggler(entry) );
                }
                if (permitHTML)
                {
                    $element.html(entry);
                }
                else
                {
                    $element.text(entry);
                }
                if(entryI > 0)
                {
                    $entry.append(', ');
                }
                $element.appendTo($entry);
            }
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
            const $cover = $('<div />').addClass('poster');
            $('<img />').attr('src','images/'+entry.poster).addClass('img-responsive img-rounded').appendTo($cover);
            return $cover;
        }
        /*
         * Generate a cover
         */
        generateCover (entry)
        {
            const $cover = $('<div />').addClass('poster img-rounded poster-generated text-center');
            $('<h1 />').text(entry.title).appendTo($cover);
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
                $('<h4 />').text(secondaryText).appendTo($cover);
            }
            if(tietaryText !== undefined)
            {
                $('<i />').text(tietaryText).appendTo($cover);
            }
            return $cover;
        }

        /*
         * Renders the "more" component of a collections entry, this will be called
         * when the user clicks the "Show more information" link
         */
        showMore($target,$showMoreLink)
        {
            const data = this.entry;
            if(data.altTitle && data.altTitle !== data.title)
            {
                this.renderSingleMetadata($target,this.translate('Alternative title'),data.altTitle,'altTitle',false);
            }
            this.renderSingleMetadata($target,this.translate('Runtime'),data.runtime,'runtime',false);
            this.renderSingleMetadata($target,this.translate('Platform'),data.platform,'platform',true);
            this.renderSingleMetadata($target,this.translate('Developer'),data.developer,'developer',true);
            this.renderSingleMetadata($target,this.translate('Actors'),data.actors,'actors',true);
            this.renderSingleMetadata($target,this.translate('Director'),data.director,'director',true);
            this.renderSingleMetadata($target,this.translate('Writer'),data.writer,'writer',true);
            if(this.dataSources > 1)
            {
                let value = '';
                for(const source in data.bSourceList)
                {
                    const sourceN = data.bSourceList[source];
                    if(source > 0)
                    {
                        value += ', ';
                    }
                    // FIXME: We should be provided with the sourceToNameMap
                    value += window.rotcelloc.workingMeta.sourceToNameMap[sourceN];
                }
                this.renderSingleMetadata($target,this.translate('Group'),value,'group',true);
            }
            const genericEntriesOrder = [ 'language','rating', 'metascore','imdbRating','tmdbRating','isbn','format','publisher' ],
                genericEntries = {
                'rating':{
                    searchable: false,
                    'label':this.translate('Custom rating'),
                    'renderer':(val) =>
                    {
                        return val+'/6';
                    }
                },
                'metascore':{
                    searchable: false,
                    'label':this.translate('Metascore'),
                    'renderer':(val) =>
                    {
                        return val+'/100';
                    }
                },
                'tmdbRating':{
                    searchable: false,
                    'label':this.translate('TMDB rating'),
                    'renderer': (val,entryData) =>
                    {
                        return entryData.tmdbRating+'/10 ('+entryData.tmdbVotes+' '+this.translate('votes'  )+')';
                    }
                },
                'imdbRating':{
                    searchable: false,
                    'label':this.translate('IMDB rating'),
                    'renderer': (val,entryData) =>
                    {
                        return entryData.imdbRating+'/10 ('+entryData.imdbVotes+' '+this.translate('votes'  )+')';
                    }
                },
                'language':{
                    searchable: true,
                    'label':this.translate('Language'),
                },
                'publisher':{
                    searchable: true,
                    'label':this.translate('Publisher'),
                },
                'isbn':{
                    searchable: false,
                    'label':this.translate('ISBN'),
                },
                'format':{
                    searchable: true,
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
                    this.renderSingleMetadata($target,renderRules.label,value,genericEntryCurr,renderRules.searchable);
                }
            }

            this.renderSingleMetadata($target,this.translate('Links'),this.getLinks(),'links',false,true);
            this.renderSingleMetadata($target,this.translate('Note'),data.note,'note',true);
            this.renderSingleMetadata($target,this.translate('Date added'),data.addedRaw,'addedRaw',false);
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

            if(data.type === 'game')
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
            else if(data.type === 'series' || data.type === 'movies')
            {
                if(data.contentType && data.contentType === 'anime')
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
                    imdbURL = 'http://www.imdb.com/find?s=all&amp;s=tt&amp;q='+encodeURIComponent(data.origTitle ? data.origTitle : data.title)+'&amp;ttype='+ ( data.type === 'series' ? 'tv' : 'ft' );
                }
                links += '<a target="_blank" href="'+imdbURL+'">IMDB</a>';
                links += ', ';
                if(data.tmdbID)
                {
                    links += '<a target="_blank" href="https://www.themoviedb.org/'+( data.type === 'series' ? 'tv' : 'movie' )+'/'+data.tmdbID+'">TheMovieDB</a>';
                }
                else
                {
                    links += '<a target="_blank" href="https://www.themoviedb.org/search/'+( data.type === 'series' ? 'tv' : 'movie' )+'?query='+encodeURIComponent(data.origTitle ? data.origTitle : data.title)+'">TheMovieDB</a>';
                }
            }
            else if(data.type === 'books')
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
            if (data.type === 'game' || data.type === 'series' || data.type === 'movies')
            {
                let trailerSearch = data.normalizedTitle;
                if(data.year)
                {
                    trailerSearch += ' '+data.year.replace(/\D.*/g,'');
                }
                if(data.type === 'game')
                {
                    trailerSearch += ' game';
                }
                else if(data.type === 'series')
                {
                    trailerSearch += ' (tv OR series)';
                }
                else if(data.type === 'movies')
                {
                    trailerSearch += ' (movie OR theatrical OR film)';
                }
                trailerSearch += ' "trailer"';
                links += ', <a target="_blank" href="https://www.youtube.com/results?search_query='+encodeURIComponent(trailerSearch)+'">Trailer (YouTube)</a>';
            }
            return links;
        }
    }

    /*
     * Result renderer class. This handles generating a page with the
     * results of a search.
     */
    class rotcellocResultRenderer extends rotcellocBase
    {
        constructor (i18n,$target, maxEntries, dataSources, filters)
        {
            super(i18n);
            this.renderedUpTo = -1;
            this.result = null;
            this.maxEntries = maxEntries;
            this.dataSources = dataSources;
            this.filters = filters;
            this.$target = $target;
            this.renderedEntries = {};
        }

        /*
         * Sets up a new result set and performs initial rendering of it
         */
        setResults (result)
        {
            if(result === undefined)
            {
                result = [];
            }
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
            this.mustHaveResult('renderSubset');

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

                this.renderedUpTo = entryNo;

                let renderer = this.renderedEntries[ entry.id ];
                if (renderer === undefined)
                {
                    renderer = new rotcellocEntryRenderer(this.i18n,entry,this.dataSources,this.filters);
                    this.renderedEntries[ entry.id ] = renderer;
                }
                renderer.renderToDOM($currentRow);

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
            if (!this.$cache)
            {
                this.$cache = $('<div />').hide().appendTo('body');
            }
            else
            {
                this.$target.children().appendTo(this.$cache);
            }
            this.$target.empty();
        }

        /*
         * This is a wrapper that throws an error if we don't have this.result
         * (which translates to some action being performed on us before
         * .setResults has been called)
         */
        mustHaveResult (name)
        {
            if (this.result === undefined)
            {
                throw('Attempt to use rotcellocEntryRenderer.'+name+' without having called setResults');
            }
        }
    }

    /*
     * Search filters renderer
     */
    class rotcellocFiltersListRenderer extends rotcellocBase
    {

        constructor(i18n, workingMeta, workingConfig, onSearch)
        {
            super(i18n);
            this.workingMeta = workingMeta;
            this.workingConfig = workingConfig;
            this.onSearch = onSearch;
            this.additionalFilters = 0;
        }


        /*
         * Renders the filter list and calls all required event initializers
         */
        render ()
        {
            this.renderOrderButtons();
            this.renderGroupButtons();
            this.renderFormatButtons();
            this.renderGenreButtons();
            this.renderPlatformButtons();
            this.renderBoolButtons();
            this.finalizeRendering();
            this.eventsSetup();
        }

        /*
         * Retrieves the state of the current filters (aka. the user's current
         * search parameters)
         */
        getSearch ()
        {
            const query           = {},
                $group          = $('#group .active input'),
                $platform        = $('#platform .active input'),
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
            if($platform && $platform.length)
            {
                const platforms = new Set();
                $platform.each(function ()
                {
                    const platform = $(this).attr('data-value');
                    platforms.add(platform);
                    if(platform === 'PC')
                    {
                        platforms.add('Windows').add('Mac').add('Linux');
                    }
                    else if(platform === 'Windows')
                    {
                        platforms.add('PC');
                    }
                });
                query.platform = [...platforms];
            }
            if(groupDisneySort && groupDisneySort === 'true')
            {
                query.disneySort = true;
            }
            if(text)
            {
                query.rawText = text;
                query.text = text.toLowerCase();
            }
            if(order)
            {
                query.order = order;
            }
            if($plotSearch && $plotSearch.attr('data-value') === 'true')
            {
                query.plotSearch = true;
            }
            if($watchedSearch && $watchedSearch.attr('data-value') === 'true')
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
            return query;
        }

        /*
         * Finalizes the filtering UI. This removes the 'Show filters' button if we only have a
         * single filter
         */
        finalizeRendering ()
        {
            const $moreFiltersButton = $('#moreFiltersButton');
            if(this.additionalFilters === 1)
            {
                const $additional = $('#moreFilters');
                $moreFiltersButton.remove();
                $additional.find('.well').removeClass('well');
                $additional.removeClass('collapse');
            }
            else
            {
                $('#moreFiltersButton').removeClass('hidden');
            }
        }

        /*
         * This sets up our event handlers
         */
        eventsSetup()
        {
            const self = this;
            $('#searchForm').on('change','input,select',this.onSearch);
            $('#searchForm').on('keyup','#searchBox',function ()
            {
                if($(this).val().length > 2 || $(this).val().length === 0)
                {
                    self.onSearch();
                }
            });
        }

        /*
         * A helper method that can be called by other classes. It will toggle
         * the parameter 'value' for the filter 'filterName' if it exists. If
         * filterName is not a known filter it will add a fulltext search for
         * 'value'
         */
        toggleFilter(filterName,value)
        {
            const $filter = $('#searchForm').find('#'+filterName);
            if (!$filter || !$filter.length)
            {
                value = value.replace(/\s*\([^\)]+\)/,'');
                $('#searchBox').val(value).trigger('keyup');
            }
            else
            {
                let found = false;
                $filter.find('input').each(function ()
                {
                    const $this = $(this);
                    if ($this.attr('data-value') === value || $this.attr('data-name') === value)
                    {
                        $this.click();
                        found = true;
                        return false;
                    }
                });
                if($('#moreFilters').length && !$('#moreFilters').is(':visible'))
                {
                    $('#moreFiltersButton').click();
                }
                if (!found)
                {
                    warn('toggleFilter('+filterName+','+value+'): did not find "'+value+'" of type "'+filterName+'"');
                }
            }
        }

        /*
         * Adds a single filter to the DOM
         */
        addAdditionalFilter ($content)
        {
            this.initializeAdditionalFilter();

            this.additionalFilters++;

            const $wrapper = $('<div />');
            const $colWrapper = $('<div />');
            $wrapper.addClass('row').appendTo(this.$additionalRoot);
            $colWrapper.addClass('col-sm-12').addClass('row-padding').appendTo($wrapper);
            $content.appendTo($colWrapper);
        }

        /*
         * Initializes the "additional filters" area
         */
        initializeAdditionalFilter ()
        {
            if(this.$additionalRoot === undefined)
            {
                const moreF = $('<div />').addClass('btn-group col-sm-2').attr('data-toggle','buttons-checkbox');
                $('<a />').addClass('btn btn-primary collapse-data-btn hidden')
                    .attr('id','moreFiltersButton')
                    .attr('data-toggle','collapse')
                    .attr('href','#moreFilters')
                    .text(this.translate('Show filter'))
                    .appendTo(moreF);
                this.addAlwaysVisible(moreF, true);

                const $collapse = $('<div />');
                $collapse.addClass('collapse').attr('id','moreFilters').appendTo('#searchForm');
                this.$additionalRoot = $('<div />');
                this.$additionalRoot.addClass('well').appendTo($collapse);
            }
        }

        /*
         * Adds a filter that is always visible
         */
        addAlwaysVisible ($content, prepend = false)
        {
            this.initializeAlwaysVisible();

            if(prepend)
            {
                $content.prependTo(this.$rootVisible);
            }
            else
            {
                $content.appendTo(this.$rootVisible);
            }
        }

        /*
         * Initializes the filters area that is always visible
         */
        initializeAlwaysVisible ()
        {
            if(this.$rootVisible === undefined)
            {
                this.$rootVisible = $('<div />');
                this.$rootVisible.addClass('row').appendTo('#searchForm');
            }
        }

        /*
         * Renders the order dropdown
         */
        renderOrderButtons ()
        {
            const orderButtons = {
                id: 'order',
                buttons: [
                    {
                        id: 'order_none',
                        value: '',
                        active: this.workingConfig.defaultSort !== 'year',
                        name: this.translate('Automatic'),
                        renderWhen: true, // always
                    },
                    {
                        id: 'sortableAuthor',
                        value: 'sortableAuthor',
                        name: this.translate('Author'),
                        active: this.workingConfig.defaultSort === 'sortableAuthor',
                        renderWhen: this.workingMeta.type === 'books'
                    },
                    {
                        id: 'order_alpha',
                        value: 'alpha',
                        name: this.translate('Alphabetic'),
                        renderWhen: this.workingMeta.hasDisneySort
                    },
                    {
                        id: 'order_year',
                        value: 'sortYear',
                        name: this.translate('Year'),
                        active: this.workingConfig.defaultSort === 'year',
                        renderWhen: this.workingMeta.fields.year
                    },
                    {
                        id: 'order_added',
                        value: 'added',
                        name: this.translate('Date added'),
                        active: this.workingConfig.defaultSort === 'added',
                        renderWhen: this.workingMeta.fields.added,
                    },
                    {
                        id: 'order_rand',
                        value: 'random',
                        name: this.translate('Random'),
                        renderWhen: (this.workingMeta.type === 'movies' || this.workingMeta.type === 'series')
                    },
                    {
                        id: 'runtime',
                        value: 'runtimeMin',
                        name: this.translate('Length'),
                        renderWhen: (this.workingMeta.type === 'movies' || this.workingMeta.type === 'series')
                    },
                    {
                        id: 'order_normalRating',
                        value: 'normalizedRating',
                        name: this.translate('Rating (smart)'),
                        renderWhen: this.workingMeta.enableNormalized,
                    },
                    {
                        id: 'order_rating',
                        value: 'rating',
                        name: this.translate('Custom rating'),
                        renderWhen: this.workingMeta.fields.rating,
                    },
                    {
                        id: 'order_meta',
                        value: 'metascore',
                        name: this.translate('Metascore'),
                        renderWhen: this.workingMeta.fields.metascore
                    },
                    {
                        id: 'order_imdb',
                        value: 'imdbRating',
                        name: this.translate('IMDB rating'),
                        renderWhen: (this.workingMeta.type === 'movies' || this.workingMeta.type === 'series')
                    }
                ]
            };
            // FIXME: We should handle this in some declarative manner inside
            // the definition for order_none
            if(!this.workingMeta.hasDisneySort)
            {
                orderButtons.buttons[0].name = this.translate('Alphabetic');
            }
            // FIXME: Should modify the DOM
            this.addAlwaysVisible($('<div class="col-sm-10 form-inline row-padding text-right"><div class="input-group"><div class="input-group-addon">'+this.translate('Order')+'</div>'+this.renderSelectElement(orderButtons,true)+'</div><input type="text" class="form-control pull-right" placeholder="'+this.translate('Search')+'" id="searchBox" /></div>'));
            return orderButtons;
        }

        /*
         * Renders filters for "group"
         */
        renderGroupButtons ()
        {
            if(this.workingConfig.sources.length <= 1)
            {
                return;
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
            for (const groupI in this.workingConfig.sources)
            {
                const group = this.workingConfig.sources[groupI];
                groupButtons.buttons.push({
                        id: 'groups_'+groupI,
                        value: group.bSource ,
                        disneySort: group.disneySort,
                        name: group.name
                });
            }
            this.addAdditionalFilter($('<div class="searchbar-label">'+this.translate('Group')+':</div>'+this.renderRadioOrCheckButtons(groupButtons)));
        }

        /*
         * Renders various boolean options (ie. "Search in plot descriptions")
         */
        renderBoolButtons ()
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
            };
            if(this.workingMeta.fields.watched || this.workingMeta.fields.plot)
            {
                let html = '';
                if(this.workingMeta.fields.plot)
                {
                    html += '<div class="searchbar-label-inline">'+this.translate('Search in plot descriptions')+'</div>'+this.renderRadioOrCheckButtons(plotSearchBool);
                }
                if(this.workingMeta.fields.watched === true)
                {
                    html += '<div class="searchbar-additional searchbar-label-inline">'+this.translate('Only display unwatched titles')+'</div>'+this.renderRadioOrCheckButtons(watchedSearchBool);
                }
                // FIXME: Should modify the DOM instead of rendering a string
                this.addAdditionalFilter($(html));
            }
        }

        /*
         * Renders platform filter buttons
         */
        renderPlatformButtons ()
        {
            const platformButtons = {
                id: 'platform',
                type: 'checkbox',
                buttons: []
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
            if(platformButtons.buttons.length > 2)
            {
                // FIXME: Should modify the DOM instead of rendering a string
                this.addAdditionalFilter($('<div class="searchbar-label">'+this.translate('Platform')+':</div>'+this.renderRadioOrCheckButtons(platformButtons)));
            }
        }

        /*
         * Renders genre filter buttons
         */
        renderGenreButtons ()
        {
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

                this.addAdditionalFilter($('<div class="searchbar-label genre-select-line form-inline">'+this.renderSelectElement(genreType)+':</div>'+this.renderRadioOrCheckButtons(genreButtons)));
            }
        }

        /*
         * Renders format filter buttons
         */
        renderFormatButtons ()
        {
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
            if(formatButtons.buttons.length > 1)
            {
                this.addAdditionalFilter( $( '<div class="searchbar-label">'+this.translate('Format')+':</div>'+this.renderRadioOrCheckButtons(formatButtons) ) );
            }
        }

        /*
         * Renders a single "select"
         */
        renderSelectElement(data, requireEnabled = false)
        {
            // FIXME: Should generate DOM elements instead of a HTML string
            let html = '<select class="form-control" id="'+data.id+'">';
            for(let buttonI = 0; buttonI < data.buttons.length; buttonI++)
            {
                const button = data.buttons[buttonI];
                if((requireEnabled && button.renderWhen) || (requireEnabled === false))
                {
                    html += '<option data-value="'+button.value+'"'+(button.active ? ' selected' : '' )+'>'+button.name+'</option>';
                }
            }
            html += '</select>';
            return html;
        }
        /*
         * Renders a single set of radio or check-style buttons
         */
        renderRadioOrCheckButtons(data)
        {
            // FIXME: Should generate DOM elements instead of a HTML string
            let html = '',
            type = 'radio';
            if(data.type === 'checkbox')
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
                html += '<input type="'+type+'" name="options" id="'+button.id+'" autocomplete="off" data-name="'+button.name+'" data-value="'+button.value+'"';
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
    }

    /*
     * Our actual search engine
     */
    class rotcellocSearcher
    {
        constructor (workingData)
        {
            this.prevQuery      = null;
            this.workingData    = workingData;
        }

        /*
         * Performs a search. Expects an object as returned from
         * rotcellocFiltersListRenderer.getSearch().
         *
         * This returns an array of results, or undefined if this search query
         * is identical to the previous search query.
         */
        search(query)
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
            const types = [ 'group', 'watchedSearch','formats','genres','text','platform' ];
            for(let collectionN = 0; collectionN < this.workingData.length; collectionN++)
            {
                const collectionEntry = this.workingData[collectionN];
                const resultMeta = { score: 0 };
                let hit = true;
                for(let typeN = 0; typeN < types.length; typeN++)
                {
                    const type = types[typeN];
                    if(this.trySearch(collectionEntry,type,query,resultMeta) === false)
                    {
                        hit = false;
                        break;
                    }
                }
                if (!hit)
                {
                    continue;
                }
                // FIXME
                collectionEntry.searchScore = resultMeta.score;
                results.push(collectionEntry);
            }
            results = this.sortResults(results,query.order,query);
            return results;
        }

        /*
         * This is a wrapper function that handles calling all of the
         * individual query* methods and handles checking if we need to perform
         * said query, bumps the score if needed etc.
         */
        trySearch(collectionEntry,type,rawQuery,resultMeta)
        {
            const query = rawQuery[type];
            if(query === undefined)
            {
                return true;
            }
            let result = { hit: false };
            if(type === 'group')
            {
                result = this.queryGroup(collectionEntry,query,rawQuery);
            }
            else if(type === 'watchedSearch')
            {
                result = this.queryWatched(collectionEntry,query,rawQuery);
            }
            else if (type === 'formats')
            {
                result = this.queryFormats(collectionEntry,query,rawQuery);
            }
            else if(type === 'platform')
            {
                result = this.queryPlatform(collectionEntry,query,rawQuery);
            }
            else if(type === 'genres')
            {
                result = this.queryGenres(collectionEntry,query,rawQuery);
            }
            else if(type === 'text')
            {
                result = this.queryText(collectionEntry,query,rawQuery);
            }
            else
            {
                warn('Unhandled search type: '+type);
            }
            if(result.hit === true)
            {
                if(result.scoreMod !== undefined)
                {
                    resultMeta.score += result.scoreMod;
                }
                return true;
            }
            return false;
        }

        /*
         * Performs sorting of the search results
         */
        sortResults(results,order,rawQuery)
        {
            let sorted = false;
            if(order)
            {
                const orderByOptionalField = function (optField,orderType)
                {
                    return function (a,b)
                    {
                        if(a[optField] && b[optField] && a[optField] !== b[optField])
                        {
                            if(orderType === 'text')
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
                if(order === 'alpha')
                {
                    sorted = true;
                    results.sort((a,b) =>
                    {
                            return a.title.localeCompare(b.title,'no-nn');
                    });
                }
                else if(order === 'random')
                {
                    sorted  = true;
                    results = _.shuffle(results);
                }
                else if(order === 'rating' || order === 'imdbRating' || order === 'metascore' || order === 'runtimeMin' || order === 'sortYear' || order === 'normalizedRating' || order === 'added')
                {
                    sorted = true;
                    results.sort( orderByOptionalField(order,'numeric') );
                }
                else if (order === 'sortableAuthor')
                {
                    sorted = true;
                    results.sort( orderByOptionalField(order,'text') );
                }
                else
                {
                    warn('Skipping sorting by unknown method: '+order);
                }
            }
            if(sorted === false)
            {
                results.sort((a,b) =>
                {
                        if(a.searchScore !== b.searchScore)
                        {
                            return b.searchScore - a.searchScore;
                        }
                        if(rawQuery.disneySort)
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
            return results;
        }

        /*
         * Custom queries. These are not available in the interface itself, but
         * can be used to debug issues with a collection from the developer
         * console in the browser
         */
        queryCustom(collectionEntry,custom)
        {
            const ret = { hit: false };
            if(custom.type === 'substr')
            {
                if (collectionEntry[custom.field].indexOf(custom.text) !== -1)
                {
                    ret.hit = true;
                }
            }
            else if(custom.type === 'not-defined')
            {
                if (collectionEntry[custom.field] === undefined)
                {
                    ret.hit = true;
                }
            }
            else if(custom.type === 'defined')
            {
                if (collectionEntry[custom.field] !== undefined)
                {
                    ret.hit = true;
                }
            }
            return ret;
        }

        scoreTextMatch(inString, searchTextLower, searchText, baseMod)
        {
            let debug = false;
            if(inString == 'Super' || inString == 'Surf\'s up')
            {
                debug = true;
            }
            let scoreMod = baseMod;
            // First, see if casing matches, if it does, grant 2 bonus points
            if (inString.indexOf(searchText) !== -1)
            {
                scoreMod += 2;
            }
            /*
             * Next, split both strings by non-words, and then check to see if
             * there are full string matches, or "start of string" matches
             * in each of the arrays, and grant points accordingly.
             * This is done case insensitively.
             */
            let splitInString = inString.toLowerCase().split(/\W+/);
            let splitSearchText = searchTextLower.split(/\W+/);
            for(const textEntry of splitSearchText)
            {
                for(const stringEntry of splitInString)
                {
                    if(stringEntry == textEntry)
                    {
                        scoreMod += 3;
                    }
                    else if (stringEntry.indexOf(textEntry) === 0)
                    {
                        scoreMod += 2;
                    }
                }
            }
            // Finally, apply a tiny penalty depending on the length of
            // the inString
            scoreMod -= inString.length/100;

            return scoreMod;
        }

        /*
         * Performs free-text searches
         */
        queryText(collectionEntry,text,rawQuery)
        {
            const ret = { hit: false, scoreMod: 0};
            if(collectionEntry.title.toLowerCase().indexOf(text) !== -1)
            {
                ret.hit = true;
                ret.scoreMod = this.scoreTextMatch(collectionEntry.title,text,rawQuery.rawText,9);
            }
            else if (collectionEntry.origTitle && collectionEntry.origTitle.toLowerCase().indexOf(text) !== -1)
            {
                ret.hit = true;
                ret.scoreMod = this.scoreTextMatch(collectionEntry.origTitle,text,rawQuery.rawText,9);
            }
            else if (collectionEntry.altTitle && collectionEntry.altTitle.toLowerCase().indexOf(text) !== -1)
            {
                ret.hit = true;
                ret.scoreMod = this.scoreTextMatch(collectionEntry.altTitle,text,rawQuery.rawText,9);
            }
            else if(collectionEntry.actors && collectionEntry.actors.toLowerCase().indexOf(text) !== -1)
            {
                ret.hit         = true;
                ret.scoreMod = this.scoreTextMatch(collectionEntry.actors,text,rawQuery.rawText,8);
            }
            else if(collectionEntry.writer && collectionEntry.writer.toLowerCase().indexOf(text) !== -1)
            {
                ret.hit         = true;
                ret.scoreMod = this.scoreTextMatch(collectionEntry.writer,text,rawQuery.rawText,8);
            }
            else if(collectionEntry.author && collectionEntry.author.toLowerCase().indexOf(text) !== -1)
            {
                ret.hit         = true;
                ret.scoreMod = this.scoreTextMatch(collectionEntry.author,text,rawQuery.rawText,8);
            }
            else if(collectionEntry.director && collectionEntry.director.toLowerCase().indexOf(text) !== -1)
            {
                ret.hit         = true;
                ret.scoreMod = this.scoreTextMatch(collectionEntry.director,text,rawQuery.rawText,8);
            }
            else if(collectionEntry.developer && collectionEntry.developer.toLowerCase().indexOf(text) !== -1)
            {
                ret.hit         = true;
                ret.scoreMod = this.scoreTextMatch(collectionEntry.developer,text,rawQuery.rawText,8);
            }
            else if(collectionEntry.genre && collectionEntry.genre.toLowerCase().indexOf(text) !== -1)
            {
                ret.hit         = true;
                ret.scoreMod = this.scoreTextMatch(collectionEntry.genre,text,rawQuery.rawText,7);
            }
            else if(collectionEntry.year && collectionEntry.year === text)
            {
                ret.hit         = true;
                ret.scoreMod = 5;
            }
            else if(collectionEntry.bSource.toLowerCase().indexOf(text) !== -1)
            {
                ret.hit         = true;
                ret.scoreMod = 3;
            }
            else if (rawQuery.plotSearch && collectionEntry.plot && collectionEntry.plot.toLowerCase().indexOf(text) !== -1)
            {
                ret.hit         = true;
                ret.scoreMod = 2;
            }
            else if(collectionEntry.note && collectionEntry.note.toLowerCase().indexOf(text) !== -1)
            {
                ret.hit = true;
            }
            else if(collectionEntry.language && collectionEntry.language.toLowerCase().indexOf(text) !== -1)
            {
                ret.hit = true;
            }
            else if(collectionEntry.publisher && collectionEntry.publisher.toLowerCase().indexOf(text) !== -1)
            {
                ret.hit = true;
            }
            return ret;
        }

        /*
         * Queries for matches in the format list
         */
        queryFormats(collectionEntry,formats)
        {
            const ret = { hit: true};
            if (!collectionEntry.format)
            {
                ret.hit = false;
            }
            else
            {
                ret.hit = this.inArrays(formats,collectionEntry.format);
            }
            return ret;
        }

        /*
         * Queries for matches in genres
         */
        queryGenres(collectionEntry,query,rawQuery)
        {
            const ret = { hit: true};
            if(rawQuery.genreSearchType === 'all' || rawQuery.genreSearchType === 'any')
            {
                if (!collectionEntry.genre)
                {
                    ret.hit = false;
                    return ret;
                }
                if(rawQuery.genreSearchType === 'any')
                {
                    ret.hit = this.inArrays(rawQuery.genres,collectionEntry.genres);
                }
                else
                {
                    for (const genreI in rawQuery.genres)
                    {
                        if(!this.inArray(collectionEntry.genres, rawQuery.genres[genreI]))
                        {
                            ret.hit = false;
                            continue;
                        }
                    }
                }
            }
            else if(rawQuery.genreSearchType === 'notin')
            {
                ret.hit = true;
                if(collectionEntry.genre)
                {
                    ret.hit = !(this.inArrays(rawQuery.genres,collectionEntry.genres));
                }
            }
            return ret;
        }

        /*
         * Queries for matches in platfrom
         */
        queryPlatform(collectionEntry,query,rawQuery)
        {
            return {
                hit: this.arrayInString(rawQuery.platform,collectionEntry.platform)
            };
        }

        /*
         * Checks for "watched" status
         */
        queryWatched(collectionEntry)
        {
            const ret = { hit: true};
            if (collectionEntry.watched === undefined || collectionEntry.watched === true)
            {
                ret.hit = false;
            }
            return ret;
        }

        /*
         * Queries for matches in "groups"
         */
        queryGroup(collectionEntry,group)
        {
            return {
                hit: this.inArray(collectionEntry.bSourceList,group)
            };
        }

        /*
         * Checks if value exists in the array arr
         */
        inArray(arr,value)
        {
            for(const entryI in arr)
            {
                if(arr[entryI] === value)
                {
                    return true;
                }
            }
            return false;
        }

        /*
         * Checks if any of the values in arr1 exists in arr2
         */
        inArrays(arr1, arr2)
        {
            for(const entryI in arr1)
            {
                if(this.inArray(arr2,arr1[entryI]))
                {
                    return true;
                }
            }
            return false;
        }

        /*
         * Checks if any of the elements in arr exists as a substring of str
         */
        arrayInString(arr,str)
        {
            for(const entryI in arr)
            {
                if(str.indexOf(arr[entryI]) !== -1)
                {
                    return true;
                }
            }
            return false;
        }
    }

    /*
     * This is our base class, it handles data retrieval, search, rendering
     * etc., calling *Renderer classes as needed
     */
    class rotcelloc extends rotcellocBase
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
            // We call super with an empty object because we don't yet have the i18n data.
            // We set it ourselves once we have it.
            super({});

            this.getDataSet(data =>
                {
                    this.i18n = data.i18n;

                    $('#menuToggle').text(this.translate('Show/hide menu'));
                    if (/(Android|Mobile|iOS|iPhone)/.test(navigator.userAgent))
                    {
                        this.maxEntriesPerRenderedPage = data.config.maxEntriesPerRenderedPageMobile;
                        this.mobile = true;

                         $('<span />').addClass('scroll-to-top').append(
                             $('<a />').addClass('well well-sm').append(
                                 $('<i />').addClass('glyphicon glyphicon-chevron-up')
                             ).click( (ev) =>
                             {
                                 ev.preventDefault();
                                 $('html,body').animate({scrollTop:0},'fast');
                             })
                         ).appendTo('body').affix({offset: {top: 200} });
                    }
                    else
                    {
                        this.maxEntriesPerRenderedPage = data.config.maxEntriesPerRenderedPage;
                        this.mobile = false;
                    }
                    this.searcher = new rotcellocSearcher(this.workingData);
                    const filtersList = new rotcellocFiltersListRenderer(this.i18n,this.workingMeta,this.workingConfig, () =>
                    {
                        const query = filtersList.getSearch();
                        this.performSearch(query);
                    });
                    this.renderer = new rotcellocResultRenderer(
                        this.i18n,
                        $('#collResultTarget'),
                        this.maxEntriesPerRenderedPage,
                        this.data.config.collections[this.pagetype].sources.length,
                        filtersList
                    );
                    filtersList.render();
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

            $('#rotcelloc-starting').hide();
            $('#rotcelloc-loading').show();
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
         * Searches our dataset, handling many different fields and scoring hits
         * appropriately
         */
        performSearch(query)
        {
            const result = this.searcher.search(query);
            // search() returns undefined if the query is unchanged from the
            // last query. In which case we don't bother re-rendering the
            // results as they are identical to the currently displayed
            // results.
            if(result !== undefined)
            {
                this.renderResults(result);
            }
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
