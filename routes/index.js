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
    });
});

/* GET Song editor page (no param) = New Song */
router.get('/song-edit', function (req, res, next) {
    var songExists = (req.query.hasOwnProperty('error') && req.query.error === 'exists');
    res.render('songEdit', {
        title: 'Songbook Creator - Song Editor',
        songText: null,
        songId: null,
        error: songExists ? 'songExists' : null,
        update: ''
    });
});

/* GET Song editor page (:id) = Existing Song */
router.get('/song-edit/:id', function (req, res, next) {
    var getSong = require('../middleware/getSong.js');
    req.app.locals.format = 'text';
    getSong(req, res, function (data) {
        var title = 'Songbook Creator - Song Editor';

        if (!data.hasOwnProperty('status') || data.status === 'fail') {
            if (!data.hasOwnProperty.error) {
                data.error = 'unknownError';
            }
            res.render('songEdit', {
                title: title,
                songText: null,
                error: data.error,
                update: '',
            });
        } else if (data.hasOwnProperty('text')) {
            res.render('songEdit', {
                title: title,
                songText: data.text,
                songId: req.params.id,
                error: '',
                update: 'yes',
            });
        } else {
            res.render('songEdit', {
                title: title,
                songText: null,
                error: 'unknownError',
                update: ''
            });
        }


    });
});

// TODO: Refactor to combine with above

/* GET Song viewer page (:id) = Existing Song */
router.get('/song-view/:id', function (req, res, next) {
    var getSong = require('../middleware/getSong.js');
    req.app.locals.format = 'html';
    getSong(req, res, function (data) {
        var title = 'Songbook Creator - Song Viewer';

        if (!data.hasOwnProperty('status') || data.status === 'fail') {
            if (!data.hasOwnProperty.error) {
                data.error = 'unknownError';
            }
            console.log('/song-view/: ERROR: ' + data.error);
            res.render('songView', {
                title: title,
                songText: null,
                error: data.error,
                update: '',
            });
        } else if (data.hasOwnProperty('html')) {
            res.render('songView', {
                title: title,
                songHtml: data.html,
                songId: req.params.id,
                error: '',
                update: 'yes',
            });
        } else {
            res.render('songView', {
                title: title,
                songText: null,
                error: 'unknownError',
                update: ''
            });
        }

    });
});


/* POST Song editor submission */
router.post('/song-submit', function (req, res, next) {
    var parseSongtext = require('../middleware/parseSongtext.js');
    parseSongtext(req, res, function (data) {
        if (data.hasOwnProperty('status')) {
            if (data.status === 'ok') {
                if (data.hasOwnProperty('songId')){
                    res.redirect('/song-view/' + data.songId + '?songAdded=1');
                } else {
                    res.redirect('/?songAdded=1');
                }
            } else if (data.status === 'fail' && data.hasOwnProperty('error') && data.error === 'songExists') {
                res.redirect('/song-edit/?error=exists');
            }
        }
    });
});

router.post('/song-submit/:id', function (req, res, next) {
    // Force update flag to be set
    req.body.update = 'yes';
    var id = req.params.id;
    var parseSongtext = require('../middleware/parseSongtext.js');
    parseSongtext(req, res, function (data) {
        if (data.hasOwnProperty('status')) {
            if (data.status === 'ok') {
                if (data.hasOwnProperty('songId')){
                    res.redirect('/song-view/' + data.songId + '?songUpdated=1');
                } else {
                    res.redirect('/?songUpdated=1');
                }
            } else if (data.status === 'fail' && data.hasOwnProperty('error')) {
                res.redirect('/song-edit/' + id + '?songUpdated=0');
            }
        }
    });
});



/* DELETE delete song */
router.delete('/song-del/:id', function (req, res, next) {
    var deleteSong = require('../middleware/deleteSong.js');
    deleteSong(req, res, function (data) {
        if (data.hasOwnProperty('status')) {
            if (data.status === 'ok') {
                res.sendStatus(204);
            } else if (data.hasOwnProperty('error')) {
                switch (data.error) {
                    case 'invalidRequest':
                        res.sendStatus(400);
                        break;
                    case 'notFound':
                        res.sendStatus(404);
                        break;
                    case 'unknownError':
                    default:
                        res.status(500).send('Unknown Error');
                }
            } else {
                res.status(500).send('Unknown Error');
            }
        }
    });
});

module.exports = router;
