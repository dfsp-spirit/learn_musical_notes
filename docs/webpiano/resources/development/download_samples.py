#!/usr/bin/env python
#
#
# This script downloads the MP3 samples for the WebPiano from the FatBoy soundfont repository from Github.com.
# The samples are downloaded to the `samples` directory, where they can be used by the WebPiano.
# The output directory is already filled with the samples used by the WebPiano, so you don't need to run this script unless you want to update the samples.
#


import requests   # pip install requests
import os

# Base URL
BASE_URL = "https://gleitz.github.io/midi-js-soundfonts/FatBoy/acoustic_grand_piano-mp3/"

# List of musical notes
notes = [
    "C4", "Db4", "D4", "Eb4", "E4", "F4", "Gb4", "G4", "Ab4", "A4", "Bb4", "B4"
]

# Output directory
OUTPUT_DIR = "./samples/"
os.makedirs(OUTPUT_DIR, exist_ok=True)

num_ok = 0

# Download files
for note in notes:
    file_name = f"{note}.mp3"
    url = BASE_URL + file_name
    output_path = os.path.join(OUTPUT_DIR, file_name)

    print(f"Downloading {file_name}...")
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()

        with open(output_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"Saved {file_name}")
        num_ok += 1
    except requests.exceptions.RequestException as e:
        print(f"Failed to download {file_name}: {e}")

print(f"Download completed. {num_ok} files saved in {OUTPUT_DIR}. There were {len(notes) - num_ok} errors.")

