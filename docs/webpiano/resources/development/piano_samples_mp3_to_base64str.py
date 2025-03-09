#!/usr/bin/which python3
#
# This script reads MP3 files from a directory and generates a sounds.js file, with the MP3 data encoded as Base64 strings.
# We use this to prevent CORS issues when loading local audio files in the browser: MP3 files cannot be loaded directly, so
# we encode them as Base64 strings and use the data URI scheme to embed them in the JavaScript code.
#
# This allows using the WebPiano offline without a server, by loading the sounds from the local filesystem. If you have a webserver,
# you can simply serve the MP3 files and load them directly in the WebPiano.
#
# This script has already been run during development, to produce the file `sounds.js`. Unless you change samples or add new ones,
# you don't need to run this script again. If you do, make sure to update the `INPUT_FOLDER` variable to point to the correct directory.
#

import base64
import os

# Directory where your MP3 files are located
INPUT_FOLDER = "./samples/"  # Change this if needed
OUTPUT_FILE = "sounds.js"


def encode_mp3_to_base64(mp3_file):
    """Reads an MP3 file and encodes it as a Base64 string."""
    with open(mp3_file, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

def sanitize_filename(filename):
    """Removes file extension and ensures valid JS object key."""
    return filename.replace("#", "s").replace(".mp3", "")

def generate_sounds_js():
    print(f"Reading MP3 files from {INPUT_FOLDER}...")
    """Generates a sounds.js file with Base64-encoded MP3 data."""
    sound_files = [f for f in os.listdir(INPUT_FOLDER) if f.endswith(".mp3")]

    if not sound_files:
        print("No MP3 files found in the directory.")
        return

    sounds_dict = {}
    for file in sound_files:
        key = sanitize_filename(file)
        base64_data = encode_mp3_to_base64(os.path.join(INPUT_FOLDER, file))
        sounds_dict[key] = f"data:audio/mp3;base64,{base64_data}"
        print(f"Encoded {file} as {key}")

    # Write to sounds.js
    with open(OUTPUT_FILE, "w", encoding="utf-8") as js_file:
        js_file.write("const sounds = {\n")
        for key, base64_str in sounds_dict.items():
            js_file.write(f'    "{key}": "{base64_str}",\n')
        js_file.write("};\n")

    print(f"Generated file '{OUTPUT_FILE}' with {len(sounds_dict)} sounds.")
    print(f"IMPORTANT: Make sure to copy the '{OUTPUT_FILE}' file to the 'webpiano' directory when you are happy with it.")

if __name__ == "__main__":
    generate_sounds_js()
