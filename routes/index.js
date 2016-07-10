var express = require('express');
var router = express.Router();
var parseSongtext = require('../middleware/parseSongtext.js');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Songbook Creator'
    });
});

/* GET Song editor page */
router.get('/song-edit', function (req, res, next) {
    res.render('songEdit', {
        title: 'Songbook Creator - Song Editor'
    });
});

/* POST Song editor submission */
router.post('/song-submit', function (req, res, next) {
    parseSongtext(req, res, next);
});

module.exports = router;
