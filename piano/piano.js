// Non-module version of the piano code
function initializePiano(options = {}) {
    let {
        octaves = ["C4", "C5"],
        extraHighCAfter = true,
        baseUrl = "https://gleitz.github.io/midi-js-soundfonts/FatBoy/acoustic_grand_piano-mp3/",
        //baseUrl = "./resources/samples/",  // If you want to server samples yourself locally. But due to CORS restrictions, this will only work locally if using a web server to serve this page (simply opening the HTML file by double-clicking will not work).
        containerId = "pianocontainer",
        current_keymap = localStorage.getItem("current_keymap") || "EN"  // Default keymap is English, try "en", "de", "fr" for QWERTY, QWERTZ, AZERTY keyboards
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

        const keyboardLayoutDropdown = `<div class="keyboard-layout-dropdown" title="Choose your keyboard layout to map the middle row of keys to the C4 octave. (Press Shift or the upper row for sharps.)">
        <select id="keyboard-layout">
        </select>
    </div>`;

        const piano = `<div class="piano">\n${keys.join("\n")}\n</div>`;
        return keyboardLayoutDropdown + piano;
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

    // Provide several keymaps for different keyboards. For now, we only provide some basic western keymaps.
    // Feel free to add more keymaps if needed.
    // Keymaps are stored in a dictionary. The key is the language code (e.g., "en" for English).
    const keymaps = {
        "EN": {  // QWERTY keyboard
            'a': 'C4', 's': 'D4', 'd': 'E4', 'f': 'F4', 'g': 'G4', 'h': 'A4', 'j': 'B4', 'k': 'C5',
            'A': 'C#4', 'w': 'C#4', 'S': 'D#4', 'e': 'D#4', 'F': 'F#4', 't': 'F#4', 'G': 'G#4', 'y': 'G#4',
            'H': 'A#4', 'u': 'A#4'
        },
        "DE": { // QWERTZ keyboard
            'a': 'C4', 's': 'D4', 'd': 'E4', 'f': 'F4', 'g': 'G4', 'h': 'A4', 'j': 'B4', 'k': 'C5',
            'A': 'C#4', 'w': 'C#4', 'S': 'D#4', 'e': 'D#4', 'F': 'F#4', 't': 'F#4', 'G': 'G#4', 'z': 'G#4',
            'H': 'A#4', 'u': 'A#4'
        },
        "FR": { // AZERTY keyboard
            'a': 'C4', 'z': 'D4', 'e': 'E4', 'r': 'F4', 't': 'G4', 'y': 'A4', 'u': 'B4', 'i': 'C5',
            'q': 'C#4', 's': 'D#4', 'd': 'F#4', 'f': 'G#4', 'g': 'A#4'
        },
        "--" : { // Dummy keymap to disable computer keyboard input. Useful for touch devices or webpages that have their own keyboard input.
        }
        // Add more keymaps here if needed
    };

    // Function to dynamically populate the select element
    function populateSelect() {
        const selectElement = document.getElementById("keyboard-layout");

        // Clear any existing options
        selectElement.innerHTML = '';

        // Loop through the keymaps object to create options
        for (const keymap in keymaps) {
            if (keymaps.hasOwnProperty(keymap)) {
                const option = document.createElement("option");
                option.value = keymap;
                option.textContent = keymap.toUpperCase(); // Option text as "EN", "DE", "FR"

                // Set the selected option based on the current_keymap variable
                if (keymap === current_keymap) {
                    option.selected = true;
                }

                selectElement.appendChild(option);
                console.log("Appending option:", keymap); // This line is just for debugging
            }
        }

        // Add an event listener to update the current_keymap when the user selects an option
        selectElement.addEventListener('change', function() {
            current_keymap = selectElement.value;
            localStorage.setItem("current_keymap", current_keymap); // Save the selected keymap to localStorage
            console.log("Selected keymap:", current_keymap); // This line is just for debugging
        });
    }

    // Call the function to populate the select element
    populateSelect();

    // Add event listener for computer keyboard, to allow the user to play via the keyboard in addition to the mouse.
    document.addEventListener('keydown', (event) => {
        const keyMap = keymaps[current_keymap];

        const note = keyMap[event.key];
        if (note) {
            triggerNote(note);
        }
    });
}

// Initialize the piano with default settings
initializePiano();