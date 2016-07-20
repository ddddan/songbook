/* songEdit.js - Handle Song Editor submission */


function updateSubmitStatus(evt) {
    var e = document.getElementById('songtext'),
        eSubmit = document.getElementById('submit');
    if (!!e.value) {
        eSubmit.removeAttribute('disabled');
    } else {
        eSubmit.setAttribute('disabled', true);
    }
}

function cbSubmit(evt) {

}

function cbCancel() {
    window.location.href = '/?cancelEdit=1';
}


window.onload = function () {
    var eSongText = document.getElementById('songtext'),
        eSubmit = document.getElementById('submit'),
        eCancel = document.getElementById('cancel');

    updateSubmitStatus(); // In case this is pre-populated

    // Event listeners
    eSongText.addEventListener('input', updateSubmitStatus);
    eSongText.addEventListener('propertychange', updateSubmitStatus);

    // eSubmit.addEventListener('click', cbSubmit);
    eCancel.addEventListener('click', cbCancel);
};
