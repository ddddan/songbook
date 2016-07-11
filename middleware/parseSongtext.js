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
    MongoClient = require('mongodb').MongoClient,
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
    C.mongoURL = 'mongodb://localhost:27017/songbook';
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
     * @param {object} db - The mongodb object
     * @param {string} songText - The raw songtext
     * @param {object} opts - Options
     */
    function parseSongtext(db, songText, opts) {

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
                // TODO: Close section here as well
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
                // Title: remove any numbering at the beginning of the title
                result.info.title = row.replace(/^\d+\.?\s+/, '');
            } else if (!result.info.hasOwnProperty('author') || !result.info.author) {
                result.info.author = row;
            }
        }

        storeSong(db, result, opts);


        console.log(util.inspect(result, {
            colors: true,
            showHidden: false,
            depth: null
        }));

    }

    /**
     * storeSong - After parsing the songtext, store it in the DB
     *
     * @param {object} db - The mongodb object
     * @param {object} song - Object created by parseSongtext()
     * @param {object} opts - Options
     */
    function storeSong(db, song, opts) {
        // Ensure the song is not already in the db
        var songCol = db.collection('songs');
        songCol.find({
            'info.title': song.info.title
        }).toArray(function (err, docs) {
            // If it is, and the force flag has not been set, return an error
            if ((err !== null || docs.length > 0) &&
                (!opts.hasOwnProperty('force') ||
                    opts.force !== 'add')) {
                // TODO: Add 'Replace' option - may need own logic if multiple matches
                db.close();
                next({
                    status: 'error',
                    error: 'Song Exists',
                    existing: docs,
                    originalText: req.body.songtext,
                    new: song
                });
            } else {
                songCol.insertOne(song, function (err, r) {
                    test.equal(null, err);
                    test.equal(1, r.insertedCount);
                    db.close();
                    next({
                        status: 'ok',
                        new: song
                    });
                });
            }
        });
    }

    /**
     * DEV: Load songtext from a file
     *
     * @param {string} fileName - The file to load
     */
    function loadSongtext(fileName) {
        fs.readFile(fileName, 'utf8', function (err, data) {
            test.equal(null, err);
            MongoClient.connect(C.MongoURL, function (err, db) {
                test.equal(null, err);
                parseSongtext(db, data, {});
            });
        });
    }

    // Main entry point
    if (!!C.dev || !!C.debug) {
        loadSongtext(C.fileName);
    } else {
        if (req.body.hasOwnProperty('songtext')) {
            console.log(util.inspect(req.query, {
                colors: true,
                showHidden: false,
                depth: null
            }));
            var opts = req.query;

            MongoClient.connect(C.mongoURL, function (err, db) {
                test.equal(null, err);
                parseSongtext(db, req.body.songtext, opts);
            });

        } else {
            next({
                    status: 'error',
                    error: 'Nothing received'
                });
        }
    }
}

module.exports = parseSongtext;
