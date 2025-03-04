// piano.js
function generateKeys(octaves = ["C4", "C5"], extraHighCAfter = true) {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    let keys = [];

    octaves.forEach(octave => {
        const octaveNum = octave.slice(-1);
        notes.forEach(note => {
            const fullNote = `${note}${octaveNum}`;
            const keyClass = note.includes("#") ? "key black" : "key";
            keys.push(`<div class="${keyClass}" data-note="${fullNote}"></div>`);
        });
    });

    if (extraHighCAfter) {
        const lastOctaveNum = parseInt(octaves[octaves.length - 1].slice(-1)) + 1;
        const extraC = `<div class="key" data-note="C${lastOctaveNum}"></div>`;
        keys.push(extraC);
    }

    return `<div class="piano">\n${keys.join("\n")}\n</div>`;
}

// Usage: Add the piano keys to the "piano_container" div
function addPianoToContainer() {
    // Generate the piano keys
    const pianoKeys = generateKeys(["C4", "C5"], true);

    // Select the "piano_container" div
    const pianoContainer = document.getElementById("pianocontainer");

    // Add the generated piano keys to the container
    pianoContainer.innerHTML = pianoKeys;
}

// Call the function to add the piano to the container
addPianoToContainer();

// Create a new sampler to play sounds via Tone.js
// The sampler is bright enough to generate sounds for higher octaves (e.g., C5) even if it
// only has samples for lower octaves (e.g., C4), so there is no need to add more octaves to the piano.
const piano = new Tone.Sampler({
    urls: {
        "C4": "C4.mp3",
        "C#4": "Db4.mp3",
        "Db4": "Db4.mp3",
        "D4": "D4.mp3",
        "D#4": "Eb4.mp3",
        "Eb4": "Eb4.mp3",
        "E4": "E4.mp3",
        "F4": "F4.mp3",
        "F#4": "Gb4.mp3",
        "Gb4": "Gb4.mp3",
        "G4": "G4.mp3",
        "Ab4": "Ab4.mp3",
        "G#4": "Ab4.mp3",
        "A4": "A4.mp3",
        "A#4": "Bb4.mp3",
        "Bb4": "Bb4.mp3",
        "B4": "B4.mp3",
    },
    baseUrl: "https://gleitz.github.io/midi-js-soundfonts/FatBoy/acoustic_grand_piano-mp3/", // Piano soundfont
    onload: () => {
        console.log("Piano loaded!");
    }
}).toDestination();

let isMouseDown = false; // Track if the mouse button is pressed
let lastPlayedNote = null; // Track the last played note to avoid repeats

// Function to play a note
function playNote(note) {
    if (Tone.context.state !== 'running') {
        Tone.context.resume(); // Resume the AudioContext if it's suspended
    }
    piano.triggerAttackRelease(note, "8n"); // Play the note for an 8th note duration
}

const keys = document.querySelectorAll('.key');

// Function to highlight a key, e.g., to show when a note is played, or to instruct somebody which key to press
// @param {String} note - The note to highlight, e.g., "C", "D#", "F#"
// @param {Number} highlightTime - The time in milliseconds to keep the key highlighted. Set to 0 to keep it highlighted indefinitely.
function highlightKey(note, highlightTime = 0) {
    keys.forEach(key => {
        if (key.dataset.note === note) {
            key.classList.add('highlighted');
            if (highlightTime > 0) {
                setTimeout(() => {
                    key.classList.remove('highlighted');
                }, highlightTime);
            }
        }
    });
}

// Function to remove all highlights
function removeHighlights() {
    keys.forEach(key => {
        key.classList.remove('highlighted');
    });
}

// Add event listeners to each key
keys.forEach(key => {
    key.addEventListener('mousedown', () => {
        isMouseDown = true;
        key.classList.add('active');
        // Play sound or perform other actions here
        const note = key.dataset.note;
        console.log(note);
        playNote(note);
        lastPlayedNote = note;
    });

    // Handle mouse move
    key.addEventListener('mousemove', () => {
        if (isMouseDown) {
            key.classList.add('active');
            const note = key.dataset.note;
            if (note !== lastPlayedNote) { // Avoid playing the same note repeatedly
                playNote(note);
                lastPlayedNote = note; // Update the last played note
            }
        }
    });

    // Handle mouse up
    key.addEventListener('mouseup', () => {
        isMouseDown = false;
        lastPlayedNote = null; // Reset the last played note
    });

    // Handle mouse leave
    key.addEventListener('mouseleave', () => {
        key.classList.remove('active');
    });
});

// Handle mouse up globally (in case the mouse is released outside a key)
document.addEventListener('mouseup', () => {
    isMouseDown = false;
    lastPlayedNote = null; // Reset the last played note
});

// Trigger a note when a key is pressed on the computer keyboard. In that case, we also highlight the key.
function triggerNote(note) {
    playNote(note);
    highlightKey(note, 200);
}

document.addEventListener('keydown', (event) => {
    const keyMap = {  // TODO: this keymap is specific to English/German keyboards, provide alternatives for other keyboard layouts.
        'a': 'C4', // flats
        's': 'D4',
        'd': 'E4',
        'f': 'F4',
        'g': 'G4',
        'h': 'A4',
        'j': 'B4',
        'k': 'C5',
        'A': 'C#4', // sharps
        'w': 'C#4',
        'S': 'D#4',
        'e': 'D#4',
        'F': 'F#4',
        't': 'F#4',
        'G': 'G#4',
        'y': 'G#4',
        'z': 'G#4',  // also allow z as replacement for y (for German QWERTZ keyboards)
        'H': 'A#4',
        'u': 'A#4'
    };

    const note = keyMap[event.key]; // Get the corresponding note
    if (note) { // If the key is in the keyMap
        triggerNote(note); // Play the note
    }
});