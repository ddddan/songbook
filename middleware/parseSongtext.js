/**
 *
 * parseSongtext.js - Take a text file of a song and convert to song json
 *
 * (C) 2016 - Daniel G. Mullin
 */

// 1. Read in the song
// 2. Identify title, author, sections and insert into object
// 3. Output JSON

/* Packages */
var fs = require('fs'),
    util = require('util'),
    test = require('assert');

/**
 * parseSongtext() - The main middleware function
 * @param {object} req - http request (standard)
 * @param {object} res - http response (standard)
 * @param {callback function} next - next step in express chain
 */
var parseSongtext = function (req, res, next) {

    /* Global constants */
    var C = {};
    // C.dev = true; // Change for deployment
    // C.debug = true; // Change for deployment
    // C.fileName = '..\\tmp\\07 - Not By Might.txt';
    C.secTypes = {
        verse: 1,
        estrofa: 1,
        chorus: 1,
        coro: 1,
        bridge: 1,
        puente: 1,
        section: 1,
        'sección': 1,
        ending: 1,
        interlude: 1,
        vamp: 1
    };

    /**
     * Section constructor
     *
     * @param {string} type - Section type (see above)
     * @param {int} number - Number of the section
     * @param {string[]} lines - Content of the section
     */
    var Section = function (type, number, lines) {
        this.type = !!type ? type : '';
        this.number = !!number ? number : 0;
        this.lines = !!lines ? lines : [];
    };

    Section.prototype.clear = function () {
        this.type = '';
        this.number = 0;
        this.lines = [];
    };

    /**
     * Parse the songtext into an object that can be stringified later
     *
     * @param {string} songText - The raw songtext
     */
    function parseSongtext(songText) {

        var rows = songText.split('\n'),
            currSection = new Section(),
            result = {
                info: {},
                lyrics: []
            },
            sectionCounts = {};

        for (var i = 0; i < rows.length; i++) {
            var row = rows[i].trim();
            // Remove tabs or other weird whitespace characters
            row = row.replace(/\s+/g, ' ');

            var firstWord = row.split(' ')[0];
            // Blank line:
            if (!firstWord) {
                continue;
            }
            var sectionName = firstWord.toLowerCase();
            if (sectionName === '©' || sectionName === '(C)') {
                // Copyright notice
                result.info.copyright = row;

            } else if (C.secTypes.hasOwnProperty(sectionName)) {
                // New section - close off previous section
                if (!!currSection.type) {
                    result.lyrics.push(currSection);
                    if (!sectionCounts.hasOwnProperty(currSection.type)) {
                        sectionCounts[currSection.type] = 1;
                    } else {
                        sectionCounts[currSection.type]++;
                    }
                    currSection = new Section();
                }
                // Start the new section
                currSection.type = sectionName;
                // Get section number
                var matches = row.substring(sectionName.length + 1).match(/\d+/);
                /*
                console.log(util.inspect(matches, {
                    colors: true,
                    showHidden: false,
                    depth: null
                }));
                */
                currSection.number = !!matches ? parseInt(matches[0]) : 1;
            } else if (!!currSection.type) {
                // This is a lyric
                currSection.lines.push(row);

            } else if (!result.info.hasOwnProperty('title') || !result.info.title) {
                result.info.title = row;
            } else if (!result.info.hasOwnProperty('author') || !result.info.author) {
                result.info.author = row;
            }
        }

        res.json(result);


        console.log(util.inspect(result, {
            colors: true,
            showHidden: false,
            depth: null
        }));

    }

    /**
     * DEV: Load songtext from a file
     *
     * @param {string} fileName - The file to load
     */
    function loadSongtext(fileName) {
        fs.readFile(fileName, 'utf8', function (err, data) {
            test.equal(null, err);

            parseSongtext(data);
        });
    }

    // Main entry point
    if (!!C.dev || !!C.debug) {
        loadSongtext(C.fileName);
    } else {
        console.log(util.inspect(req.body, {
            colors: true,
            showHidden: false,
            depth: null
        }));
        if (req.body.hasOwnProperty('songtext')) {
            parseSongtext(req.body.songtext); // for integration into app
        } else {
            res.send('Nothing received.');
        }
    }
}

module.exports = parseSongtext;
