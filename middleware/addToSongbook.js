/* addToSongbook.js - Add the current song to the songbook

Note: Currently songs can only be moved to the bottom.

*/

/* PACKAGES */
var MongoClient = require('mongodb').MongoClient,
    util = require('util'),
    test = require('assert');

/* CONSTANTS */
// var C = {};

/**
 * addToSongbook(req, res, next) - Main entry point
 * @param {object}   req  - express request object
 * @param {object}   res  - express response object
 * @param {function} next - callback function
 */
function addToSongbook(req, res, next) {

    /**
     * addSong() - Add the song to the songlist
     * NOTE: For now there is only one lsit
     *
     * @param {object} db - MongoDB
     * @param {string} songId - Unique identifier
     */
    function addSong(db, songId) {




        db.close();
        next({
            status: 'ok',
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

        addSong(db, songId);

    });
}

module.exports = addToSongbook;
