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
        constructor (i18n,entry,dataSources)
        {
            super(i18n);
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
            if(entry.origTitle && entry.origTitle !== entry.title)
            {
                this.renderSingleMetadata($target,this.translate('Original title'),entry.origTitle,'original-title');
            }
            this.renderSingleMetadata($target,this.translate('Disney classics no.'),entry.disneyClassicNo,'original-title');
            this.renderSingleMetadata($target,this.translate('Genre'),entry.genre,'genre');

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
            if(data.altTitle && data.altTitle !== data.title)
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
                for(let source = 0; source < data.bSourceList.length; source++)
                {
                    const sourceN = data.bSourceList[source];
                    if(source > 0)
                    {
                        value += ', ';
                    }
                    // FIXME: We should be provided with the sourceToNameMap
                    value += window.rotcelloc.workingMeta.sourceToNameMap[sourceN];
                }
                this.renderSingleMetadata($target,this.translate('Group'),value,'group');
            }
            const genericEntriesOrder = [ 'language','rating', 'metascore','imdbRating','isbn','format','publisher' ],
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
                'language':{
                    'label':this.translate('Language'),
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
                links += '<a target="_blank" href="https://www.themoviedb.org/search/'+( data.type === 'series' ? 'tv' : 'movie' )+'?query='+encodeURIComponent(data.origTitle ? data.origTitle : data.title)+'">TheMovieDB</a>';
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
        constructor (i18n,$target, maxEntries, dataSources)
        {
            super(i18n);
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
                const $entryTarget = $('<div />');
                $entryTarget.addClass('col-sm-3');
                $entryTarget.appendTo($currentRow);

                this.renderedUpTo = entryNo;

                const renderer = new rotcellocEntryRenderer(this.i18n,entry);
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
                let platforms = new Set();
                $platform.each(function ()
                {
                    const platform = $(this).attr('data-value');
                    platforms.add(platform);
                    if(platform == 'PC')
                    {
                        platforms.add('Windows').add('Mac').add('Linux');
                    }
                    else if(platform == 'Windows')
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

        initializeAdditionalFilter ()
        {
            if(this.$additionalRoot === undefined)
            {
                // FIXME
                const moreF = $('<div class="btn-group col-sm-2" data-toggle="buttons-checkbox"><a class="btn btn-primary collapse-data-btn hidden" id="moreFiltersButton" data-toggle="collapse" href="#moreFilters">'+this.translate('Show filter')+'</a></div>');
                this.addAlwaysVisible(moreF, true);

                const $collapse = $('<div />');
                $collapse.addClass('collapse').attr('id','moreFilters').appendTo('#searchForm');
                this.$additionalRoot = $('<div />');
                this.$additionalRoot.addClass('well').appendTo($collapse);
            }
        }

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

        initializeAlwaysVisible ()
        {
            if(this.$rootVisible === undefined)
            {
                this.$rootVisible = $('<div />');
                this.$rootVisible.addClass('row').appendTo('#searchForm');
            }
        }

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
            this.addAlwaysVisible($('<div class="col-sm-10 form-inline row-padding text-right"><div class="input-group"><div class="input-group-addon">'+this.translate('Order')+'</div>'+this.renderSelectElement(orderButtons,true)+'</div><input type="text" class="form-control pull-right" placeholder="'+this.translate('Search')+'" id="searchBox" /></div>'));
            return orderButtons;
        }

        renderGroupButtons ()
        {
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
                this.addAdditionalFilter($(html));
            }
        }

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
                this.addAdditionalFilter($('<div class="searchbar-label">'+this.translate('Platform')+':</div>'+this.renderRadioOrCheckButtons(platformButtons)));
            }
        }

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
            const results = [];
            if(_.isEqual(query,this.prevQuery))
            {
                return;
            }
            else
            {
                this.prevQuery = query;
            }
            const types = [ 'group', 'watchedSearch','formats','format','genres','text','platform' ];
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
            this.sortResults(results,query.order,query);
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
            else if(type === 'format')
            {
                result = this.queryFormat(collectionEntry,query,rawQuery);
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

        /*
         * Performs free-text searches
         */
        queryText(collectionEntry,text,rawQuery)
        {
            const ret = { hit: false, scoreMod: 0};
            if(collectionEntry.title.toLowerCase().indexOf(text) !== -1)
            {
                ret.hit = true;
            }
            else if (collectionEntry.origTitle && collectionEntry.origTitle.toLowerCase().indexOf(text) !== -1)
            {
                ret.hit = true;
            }
            else if (collectionEntry.altTitle && collectionEntry.altTitle.toLowerCase().indexOf(text) !== -1)
            {
                ret.hit = true;
            }
            else if(collectionEntry.note && collectionEntry.note.toLowerCase().indexOf(text) !== -1)
            {
                ret.hit = true;
            }
            else if(collectionEntry.actors && collectionEntry.actors.toLowerCase().indexOf(text) !== -1)
            {
                ret.hit         = true;
                ret.scoreMod = 8;
            }
            else if(collectionEntry.writer && collectionEntry.writer.toLowerCase().indexOf(text) !== -1)
            {
                ret.hit         = true;
                ret.scoreMod = 8;
            }
            else if(collectionEntry.director && collectionEntry.director.toLowerCase().indexOf(text) !== -1)
            {
                ret.hit         = true;
                ret.scoreMod = 8;
            }
            else if(collectionEntry.developer && collectionEntry.developer.toLowerCase().indexOf(text) !== -1)
            {
                ret.hit         = true;
                ret.scoreMod = 8;
            }
            else if(collectionEntry.genre && collectionEntry.genre.toLowerCase().indexOf(text) !== -1)
            {
                ret.hit         = true;
                ret.scoreMod = 7;
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
                for (const formatI in formats)
                {
                    const queryFormat = formats[formatI];
                    let found = false;
                    for(let format = 0; format < collectionEntry.format.length; format++)
                    {
                        if(collectionEntry.format[format] === queryFormat)
                        {
                            found = true;
                            break;
                        }
                    }
                    if (!found)
                    {
                        ret.hit = false;
                    }
                }
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
                    ret.hit = false;
                    for (const genreAI in rawQuery.genres)
                    {
                        if(collectionEntry.genre.indexOf(rawQuery.genres[genreAI]) !== -1)
                        {
                            ret.hit = true;
                            continue;
                        }
                    }
                }
                else
                {
                    for (const genreI in rawQuery.genres)
                    {
                        if(collectionEntry.genre.indexOf(rawQuery.genres[genreI]) === -1)
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
                    for (const genreNI in rawQuery.genres)
                    {
                        if(collectionEntry.genre.indexOf(rawQuery.genres[genreNI]) !== -1)
                        {
                            ret.hit = false;
                            continue;
                        }
                    }
                }
            }
            return ret;
        }

        /*
         * Queries for matches in platfrom
         */
        queryPlatform(collectionEntry,query,rawQuery)
        {
            const ret = { hit: false};
            for (const queryPlatformI in rawQuery.platform)
            {
                const queryPlatform = rawQuery.platform[queryPlatformI];
                for(const platformI in collectionEntry.platform)
                {
                    if(collectionEntry.platform.indexOf(queryPlatform) !== -1)
                    {
                        ret.hit = true;
                        break;
                    }
                }
            }
            return ret;
        }

        queryFormat(collectionEntry,format)
        {
            const ret = { hit: false};
            if(collectionEntry.format)
            {
                for(let fmt = 0; fmt < collectionEntry.format.length; fmt++)
                {
                    if(collectionEntry.format[fmt] === format)
                    {
                        ret.hit = true;
                    }
                }
            }
            return ret;
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
            const ret = { hit: false };
            for(let keyN = 0; keyN < collectionEntry.bSourceList.length; keyN++)
            {
                if(collectionEntry.bSourceList[keyN] === group)
                {
                    ret.hit = true;
                }
            }
            return ret;
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
                    }
                    else
                    {
                        this.maxEntriesPerRenderedPage = data.config.maxEntriesPerRenderedPage;
                        this.mobile = false;
                    }
                    this.searcher = new rotcellocSearcher(this.workingData);
                    this.renderer = new rotcellocResultRenderer(
                        this.i18n,
                        $('#collResultTarget'),
                        this.maxEntriesPerRenderedPage,
                        this.data.config.collections[this.pagetype].sources.length
                    );
                    const search = new rotcellocFiltersListRenderer(this.i18n,this.workingMeta,this.workingConfig, () =>
                    {
                        const query = search.getSearch();
                        this.performSearch(query);
                    });
                    search.render();
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
