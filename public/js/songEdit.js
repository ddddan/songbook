/* songEdit.js - Handle Song Editor submission */


function updateSubmitStatus(evt) {
    var e = evt.target,
        eSubmit = document.getElementById('submit');
    if (!!e.value) {
        eSubmit.removeAttribute('disabled');
    } else {
        eSubmit.setAttribute('disabled',true);
    }
}

function submit(evt) {

}


window.onload = function () {
    var eSongText = document.getElementById('songtext'),
        eSubmit = document.getElementById('submit');

    // Event listeners
    eSongText.addEventListener('input', updateSubmitStatus);
    eSongText.addEventListener('propertychange', updateSubmitStatus);
    // eSubmit.addEventListener('click', submit);
};
