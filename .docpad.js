/*
 * rotcelloc DocPad configuration file (http://docpad.org/docs/config)
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
 *
 * vim: ft=javascript :
 */

// Define the DocPad Configuration
var fs = require('fs'),
    util = require('util');
var docpadConfig,
    cachedData = { i18n: {} };

docpadConfig = {
    templateData: {
        site: {
            jQueryVersion: '2.1.4',
            bootstrapVersion: '3.3.5'
        },
        getConfig: function ()
        {
            if(!cachedData['config.json'])
            {
                cachedData['config.json'] = JSON.parse(fs.readFileSync('config.json'));
            }
            return cachedData['config.json'];
        },
        getPKGJson: function ()
        {
            if(!cachedData['package.json'])
            {
                try
                {
                    cachedData['package.json'] = JSON.parse(fs.readFileSync('package.json'));
                }
                catch(e)
                {
                    cachedData['package.json'] = { version: 'UNKNOWN' };
                }
            }
            return cachedData['package.json'];
        },
        generatorFooter: function ()
        {
            var self = this,
                pkg  = this.getPKGJson();
            var translate = function(s)
            {
                var language = self.getConfig().language;
                if(!cachedData.i18n && fs.existsSync('i18n/'+language+'.json'))
                {
                    cachedData.i18n = JSON.parse(fs.readFileSync('i18n/'+language+'.json'));
                }
                return cachedData.i18n[s] ? cachedData.i18n[s] : s;
            };
            return util.format(translate('Generated by <a href="%s">%s</a> version %s. Software licensed under the <a target="_blank" href="%s">%s</a>. Content is copyrighted by their respective owners.'),'http://random.zerodogg.org/','rotcelloc',pkg.version,'https://gnu.org/licenses/agpl-3.0-standalone.html','GNU AGPLv3');
        }
    },
    watchOptions: {
        catchupDelay: 0,
        regenerateDelay: 0,
        preferredMethods: ['watchFile', 'watch']
    },
    plugins: {
        raw: {
            raw: {
                command: ['rsync', '-a', '--exclude=images/orig', './src/raw/', './out/']
            }
        },
        menu: {
            menuOptions: {
                optimize: false,
                skipFiles: /\.js|\.scss|\.css/
            }
        }
    }
};
// Export the DocPad Configuration
module.exports = docpadConfig;
