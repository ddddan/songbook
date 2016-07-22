/* Simple authentication based on a json like this:

{
  "server": "<server>"  // The mongodb server
  "user": "<user>", // User name
  "pass": "<pass>", // Password
}

This should be stored in /.private/credentials.json - must be built independently.

Also at this point the db and collection have to exist. In the mongo shell you can just do:

> use songbook
> db.createCollection('songs');

*/

/* PACKAGES */
var fs = require('fs'),
    test = require('assert'),
    util = require('util');


function auth() {
    try {
        var file = fs.readFileSync('.private/credentials.json');
        var cred = JSON.parse(file);
        if (!cred || !cred.hasOwnProperty('server') || !cred.hasOwnProperty('user') || !cred.hasOwnProperty('pass')) {
            throw new Error('Missing or malformed credentials.json');
        } else {
            return 'mongodb://' + cred.user + ':' + cred.pass + '@' + cred.server + '/songbook';
        }

    } catch (err) {
        console.log(util.inspect(err, {
            colors: true,
            depth: 0
        }));
        return null;
    }

}

module.exports = auth;
