/**
 * Delete the song via ajax delete request
 * @param {string} id    - unique id of the song
 * @param {string} title - song title
 */
function deleteSong(id, title, confirm) {
    if (!confirm || confirm !== true) {
        return;
    }
    var x = new XMLHttpRequest();
    x.open('DELETE', '/song-del/' + id + '?confirm=1', true);
    x.onreadystatechange = function () {
        if (x.readyState === XMLHttpRequest.DONE) {
            if (x.status === 204) { // Successful.
                alert('Delete successful.');
                getAllSongs(); // Refresh the song list
            } else if (x.status === 404) { // Unsuccessful
                alert('Unable to delete "' + title + '".  Please try again later.');
            }
        }
    };
    x.send();
}



function cbDelSong(evt) {
    var e = evt.target;
    if (!!e) {
        var id = e.getAttribute('data-id'),
            title = e.getAttribute('data-title');
        if (!!id && !!title) {
            if (confirm('Are you sure you want to delete "' + title + '"?')) {
                deleteSong(id, title, true);
            }
        }
    }
}

function cbEditSong(evt) {
    var e = evt.target;
    if (!!e) {
        var id = e.getAttribute('data-id');
        if (!!id) {
            window.location.href = '/song-edit/' + id;
        }
    }
}

function cbViewSong(evt) {
    var e = evt.target;
    if (!!e) {
        var id = e.getAttribute('data-id');
        if (!!id) {
            window.location.href = '/song-view/' + id;
        }
    }
}


function createButton(name, handlerFunction, attr) {
    var e = document.createElement('input');
    e.setAttribute('type', 'button');
    e.classList.add('btn' + name);
    e.setAttribute('value', name);
    if (!!attr) {
        for (k in attr) {
            if (attr.hasOwnProperty(k)) {
                e.setAttribute('data-' + k, attr[k]);
            }
        }
    }
    if (!!handlerFunction) {
        e.addEventListener('click', handlerFunction);
    }
    return e;
}


function updateSonglist(songs) {
    var eMain = document.getElementById('songsMain');
    // Clear out any existing content
    var eChild = eMain.firstChild;
    while (!!eChild) {
        eMain.removeChild(eChild);
        eChild = eMain.firstChild;
    }

    // Handle empty set
    if (!songs.length) {
        var eP = document.createElement('p');
        eP.innerHTML = 'No songs found. Click the "New" button to add songs';
        eMain.appendChild(eP);
    } else {

        // Otherwise populate the list
        var eUl = document.createElement('ul');
        for (var i = 0; i < songs.length; i++) {
            var eLi = document.createElement('li');

            var attr = {};

            if (songs[i].hasOwnProperty('title')) {
                attr.title = songs[i].title;
            }
            if (songs[i].hasOwnProperty('_id')) {
                attr.id = songs[i]._id;
            }

            var elems = {
                Del: cbDelSong,
                Edit: cbEditSong,
                View: cbViewSong,
            };
            for (var k in elems) {
                if (elems.hasOwnProperty(k)) {
                    var e = createButton(k, elems[k], attr);
                    eLi.appendChild(e);
                }
            }

            var eName = document.createElement('span');
            if (songs[i].hasOwnProperty('title')) {
                eName.innerHTML = songs[i].title;
            }
            eLi.appendChild(eName);

            eUl.appendChild(eLi);
        }
        eMain.appendChild(eUl);
    }

    // Enable add (+) button
    var eAdd = document.getElementById('addSong');
    eAdd.classList.remove('hidden');
}

function ajaxGetRequest(url, callback) {
    var x = new XMLHttpRequest();
    x.open('GET', url, true);
    x.onreadystatechange = function () {
        if (x.readyState === XMLHttpRequest.DONE && x.status === 200) {
            var songs = JSON.parse(x.responseText);
            callback(songs);
        }
    };
    x.send();
}

function getSongbooks() {
    // ajaxGetRequest('/songbooks', updateSongbooks);
}

function getAllSongs() {
    ajaxGetRequest('/songlist', updateSonglist);
}

function cbAddSong() {
    // Redirect to the song editor
    window.location.href = '/song-edit';
}


window.onload = function () {
    getSongbooks();
    getAllSongs();

    // Default event listeners

    // Add button
    document.getElementById('addSong').addEventListener('click', cbAddSong);
};
