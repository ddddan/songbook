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

            var eDel = document.createElement('input');
            eDel.setAttribute('type', 'button');
            eDel.classList.add('btnDel');
            eDel.setAttribute('value', 'Del');
            // eDel.addEventListener('click', delSong);
            eLi.appendChild(eDel);

            var eEdit = document.createElement('input');
            eEdit.setAttribute('type', 'button');
            eEdit.classList.add('btnEdit');
            eEdit.setAttribute('value', 'Edit');
            eLi.appendChild(eEdit);

            var eName = document.createElement('span');
            if (songs[i].hasOwnProperty('title')) {
                var title = songs[i].title;
                eName.innerHTML = title;
                eDel.setAttribute('data-title', title);
                eEdit.setAttribute('data-title', title);
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

function ajaxRequest(url, callback) {
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
    // ajaxRequest('/songbooks', updateSongbooks);
}

function getAllSongs() {
    ajaxRequest('/songlist', updateSonglist);
}

function addSong() {
    // Redirect to the song editor
    window.location.href = '/song-edit';
}


window.onload = function () {
    getSongbooks();
    getAllSongs();

    // Event listeners
    document.getElementById('addSong').addEventListener('click', addSong);
};
