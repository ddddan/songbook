function cbEdit(evt) {
    window.location.href = '/song-edit/' + songId;
}

function cbHome() {
    window.location.href = '/';
}

function cbHomeScreen() {
    // Redirect to home
    window.location.href = '/';
}

window.onload = function () {
    document.getElementById('edit').addEventListener('click', cbEdit);
    document.getElementById('home').addEventListener('click', cbHome);

    // Home page:
    document.getElementById('header').addEventListener('click', cbHomeScreen);
};
