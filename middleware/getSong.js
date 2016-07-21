/* getSong.js - Retrieve the TEXT version of the song - e.g. for editing */

/* PACKAGES */
var MongoClient = require('mongodb').MongoClient,
    util = require('util'),
    test = require('assert');

/* CONSTANTS */
// var C = {};

// Add a ucFirst function to capitalize the first letter of a word
String.prototype.ucFirst = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};


/**
 * getSong() - Main entry point
 * @param {object}   req  - express request object
 * @param {object}   res  - express response object
 * @param {function} next - callback function
 */
function getSong(req, res, next) {

    /**
     * compileSong(doc) - Compile the song from the json and return as text
     * @param {object}   doc      - Song object
     * @param {function} next - Callback function
     */
    function getSongText(doc, next) {
        var result = '';
        // Check that it is well-formed
        if (!doc.hasOwnProperty('info') || !doc.hasOwnProperty('lyrics')) {
            next(new Error('malFormed'));
            return;
        }
        // Add title and author if present
        if (doc.info.hasOwnProperty('title')) {
            result += doc.info.title + '\n';
            if (doc.info.hasOwnProperty('author')) {
                result += doc.info.author + '\n';
            }
        };
        // Add lyrics
        for (var i = 0; i < doc.lyrics.length; i++) {
            var lyric = doc.lyrics[i];
            if (!lyric.hasOwnProperty('type') || !lyric.hasOwnProperty('number'), !lyric.hasOwnProperty('lines')) {
                next(new Error('malFormed'));
                return;
            }
            if (!!result) { // Add a blank line before each section
                result += '\n';
            }

            // Section header - Only add the section number if it is non-zero
            result += lyric.type.ucFirst() + (!!lyric.number ? ' ' + lyric.number : '') + '\n';

            // Lyric lines
            for (var j = 0; j < lyric.lines.length; j++) {
                result += lyric.lines[j] + '\n';
            }

            // TODO: Copyright
        }

        next(null, result);

    }

    /**
     * getSongHtml(doc, next) - Compile the song from the json and return as text
     * @param {object}   doc  - Song object
     * @param {function} next - Callback function
     */
    function getSongHtml(doc, next) {
        var result = '';
        // Check that it is well-formed
        if (!doc.hasOwnProperty('info') || !doc.hasOwnProperty('lyrics')) {
            next(new Error('malFormed'));
            return;
        }
        // Add title and author if present
        if (doc.info.hasOwnProperty('title')) {
            result += '<h2 class="songTitle">' + doc.info.title + '</h2>\n';
            if (doc.info.hasOwnProperty('author')) {
                result += '<p class="author">' + doc.info.author + '</p>\n';
            }
        };
        // Add lyrics
        for (var i = 0; i < doc.lyrics.length; i++) {
            var lyric = doc.lyrics[i];
            if (!lyric.hasOwnProperty('type') || !lyric.hasOwnProperty('number'), !lyric.hasOwnProperty('lines')) {
                next(new Error('malFormed'));
                return;
            }
            if (!!result) { // Add a blank line before each section (pretty-printing)
                result += '\n';
            }

            // Section header - Only add the section number if it is non-zero
            result += '<h3>' + lyric.type.ucFirst() + (!!lyric.number ? ' ' + lyric.number : '') + '</h3>\n';

            // Lyric lines
            result += '<p class="lyrics">\n';
            for (var j = 0; j < lyric.lines.length; j++) {
                result += lyric.lines[j] + '</br>\n';
            }
            result += '</p>\n';

            // TODO: Copyright
        }

        next(null, result);
    }


    /**
     * getDoc(db, id) - Get the songtext from the db
     * @param {object} db - MongoDB
     * @param {string} id - Unique identifier
     * @param {string} format - 'text' or 'html'
     */
    function getDoc(db, id, format) {
        var songCol = db.collection('songs');

        var cursor = songCol.find({
            _id: id
        });
        // Check if there is a match
        cursor.hasNext(function (err, r) {
            if (!!err) {
                db.close();
                next({
                    status: 'fail',
                    error: 'unknownError'
                });
            } else if (!r) {
                db.close();
                next({
                    status: 'fail',
                    error: 'notFound'
                });
            } else {
                // Now retrieve the match
                cursor.next(function (err, r) {
                    db.close();
                    if (!!err) {
                        next({
                            status: 'fail',
                            error: 'unknownError'
                        });
                    } else { // Success!
                        if (format === 'text') {
                            getSongText(r, function (err, text) {
                                if (!!err) {
                                    next({
                                        status: 'fail',
                                        error: err.message
                                    });
                                } else {
                                    next({
                                        status: 'ok',
                                        text: text
                                    });
                                }
                            });
                        } else { // html
                            getSongHtml(r, function (err, html) {
                                if (!!err) {
                                    next({
                                        status: 'fail',
                                        error: err.message
                                    });
                                } else {
                                    next({
                                        status: 'ok',
                                        html: html
                                    });
                                }
                            });
                        }
                    }
                });
            }
        });
    }


    /* Main entry point */
    // Check params
    var songId = req.params.id, // The song id
        format = req.app.locals.format; // 'text' or 'html'
    if (!songId || !format || (format !== 'text' && format !== 'html')) {
        next({
            status: 'fail',
            error: 'invalidRequest'
        });
    }

    MongoClient.connect(req.app.locals.MongoURL, function (err, db) {
        test.equal(null, err);

        getDoc(db, songId, format);

    });

}

module.exports = getSong;
