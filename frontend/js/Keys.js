var Keys = {};


let sKeyPressed = false;
let keyPressedBools = {};
let keyTimers = {};
var letterPattern = /^[a-z0-9]$/;



$(document).on('keydown', function (event) {
    if (letterPattern.test(event.key)) {
        if (! keyPressedBools[event.key]) {
            keyPressedBools[event.key] = true;
            keyTimers[event.key] = setTimeout(function() {
                Keys.heldDown(event.key)
                keyTimers[event.key] = null;
            }, 400);
        }
    }
});



$(document).on('keyup', function (event) {
    if (letterPattern.test(event.key)) {
        if(keyTimers[event.key]) {
            // timer still going but key up, so key was just tapped
            Keys.tapped(event.key)
        } else {
            Keys.released(event.key)
        }
        keyPressedBools[event.key] = false;
        clearTimeout(keyTimers[event.key]);
    }
});



Keys.heldDown = function(key) {
    console.log(key + " key is held down.");
    Recorder.startRecord(key)
}

Keys.tapped = function(key) {
    console.log(key + " key tapped.");
    var lastr = Recorder.getLastRecording(key);
    const lastAudio = document.getElementById(lastr.id);
    lastAudio.play()

}

Keys.released = function(key) {
    console.log(key + " key is released.");
    Recorder.stopRecord(key)
}
