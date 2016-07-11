var express = require('express'),
    util = require('util');
var router = express.Router();


/* GET home page. */
router.get('/', function (req, res, next) {
    var songAdded = (req.query.hasOwnProperty('songAdded') && req.query.songAdded === 1);
    res.render('index', {
        title: 'Songbook Creator',
        songAdded: songAdded
    });
});

/* GET song list (for ajax) */
router.get('/songlist', function (req, res, next) {
    var getAllSongs = require('../middleware/getAllSongs.js');
    getAllSongs(req, res, function (data) {
        res.json(data);
    })
});

/* GET Song editor page */
router.get('/song-edit', function (req, res, next) {
    var songExists = (req.query.hasOwnProperty('error') && req.query.error === 'exists');
    res.render('songEdit', {
        title: 'Songbook Creator - Song Editor',
        songExists: songExists,

    });
});

/* POST Song editor submission */
router.post('/song-submit', function (req, res, next) {
    var parseSongtext = require('../middleware/parseSongtext.js');
    parseSongtext(req, res, function (data) {
        if (data.hasOwnProperty('status')) {
            if (data.status === 'ok') {
                res.redirect('/?songAdded=1');
            } else if (data.status === 'error' && data.hasOwnProperty('error') && data.error === 'Song Exists') {
                res.redirect('/song-edit/?error=exists');
            }
        }

    });

});

module.exports = router;
