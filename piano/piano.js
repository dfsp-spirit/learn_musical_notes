// Non-module version of the piano code
function initializePiano(options = {}) {
    const {
        octaves = ["C4", "C5"],
        extraHighCAfter = true,
        baseUrl = "https://gleitz.github.io/midi-js-soundfonts/FatBoy/acoustic_grand_piano-mp3/", // ... or to use local files: "./samples/",
        containerId = "pianocontainer",
    } = options;

    // Function to generate piano keys (the HTML structure)
    function generateKeys(octaves, extraHighCAfter) {
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

    // Add the piano keys to the container
    const pianoContainer = document.getElementById(containerId);
    if (!pianoContainer) {
        console.error(`Container with ID "${containerId}" not found on page. Cannot add piano.`);
        return;
    }
    pianoContainer.innerHTML = generateKeys(octaves, extraHighCAfter);

    // Create a new sampler to play sounds via Tone.js.
    // Note that the sampler can play tones which are not listed in the sounds
    // below, e.g., it can generate and play "C5" even if there is no "C5.mp3" file.
    // So even when adding more keys/octaves to the piano, there is no need to add
    // more sounds to the sampler.
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
        baseUrl: baseUrl,
        onload: () => {
            console.log("Piano loaded!");
        }
    }).toDestination();

    let isMouseDown = false; // Track if the mouse button is pressed
    let lastPlayedNote = null; // Track the last played note to avoid repeats

    // Function to play a note
    // @param note: the note to play (e.g., "C4")
    function playNote(note) {
        if (Tone.context.state !== 'running') {
            Tone.context.resume(); // Resume the AudioContext if it's suspended
        }
        piano.triggerAttackRelease(note, "8n"); // Play the note for an 8th note duration
    }

    const keys = document.querySelectorAll('.key');

    // Function to highlight a key
    // @param note: the note to highlight (e.g., "C4")
    // @param highlightTime: the time in milliseconds to keep the key highlighted. Set to 0 to keep it highlighted indefinitely.
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

    // Function to remove all highlights from the keys.
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
            const note = key.dataset.note;
            console.log(note);
            playNote(note);
            lastPlayedNote = note;
        });

        key.addEventListener('mousemove', () => {
            if (isMouseDown) {
                key.classList.add('active');
                const note = key.dataset.note;
                if (note !== lastPlayedNote) {
                    playNote(note);
                    lastPlayedNote = note;
                }
            }
        });

        key.addEventListener('mouseup', () => {
            isMouseDown = false;
            lastPlayedNote = null;
        });

        key.addEventListener('mouseleave', () => {
            key.classList.remove('active');
        });
    });

    // Handle mouse up globally. This is required to stop the sound when the mouse is released outside the keys.
    document.addEventListener('mouseup', () => {
        isMouseDown = false;
        lastPlayedNote = null;
    });

    // Trigger a note (used when a key is pressed on the computer keyboard via the key event listener)
    function triggerNote(note) {
        playNote(note);
        highlightKey(note, 200);
    }

    // Add event listener for computer keyboard, to allow the user to play via the keyboard in addition to the mouse.
    document.addEventListener('keydown', (event) => {
        const keyMap = {
            'a': 'C4', 's': 'D4', 'd': 'E4', 'f': 'F4', 'g': 'G4', 'h': 'A4', 'j': 'B4', 'k': 'C5',
            'A': 'C#4', 'w': 'C#4', 'S': 'D#4', 'e': 'D#4', 'F': 'F#4', 't': 'F#4', 'G': 'G#4', 'y': 'G#4', 'z': 'G#4',
            'H': 'A#4', 'u': 'A#4'
        };

        const note = keyMap[event.key];
        if (note) {
            triggerNote(note);
        }
    });
}

// Initialize the piano with default settings
initializePiano();