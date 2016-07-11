/* getAllSongs.js - Get alphabetized list of available songs */

/* PACKAGES */
var MongoClient = require('mongodb').MongoClient,
    util = require('util'),
    test = require('assert');

/* CONSTANTS */
var C = {};
C.MongoURL = 'mongodb://localhost:27017/songbook';

/**
 * getAllSongs() - Main entry point
 * @param {object}   req  [[Description]]
 * @param {object}   res  [[Description]]
 * @param {function} next [[Description]]
 */
function getAllSongs(req, res, next) {

    /**
     * getSongs() - Access the collection and get the song list
     * @param {object} db - Mongo DB object
     */
    function getSongs(db) {
        var songCol = db.collection('songs');
        var cursor = songCol.aggregate([{
                $sort: {
                    'info.title': 1
                }
                }, {
                $project: {
                    title: '$info.title'
                }
                }
            ]);
        cursor.toArray(function (err, docs) {
            test.equal(null, err);
            db.close();
            next(docs);
        });
    }

    /* Main entry point */
    MongoClient.connect(C.MongoURL, function (err, db) {
        test.equal(null, err);

        getSongs(db);

    });

}

module.exports = getAllSongs;
