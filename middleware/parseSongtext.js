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
function parseSongtext(req, res, next) {

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
    C.numKeyDigits = 4;

    /**
     * Section constructor
     *
     * @param {string}   type   - Section type (see above)
     * @param {int}      number - Number of the section
     * @param {string[]} lines  - Content of the section
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
     * Get the character representing /val/ in [0-9A-Za-z_-]
     * @param {number} val - The number to convert
     */
    function valChar(val) {
        if (val < 10) {
            return String.fromCharCode(val + 48);
        } else if (val < 36) {
            return String.fromCharCode(val + 55);
        } else if (val < 62) {
            return String.fromCharCode(val + 61);
        } else {
            return '_-'.charAt(val - 62);
        }
    }


    /**
     * genKey() - Helper function to generate a unique ID for the song
     */
    function genKey() {
        var val,
            checkSum = 0,
            result = '';
        // Generate 4 random numbers between 0 and 63
        // Convert them to [0-9A-Za-z_-]
        // Insert checksum in the middle
        for (var i = 0; i < C.numKeyDigits; i++) {
            // Disallow [_-] (62, 63) for first digit
            do {
                val = Math.floor(Math.random() * 64);
            } while (!i && val > 62);
            checkSum += val;
            result += valChar(val);
        }
        checkSum = checkSum % 11;
        return result.slice(0, 2) + valChar(checkSum) + result.slice(2, 4);

    }


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

            // Find the first space so that the chars before that act as section name
            var firstSpace = row.indexOf(' ');
            var firstWord = (firstSpace != -1 ? row.slice(0, firstSpace) : row);

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

        if (!opts.update) {
            storeSong(db, result, opts);
        } else {
            updateSong(db, result, opts);
        }

        console.log(util.inspect(result, {
            colors: true,
            showHidden: false,
            depth: null
        }));

    }

    /**
     * insertSong(col, song) - Attempt to store the song; separated out to allow "iteration"
     *                         in case of a hash collision.
     * @param {object}   col      - The MongoDB object
     * @param {object}   song     - The song object
     * @param {function} callback - If successful, do this callback
     */
    function insertSong(col, song, callback) {
        song._id = genKey();
        col.insertOne(song, function (err, r) {
            if (err !== null && err.hasOwnProperty('code') && err.code === '11000') {
                // Duplicate key
                insertSong(col, song, callback);
            } else {
                test.equal(null, err);
                test.equal(1, r.insertedCount);
                callback(key);
            }
        });
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
                insertSong(songCol, song, function (key) {
                    db.close();

                    next({
                        status: 'ok',
                        new: song,
                        key: key
                    });
                })
            }
        });
    }

    /**
     * updateSong(db, song, opts) - Update an existing song
     *
     * @param {object} db - The mongodb object
     * @param {object} song - Object created by parseSongtext()
     * @param {object} opts - Options
     */
    function updateSong(db, song, opts) {
        if (!req.params.hasOwnProperty('id') || !req.params.id) {
            db.close();
            next({
                status: 'fail',
                error: 'invalidRequest'
            });
            return;
        }
        var id = req.params.id,
            songCol = db.collection('songs');
        songCol.replaceOne({
            _id: id
        }, song, function (err, r) {
            db.close();
            if (!!err) {
                next({
                    status: 'fail',
                    error: 'unknownError'
                });
            } else if (!r.modifiedCount) {
                next({
                    status: 'fail',
                    error: 'notFound'
                });
            } else { // Success!
                next({
                    status: 'ok',
                    key: _id
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
            MongoClient.connect(req.app.locals.MongoURL, function (err, db) {
                test.equal(null, err);
                parseSongtext(db, data, {});
            });
        });
    }

    // Main entry point
    if (!!C.dev || !!C.debug) {
        // loadSongtext(C.fileName);
        var key = genKey();
        process.exit();

    } else {
        if (req.body.hasOwnProperty('songtext')) {
            console.log(util.inspect(req.query, {
                colors: true,
                showHidden: false,
                depth: null
            }));
            var opts = req.query;
            // Determine whether this is a create or update
            opts.update = (req.body.hasOwnProperty('update') && req.body.update === 'yes');

            MongoClient.connect(req.app.locals.MongoURL, function (err, db) {
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

if (require.main === module) { // Command line
    parseSongtext(null, null, function (req, res, next) {});
}
