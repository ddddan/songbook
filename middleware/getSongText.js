/* getSongtext.js - Retrieve the TEXT version of the song - e.g. for editing */

/* PACKAGES */
var MongoClient = require('mongodb').MongoClient,
    util = require('util'),
    test = require('assert');

/* CONSTANTS */
// var C = {};

// Add a ucFirst function to capitalize the first letter of a word
String.prototype.ucFirst = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}


/**
 * getSongText() - Main entry point
 * @param {object}   req  - express request object
 * @param {object}   res  - express response object
 * @param {function} next - callback function
 */
function getSongText(req, res, next) {

    /**
     * compileSong(doc) - Compile the song from the json and return as text
     * @param {object}   doc      - Song object
     * @param {function} next - Callback function
     */
    function compileSong(doc, next) {
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

            result += lyric.type.ucFirst() + ' ' + lyric.number + '\n';
            for (var j = 0; j < lyric.lines.length; j++) {
                result += lyric.lines[j] + '\n';
            }
        }

        next(null, result);

    }


    /**
     * getDoc(db, id) - Get the songtext from the db
     * @param {object} db - MongoDB
     * @param {string} id - Unique identifier
     */
    function getDoc(db, id) {
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
                        compileSong(r, function (err, text) {
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
                    }
                });
            }
        });
    }


    /* Main entry point */
    // Check params
    var songId = req.params.id; // The song id
    if (!songId) {
        next({
            status: 'fail',
            error: 'invalidRequest'
        });
    }

    MongoClient.connect(req.app.locals.MongoURL, function (err, db) {
        test.equal(null, err);

        getDoc(db, songId);

    });

}

module.exports = getSongText;
