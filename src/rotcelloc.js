/* vim: set foldnestmax=3 : */
/*
 * rotcelloc client-side component
 *
 * Part of rotcelloc - the hacker's movie, tv-series and game collection
 * manager
 *
 * Copyright (C) Eskild Hustvedt 2015
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
(function ($){
    "use strict";
    var BOT_LOAD_TRIGGER_PX = 1000,
        rotcelloc = {
        /*
         * Initializes the page:
         * - Sets up object variables
         * - Loads data
         * - Performs initial render
         * - Sets up event handlers
         */
        init: function()
        {
            rotcelloc.currentResults = [];
            rotcelloc.prevQuery      = null;
            rotcelloc.getDataSet(function (data)
            {
                $('#menuToggle').text(rotcelloc.translate('Show/hide menu'));
                if (/(Android|Mobile|iOS|iPhone)/.test(navigator.userAgent))
                {
                    rotcelloc.maxMoviesPerRenderedPage = data.config.maxMoviesPerRenderedPageMobile;
                    rotcelloc.mobile = true;
                }
                else
                {
                    rotcelloc.maxMoviesPerRenderedPage = data.config.maxMoviesPerRenderedPage;
                    rotcelloc.mobile = false;
                }
                rotcelloc.renderSearchPanel();
                rotcelloc.initAutoSearcher();
                rotcelloc.renderResults(rotcelloc.workingData);
                if (!rotcelloc.mobile)
                {
                    $('#searchBox').focus();
                }

                $(window).scroll(function(){
                        if (rotcelloc.currentResults.length && $(window).scrollTop() + $(window).height() >= $(document).height() - BOT_LOAD_TRIGGER_PX)
                        {
                            rotcelloc.showNextResults();
                        }
                });
                $('body').removeClass('loading');
            });
        },
        /*
         * Initializes the auto-search event listeners
         */
        initAutoSearcher: function ()
        {
            var runSearch = function ()
            {
                rotcelloc.performSearchFromHTML();
            };
            $('#searchForm').on('change','input,select',runSearch);
            $('#searchForm').on('keyup','#searchBox',function ()
            {
                if($(this).val().length > 2 || $(this).val().length === 0)
                {
                    runSearch();
                }
            });
        },
        /*
         * Downloads and prepares the dataset for the collection on the current page
         */
        getDataSet: function(cb)
        {
            var pagetype = $('#collResultTarget').data('pagetype');
            if(pagetype === undefined)
            {
                return;
            }
            $.getJSON(pagetype.toLowerCase().replace(/\s+/g,'_')+'.dataset.json',function (data)
            {
                    rotcelloc.data    = data;
                    rotcelloc.pagetype    = pagetype;
                    rotcelloc.workingData = data.data;
                    rotcelloc.workingMeta = data.meta;
                    rotcelloc.workingConfig = rotcelloc.data.config.collections[pagetype];
                    if(rotcelloc.data.dVer !== 0)
                    {
                        $('#collResultTarget').text('ERROR: Dataset is of an unsupported version: '+rotcelloc.data.dVer);
                    }
                    else
                    {
                        cb(data);
                    }
            });
        },
        /*
         * Renders a result set
         */
        renderResults: function(result)
        {
            var cols             = 0,
                htmlContent      = [],
                out              = '',
                entriesNoTracker = 0,
                renderedResults  = [];
            var pruneRows = function ()
            {
                out += '<div class="row"><div class="col-sm-3">\n';
                out += htmlContent.join('</div><div class="col-sm-3">');
                out += '</div></div>\n';
                htmlContent = [];
                cols = 0;
            };
            for(var movieI = 0; movieI < result.length; movieI++)
            {
                cols++;
                entriesNoTracker++;

                var movie = result[movieI];

                var html = '<div class="col-entry" id="colEntryNo_'+movie.id+'"><div class="poster"><img src="images/'+movie.poster+'" alt="" class="img-responsive img-rounded" /></div>';
                html += '<div class="description"><h3>'+movie.title;
                if(movie.year)
                {
                    html += ' ('+movie.year+')';
                }
                html += '</h3>';
                if(movie.seasons)
                {
                    html += '<div class="seasons"><div class="meta-label">'+rotcelloc.translate('Seasons')+':</div> '+movie.seasons+'</div>';
                }
                if(movie.origTitle && movie.origTitle != movie.title)
                {
                    html += '<div class="original-title"><div class="meta-label">'+rotcelloc.translate('Original title')+':</div> '+movie.origTitle+'</div>';
                }
                if(movie.disneyClassicNo)
                {
                    html += '<div class="disney-number"><div class="meta-label">'+rotcelloc.translate('Disney classics no.')+':</div> '+movie.disneyClassicNo+'</div>';
                }
                if(movie.genre)
                {
                    html += '<div class="title-format"><div class="meta-label">'+rotcelloc.translate('Genre')+':</div> '+movie.genre+'</div>';
                }
                html += '<div class="showMoreLink"><a href="#" onclick="rotcelloc.showMore('+movie.id+'); return false;">'+rotcelloc.translate('Show more information')+'</a></div><div class="showMore collapse"></div>';
                html += '</div></div>';

                htmlContent.push(html);

                if(cols == 4)
                {
                    pruneRows();
                    if(entriesNoTracker >= this.maxMoviesPerRenderedPage)
                    {
                        entriesNoTracker = 0;
                        renderedResults.push(out);
                        out = '';
                    }
                }
            }

            if(cols !== 0)
            {
                pruneRows();
            }
            if(out !== '')
            {
                renderedResults.push(out);
            }

            rotcelloc.currentResults = renderedResults;

            $('#collResultTarget').html('');
            rotcelloc.showNextResults();
            rotcelloc.setPageTitle('('+result.length+')');
        },
        /*
         * Function that gets triggered on scroll to render more items if needed
         */
        showNextResults: function ()
        {
            if(rotcelloc.currentResults && rotcelloc.currentResults.length)
            {
                $('#collResultTarget').append(rotcelloc.currentResults.shift());
            }
        },
        /*
         * Renders the "more" component of a collections entry, this will be called
         * when the user clicks the "Show more information" link
         */
        showMore: function(entryID)
        {
            var data = rotcelloc.workingData[entryID];
            if(data === null || data === undefined)
            {
                throw('Unhandled showMore ID: '+entryID);
            }
            var $root   = $('#colEntryNo_'+entryID);
            var $target = $root.find('.showMore'),
                html    = '';
            if(data.altTitle && data.altTitle != data.title)
            {
                html += '<div class="original-title"><div class="meta-label">'+rotcelloc.translate('Alternativ title')+':</div> '+data.altTitle+'</div>';
            }
            if(data.runtime)
            {
                html += '<div class="title-runtime"><div class="meta-label">'+rotcelloc.translate('Runtime')+':</div> '+data.runtime+'</div>';
            }
            if(data.platform)
            {
                html += '<div class="title-runtime"><div class="meta-label">'+rotcelloc.translate('Platform')+':</div> '+data.platform.join(', ')+'</div>';
            }
            if(data.developer)
            {
                html += '<div class="title-runtime"><div class="meta-label">'+rotcelloc.translate('Developer')+':</div> '+data.developer+'</div>';
            }
            if(data.actors)
            {
                html += '<div class="title-actors"><div class="meta-label">'+rotcelloc.translate('Actors')+':</div> '+data.actors+'</div>';
            }
            if(data.director)
            {
                html += '<div class="title-director"><div class="meta-label">'+rotcelloc.translate('Director')+':</div> '+data.director+'</div>';
            }
            if(data.writer)
            {
                html += '<div class="title-writer"><div class="meta-label">'+rotcelloc.translate('Writer')+':</div> '+data.writer+'</div>';
            }
            if(rotcelloc.data.config.collections[rotcelloc.pagetype].sources.length > 1)
            {
                html += '<div class="group"><div class="meta-label">'+rotcelloc.translate('Group')+':</div> ';
                var sources = data.bSource.split(", ");
                for(var source = 0; source < sources.length; source++)
                {
                    var sourceN = sources[source];
                    if(source > 0)
                    {
                        html += ', ';
                    }
                    html += rotcelloc.workingMeta.sourceToNameMap[sourceN];
                }
                html += '</div>';
            }
            if(data.rating)
            {
                html += '<div class="title-actors"><div class="meta-label">'+rotcelloc.translate('Custom rating')+':</div> '+data.rating+'/6</div>';
            }
            if(data.metascore)
            {
                html += '<div class="title-actors"><div class="meta-label">'+rotcelloc.translate('Metascore')+':</div> '+data.metascore+'/100</div>';
            }
            if(data.imdbRating)
            {
                html += '<div class="title-actors"><div class="meta-label">'+rotcelloc.translate('IMDB rating')+':</div> '+data.imdbRating+'/10 ('+data.imdbVotes+' '+rotcelloc.translate('votes')+')</div>';
            }
            if(data.format)
            {
                html += '<div class="title-format"><div class="meta-label">'+rotcelloc.translate('Format')+':</div> '+data.format+'</div>';
            }
                html += '<div class="entry-links"><div class="meta-label">'+rotcelloc.translate('Links')+':</div> ';
            if(data.type && data.type == 'game')
            {
                html += '<a target="_blank" href="https://www.mobygames.com/search/quick?q='+encodeURIComponent(data.title)+'">MobyGames</a>, ';
                if(data.tgdbID)
                {
                    html += '<a target="_blank" href="http://thegamesdb.net/game/'+data.tgdbID+'/">TheGamesDB</a>';
                }
                else
                {
                    html += '<a target="_blank" href="http://thegamesdb.net/search/?string='+encodeURIComponent(data.title)+'&function=Search">TheGamesDB</a>';
                }
                if(data.steamID)
                {
                    html += ', ';
                    html += '<a target="_blank" href="http://store.steampowered.com/app/'+encodeURIComponent(data.steamID)+'/">Steam</a>';
                }
            }
            else
            {
                if(data.contentType && data.contentType == 'anime')
                {
                    html += '<a target="_blank" href="https://duckduckgo.com/?q='+encodeURIComponent( (data.origTitle ? data.origTitle : data.title) +' site:animenfo.com')+'">AnimeNFO</a>';
                    html += ', ';
                }
                var imdbURL;
                if(data.imdbID)
                {
                    imdbURL = 'http://www.imdb.com/title/'+data.imdbID;
                }
                else
                {
                    imdbURL = 'http://www.imdb.com/find?s=all&amp;s=tt&amp;q='+encodeURIComponent(data.origTitle ? data.origTitle : data.title)+'&amp;ttype='+ ( rotcelloc.workingMeta.type == 'series' ? 'tv' : 'ft' );
                }
                html += '<a target="_blank" href="'+imdbURL+'">IMDB</a>';
                html += ', ';
                html += '<a target="_blank" href="https://www.themoviedb.org/search/'+( rotcelloc.workingMeta.type == 'series' ? 'tv' : 'movie' )+'?query='+encodeURIComponent(data.origTitle ? data.origTitle : data.title)+'">TheMovieDB</a>';
            }
            html += '</div>';
            if(data.note)
            {
                html += '<div class="note"><div class="meta-label">'+rotcelloc.translate('Note')+':</div> '+data.note+'</div>';
            }
            if(data.plot)
            {
                html += '<div class="plot">'+data.plot+'</div>';
            }
            $root.find('.showMoreLink').slideUp();
            $target.html(html);
            $target.slideDown();
        },
        /*
         * Reads values from the DOM that will then be handed over to the search
         * function
         */
        performSearchFromHTML: function ()
        {
            var query           = {},
                $group          = $('#group .active input'),
                platform        = $('#platform .active input').attr('data-value'),
                order           = $('#order option:selected()').attr('data-value'),
                $format         = $('#format .active input'),
                $genre          = $('#genre .active input'),
                $plotSearch     = $('#plotSearch .active input'),
                $watchedSearch     = $('#watchedSearch .active input'),
                genreSearchType = $('#genre_searchtype option:selected()').attr('data-value'),
                text            = $('#searchBox').val();
            var group           = $group.attr('data-value'),
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
            rotcelloc.performSearch(query);
        },
        /*
         * Searches our dataset, handling many different fields and scoring hits
         * appropriately
         */
        performSearch: function (query)
        {
            var results = [];
            if(_.isEqual(query,rotcelloc.prevQuery))
            {
                return;
            }
            else
            {
                rotcelloc.prevQuery = query;
            }
            for(var collectionN = 0; collectionN < rotcelloc.workingData.length; collectionN++)
            {
                var searchScore = 10,
                    collectionEntry = rotcelloc.workingData[collectionN],
                    hit;
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
                        var sources = collectionEntry.bSource.split(/,\s+/);
                        for(var keyN = 0; keyN < sources.length; keyN++)
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
                    for (var formatI in query.formats)
                    {
                        var queryFormat = query.formats[formatI];
                        var found = false;
                        for(format = 0; format < collectionEntry.format.length; format++)
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
                    var format;
                    if(collectionEntry.format)
                    {
                        for(format = 0; format < collectionEntry.format.length; format++)
                        {
                            if(collectionEntry.format[format] == query.format)
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
                    var platform;
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
                        var regexAlias;
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
                            for (var genreAI in query.genres)
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
                            for (var genreI in query.genres)
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
                            for (var genreNI in query.genres)
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
            var sorted = false;
            if(query.order)
            {
                var orderByOptionalField = function (optField)
                {
                    return function (a,b)
                    {
                        if(a[optField] && b[optField] && a[optField] != b[optField])
                        {
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
                    results.sort(function(a,b) {
                            return a.title.localeCompare(b.title,'no-nn');
                    });
                }
                else if(query.order == 'random')
                {
                    sorted  = true;
                    results = _.shuffle(results);
                }
                else if(query.order == 'rating' || query.order == 'imdbRating' || query.order == 'metascore' || query.order == 'runtimeMin' || query.order == 'sortYear' || query.order == 'normalizedRating')
                {
                    sorted = true;
                    results.sort( orderByOptionalField(query.order) );
                }
            }
            if(sorted === false)
            {
                results.sort(function(a,b) {
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
            rotcelloc.renderResults(results);
        },
        /*
         * Renders the search panel on the page
         */
        renderSearchPanel: function()
        {
            var plotSearchBool = {
                id: 'plotSearch',
                buttons: [
                    {
                        id: 'search_plot_yes',
                        value: 'true',
                        active: false,
                        name: rotcelloc.translate('Yes')
                    },
                    {
                        id: 'search_plot_no',
                        value: 'false',
                        active: true,
                        name: rotcelloc.translate('No')
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
                        name: rotcelloc.translate('Yes')
                    },
                    {
                        id: 'only_unwatched_no',
                        value: 'false',
                        active: true,
                        name: rotcelloc.translate('No')
                    }
                ],
            },
                orderButtons = {
                id: 'order',
                buttons: [
                    {
                        id: 'order_none',
                        value: '',
                        active: rotcelloc.workingConfig.defaultSort !== 'year',
                        name: rotcelloc.translate('Automatic')
                    }
                ]
            };
            if(rotcelloc.workingMeta.hasDisneySort)
            {
                orderButtons.buttons.push(
                    {
                        id: 'order_alpha',
                        value: 'alpha',
                        name: rotcelloc.translate('Alphabetic')
                    }
                );
            }
            else
            {
                orderButtons.buttons[0].name = rotcelloc.translate('Alphabetic');
            }
            if (rotcelloc.workingMeta.fields.year)
            {
                orderButtons.buttons.push(
                    {
                        id: 'order_year',
                        value: 'sortYear',
                        name: rotcelloc.translate('Year'),
                        active: rotcelloc.workingConfig.defaultSort === 'year'
                    }
                );
            }
            orderButtons.buttons.push(
                {
                    id: 'order_rand',
                    value: 'random',
                    name: rotcelloc.translate('Random')
            });

            if (rotcelloc.workingMeta.type != 'games')
            {
                orderButtons.buttons.push(
                {
                    id: 'runtime',
                    value: 'runtimeMin',
                    name: rotcelloc.translate('Length')
                });
            }
            if(rotcelloc.workingMeta.enableNormalized)
            {
                orderButtons.buttons.push(
                    {
                        id: 'order_normalRating',
                        value: 'normalizedRating',
                        name: rotcelloc.translate('Rating (smart)')
                    }
                );
            }
            if(rotcelloc.workingMeta.fields.rating)
            {
                orderButtons.buttons.push(
                    {
                        id: 'order_rating',
                        value: 'rating',
                        name: rotcelloc.translate('Custom rating')
                    }
                );
            }
            if (rotcelloc.workingMeta.fields.metascore)
            {
                orderButtons.buttons.push(
                    {
                        id: 'order_meta',
                        value: 'metascore',
                        name: rotcelloc.translate('Metascore')
                    });
            }
            if (rotcelloc.workingMeta.type != 'games')
            {
                orderButtons.buttons.push(
                    {
                        id: 'order_imdb',
                        value: 'imdbRating',
                        name: rotcelloc.translate('IMDB rating')
                    }
                );
            }
            var platformButtons = {
                id: 'platform',
                buttons: [{
                        id: 'platforms_none',
                        value: '',
                        active: true,
                        name: rotcelloc.translate('All')
                }]
            };
            if(rotcelloc.workingMeta.platforms && rotcelloc.workingMeta.platforms.length > 1)
            {
                for (var platformI in rotcelloc.workingMeta.platforms)
                {
                    var platform = rotcelloc.workingMeta.platforms[platformI];
                    platformButtons.buttons.push({
                            id: 'platforms_'+platformI,
                            value: platform,
                            name: platform
                    });
                }
            }
            var groupButtons = {
                id: 'group',
                buttons: [{
                        id: 'groups_none',
                        value: '',
                        active: true,
                        name: rotcelloc.translate('All')
                }]
            };
            for (var groupI in rotcelloc.data.config.collections[rotcelloc.pagetype].sources)
            {
                var group = rotcelloc.data.config.collections[rotcelloc.pagetype].sources[groupI];
                groupButtons.buttons.push({
                        id: 'groups_'+groupI,
                        value: group.file ? group.file : group.bSource ,
                        disneySort: group.disneySort,
                        name: group.name
                });
            }
            var genreButtons = {
                id: 'genre',
                type: 'checkbox',
                buttons: []
            };
            if(rotcelloc.workingMeta.genres && rotcelloc.workingMeta.genres.length)
            {
                for(var genreN = 0; genreN < rotcelloc.workingMeta.genres.length; genreN++)
                {
                    var genre = rotcelloc.workingMeta.genres[genreN];
                    genreButtons.buttons.push({
                        id: 'genre_'+genre,
                        value: genre,
                        name: genre
                    });
                }
            }
            var formatButtons = {
                id: 'format',
                type: 'checkbox',
                buttons: []
            };
            if(rotcelloc.workingMeta.formats && rotcelloc.workingMeta.formats.length)
            {
                for(var formatN = 0; formatN < rotcelloc.workingMeta.formats.length; formatN++)
                {
                    var format = rotcelloc.workingMeta.formats[formatN];
                    formatButtons.buttons.push({
                        id: 'format_'+format,
                        value: format,
                        name: format
                    });
                }
            }
            var hasMore = false;
            if(groupButtons.buttons.length > 2 || genreButtons.buttons.length || formatButtons.buttons.length)
            {
                hasMore = true;
            }
            var html = '';
            html += '<div class="row">';
            html += '<div class="col-sm-2 form-inline row-padding">';
            if(hasMore)
            {
                html +='<div class="btn-group" data-toggle="buttons-checkbox"><a class="btn btn-primary collapse-data-btn" data-toggle="collapse" href="#moreFilters">'+rotcelloc.translate('Show filter')+'</a></div>';
            }
            html += '</div>';
            html += '<div class="col-sm-10 form-inline row-padding text-right"><div class="input-group"><div class="input-group-addon">'+rotcelloc.translate('Order')+'</div>'+rotcelloc.renderSelectElement(orderButtons)+'</div><input type="text" class="form-control pull-right" placeholder="'+rotcelloc.translate('Search')+'" id="searchBox" /></div>';
            if(hasMore)
            {
                html += '</div><div class="collapse" id="moreFilters"><div class="well">';
            }
            if(groupButtons.buttons.length > 2)
            {
                html += '<div class="row"><div class="col-sm-12 row-padding"><div class="searchbar-label">'+rotcelloc.translate('Group')+':</div>'+rotcelloc.renderRadioOrCheckButtons(groupButtons)+'</div></div>';
            }
            if(platformButtons.buttons.length > 2)
            {
                html += '<div class="row"><div class="col-sm-12 row-padding"><div class="searchbar-label">'+rotcelloc.translate('Platform')+':</div>'+rotcelloc.renderRadioOrCheckButtons(platformButtons)+'</div></div>';
            }
            if(formatButtons.buttons.length > 1)
            {
                html += '<div class="row"><div class="col-sm-12 row-padding"><div class="searchbar-label">'+rotcelloc.translate('Format')+':</div>'+rotcelloc.renderRadioOrCheckButtons(formatButtons)+'</div></div>';
            }
            if(genreButtons.buttons.length)
            {
                var genreType = {
                    id: 'genre_searchtype',
                    buttons: [
                        {
                            id: 'genre_inall',
                            value: 'all',
                            active: true,
                            name: rotcelloc.translate('In genre (all selected)'),
                        },
                        {
                            id: 'genre_inany',
                            value: 'any',
                            active: false,
                            name: rotcelloc.translate('In genre (any selected)')
                        },
                        {
                            id: 'genre_notin',
                            value: 'notin',
                            active: false,
                            name: rotcelloc.translate('Not in genre'),
                        },
                    ]
                };

                html += '<div class="row"><div class="col-sm-12 row-padding"><div class="searchbar-label genre-select-line form-inline">'+rotcelloc.renderSelectElement(genreType)+':</div>'+rotcelloc.renderRadioOrCheckButtons(genreButtons)+'</div></div>';
            }
            if(rotcelloc.workingMeta.fields.watched || rotcelloc.workingMeta.fields.plot)
            {
                html += '<div class="row"><div class="col-sm-12 row-padding">';
                if(rotcelloc.workingMeta.fields.plot)
                {
                    html += '<div class="searchbar-label-inline">'+rotcelloc.translate('Search in plot descriptions')+'</div>'+rotcelloc.renderRadioOrCheckButtons(plotSearchBool);
                }
                if(rotcelloc.workingMeta.fields.watched === true)
                {
                    html += '<div class="searchbar-additional searchbar-label-inline">'+rotcelloc.translate('Only display unwatched titles')+'</div>'+rotcelloc.renderRadioOrCheckButtons(watchedSearchBool);
                }
                html += '</div></div>';
            }
            if(hasMore)
            {
                html += '</div>';
            }
            html += '</div>';
            $('#searchForm').html(html);
        },
        /*
         * Sets the page title. Useful because it also tracks the original title
         * for us and just appends whatever we supply to this function to the
         * original title
         */
        setPageTitle: function (add)
        {
            var $title    = $('title');
            var origTitle = $title.text();
            if($title.attr('orig-title'))
            {
                origTitle = $title.attr('orig-title');
            }
            $title.attr('orig-title',origTitle);
            $title.text(origTitle+' '+add);
        },
        /*
         * Renders a single "select"
         */
        renderSelectElement: function (data)
        {
            var html = '<select class="form-control" id="'+data.id+'">';
            for(var buttonI = 0; buttonI < data.buttons.length; buttonI++)
            {
                var button = data.buttons[buttonI];
                html += '<option data-value="'+button.value+'"'+(button.active ? ' selected' : '' )+'>'+button.name+'</option>';
            }
            html += '</select>';
            return html;
        },
        /*
         * Renders a single set of radio or check-style buttons
         */
        renderRadioOrCheckButtons: function (data)
        {
            var html = '',
                type = 'radio';
            if(data.type == 'checkbox')
            {
                type = 'checkbox';
            }
            var htmlClass = 'btn-group';
            var allText = '';
            for(var buttonI = 0; buttonI < data.buttons.length; buttonI++)
            {
                var button = data.buttons[buttonI];
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
            var avgLength = allText.length/data.buttons.length;
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
        },
        /*
         * Translates a single string
         */
        translate: function (s)
        {
            if(rotcelloc.data.i18n[s])
            {
                return rotcelloc.data.i18n[s];
            }
            return s;
        }
    };
    /*
     * Runs our init function on jquery load
     */
    $(function () {
            rotcelloc.init();
    });
    // Expose the object so that it can be called from the console
    window.rotcelloc = rotcelloc;
})(jQuery);
