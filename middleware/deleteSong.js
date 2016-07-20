/* deleteSong.js - Delete the specified song

/* PACKAGES */
var MongoClient = require('mongodb').MongoClient,
    util = require('util'),
    test = require('assert');

/* CONSTANTS */
// var C = {};


function deleteSong(req, res, next) {


    function delSong(db, id) {
        var songCol = db.collection('songs');
        songCol.deleteOne({
            _id: id
        }, function (err, r) {
            var errMsg = '';
            if (!!err) {
                errMsg = 'unknownError';
            } else if (!r.deletedCount) {
                errMsg = 'notFound';
            };
            db.close();
            if (!!errMsg) {
                next({
                    status: 'fail',
                    error: errMsg
                });
            } else { // Success!!
                next({
                    status: 'ok',
                });
            }
        });
    }


    /* Main entry point */
    // Check params
    var songId = req.params.id; // The song id
    var conf = req.query.confirm; // Confirmation of deletion
    if (!songId || !conf) {
        next({
            status: 'fail',
            error: 'invalidRequest'
        });
    }

    // Connect to DB and attempt deletion
    MongoClient.connect(req.app.locals.MongoURL, function (err, db) {
        test.equal(null, err);

        delSong(db, songId);
    });


}

module.exports = deleteSong;
