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

/**
 * Add the song to the current songlist.
 * @param {string} songId - The unique id of the song
 */
function addToSongbook(songList) {
    var x = new XMLHttpRequest();
    x.open('GET', '/songbook-addsong/' + songList.join(';'), true);
    x.onreadystatechange = function () {
        if (x.readyState === XMLHttpRequest.DONE) {
            if (x.status === 204) { // Successful.
                getAllSongs(); // Refresh the song list
            } else if (x.status === 404) { // Unsuccessful
                alert('Unable to add "' + title + '" to the songbook.  Please try again later.');
            }
        }
    };
    x.send();
}



function cbDelSong(evt) {
    var e = evt.target;
    if (!!e) {
        var id = e.parentElement.getAttribute('data-id'),
            title = e.parentElement.getAttribute('data-title');
        if (!!id && !!title) {
            if (confirm('Are you sure you want to delete "' + title + '"?')) {
                deleteSong(id, title, true);
            }
        }
        event.preventDefault();
    }
}

function cbEditSong(evt) {
    var e = evt.target;
    if (!!e) {
        var id = e.parentElement.getAttribute('data-id');
        if (!!id) {
            window.location.href = '/song-edit/' + id;
        }
        event.preventDefault();
    }
}

function cbViewSong(evt) {
    var e = evt.target;
    if (!!e) {
        var id = e.parentElement.getAttribute('data-id');
        if (!!id) {
            window.location.href = '/song-view/' + id;
        }
        event.preventDefault();

    }
}

function updateArrows() {
    var checkCount = document.getElementsByClassName('song selected').length;
    var eLeft = document.getElementById('leftArrow');
    if (!checkCount) {
        eLeft.className = 'arrow disabled';
    } else if (checkCount === 1) {
        eLeft.className = 'arrow';
    }
}

function cbToggleSong(evt) {
    var e = evt.target;
    var ePar = evt.target.parentElement;

    if (!!e.checked) {
        ePar.className = 'song selected';
    } else {
        ePar.className = 'song';
    }

    // Make sure arrows have correct state
    updateArrows();

}

function cbAddToSongbook(evt) {
    var e = evt.target;
    // If disabled, stop
    if (e.className.match(/disabled/)) {
        return;
    }

    // Ajax call to move
    var songList = [];
    var checkedNodes = document.getElementsByClassName('selected');

    // Maximum moves at a time
    if (checkedNodes.length > 20) {
        alert('Sorry, no more than 20 songs may be added at once');
        return;
    }

    for (var i = 0; i < checkedNodes.length; i++) {
        songList.push(checkedNodes[i].getAttribute('data-id'));
    }

    addToSongbook(songList);
}

function cbRemoveFromSongbook(evt) {
    var e = evt.target;
    // If disabled, stop
    if (e.className.match(/disabled/)) {
        return;
    }

    // Ajax call to move
}



function createButton(name, handlerFunction, attr) {
    var e = document.createElement('input');
    e.setAttribute('type', 'button');
    e.classList.add('btn' + name);
    e.setAttribute('value', name);
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

            eLi.className = 'song';

            // Attributes for buttons
            var attr = {};

            if (songs[i].hasOwnProperty('title')) {
                eLi.setAttribute('data-title', songs[i].title);
            }
            if (songs[i].hasOwnProperty('_id')) {
                eLi.setAttribute('data-id', songs[i]._id);
            }

            // Buttons
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

            // Song name
            var eName = document.createElement('span');
            eName.className = 'songName';
            if (songs[i].hasOwnProperty('title')) {
                eName.innerHTML = songs[i].title;
            }
            eLi.appendChild(eName);

            var eCheck = document.createElement('input');
            eCheck.setAttribute('type', 'checkbox');
            eCheck.addEventListener('change', cbToggleSong);
            eLi.appendChild(eCheck);

            eUl.appendChild(eLi);
        }
        eMain.appendChild(eUl);
    }

    // Enable add (+) button
    var eAdd = document.getElementById('addSong');
    eAdd.classList.remove('hidden');

    updateArrows();
}

function ajaxGetRequest(url, callback) {
    var x = new XMLHttpRequest();
    x.open('GET', url, true);
    x.onreadystatechange = function () {
        if (x.readyState === XMLHttpRequest.DONE && x.status === 200) {
            var data = JSON.parse(x.responseText);
            callback(data);
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


    // Arrows
    var eLeft = document.getElementById('leftArrow');
    eLeft.addEventListener('click', cbAddToSongbook);

    var eRight = document.getElementById('rightArrow');
    eRight.addEventListener('click', cbRemoveFromSongbook);
};
