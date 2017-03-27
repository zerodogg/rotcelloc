/*
 * rotcelloc gog exporter bookmarklet - exports a GOG collection to CSV
 *
 * Part of rotcelloc - hacker's movies, tv-series and games collector
 * application
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
// jshint esversion: 6
/* global jQuery*/

// Boilerplate for fetching jQuery
// eslint-disable-next-line
void function($){var loadBookmarklet=function($){
        // Start of actual code
// eslint-disable-next-line
(function ($){
        const result = [],
              totalPages = $('.pagin__total').last().text();
        const parsePage = function ()
        {
            const currentPage = $('.pagin__current').find('input').last().val();
            $('.product-title:first-child').each(function ()
            {
                    const entry = $(this).children().first().text().split(/\s+/);
                    let sentence = '';
                    for(const partI in entry)
                    {
                        const part = entry[partI];
                        if(sentence.length > 0)
                        {
                            sentence += ' ';
                        }
                        sentence += part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
                    }
                    result.push(sentence+';PC;GOG');
            });
            if(totalPages > currentPage)
            {
                $('.pagin__next').click();
                const interval = setInterval(() =>
                {
                    if($('.pagin__current').find('input').last().val() != currentPage)
                    {
                        clearInterval(interval);
                        parsePage();
                    }
                },1000);
            }
            else
            {
                const CSV = 'Title;Platform;Format\n'+result.join("\n");
                const $a = $('<a />').attr('download','gog.csv').attr('href','data:text/csv;charset=utf-8,'+ encodeURIComponent(CSV));
                $a.appendTo('body');
                $a[0].click();
            }
        };
        parsePage();
})(jQuery); // end of code
// More boilerplate for fetching jQuery
// eslint-disable-next-line
},hasJQuery=$&&$.fn&&parseFloat($.fn.jquery)>=1.7;if(hasJQuery)loadBookmarklet($);else{var s=document.createElement("script");s.src="//ajax.googleapis.com/ajax/libs/jquery/1/jquery.js",s.onload=s.onreadystatechange=function(){var state=this.readyState;state&&"loaded"!==state&&"complete"!==state||loadBookmarklet(jQuery.noConflict())}}document.getElementsByTagName("head")[0].appendChild(s)}(window.jQuery); // jshint ignore:line
