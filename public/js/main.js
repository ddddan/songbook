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
        eP.innerHTML = 'No songs found. Click the + sign to add songs';
        eMain.appendChild(eP);
        return;
    }

    // Otherwise populate the list
    var eUl = document.createElement('ul');
    for (var i = 0; i < songs.length; i++) {
        var eLi = document.createElement('li');
        if (songs[i].hasOwnProperty('title')) {
            eLi.innerHTML = songs[i].title;
        }
        eUl.appendChild(eLi);
    }
    eMain.appendChild(eUl);
}

function ajaxRequest(url, callback) {
       var x = new XMLHttpRequest();
    x.open('GET', url , true);
    x.onreadystatechange = function () {
        if (x.readyState === XMLHttpRequest.DONE && x.status === 200) {
            var songs = JSON.parse(x.responseText);
            callback(songs);
        }
    };
    x.send();
}

function getSongbooks() {
    // ajaxRequest('/songbooks', updateSongbooks);
}

function getAllSongs() {
    ajaxRequest('/songlist', updateSonglist);
}


window.onload = function () {
    getSongbooks();
    getAllSongs();
};
