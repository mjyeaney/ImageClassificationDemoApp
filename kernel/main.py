#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import time
import io
import json
import logging
import random

# setup logging
root = logging.getLogger()
root.setLevel(logging.DEBUG)
handler = logging.StreamHandler(sys.stdout)
handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('[KERNEL] %(levelname)s - %(message)s')
handler.setFormatter(formatter)
root.addHandler(handler)

# Confguration details...could load from external sources
INPUT_FILE_LOCATION = "./data/images"
OUTPUT_FILE_LOCATION = "./data/results"
POLL_DELAY = 0.25
INITIAL_FILE_LIST = dict ([(f, None) for f in os.listdir (INPUT_FILE_LOCATION)])

def compute_results(inputFile):
    """
    Picks up the input image file, and calls the underlying model/compute methods to 
    compute a result.

    Note this using the file system to avoid passing massive amounts of data via STDIN/STDOUT.
    This is slower, but we don't have to deal with blocking buffer issues, and also helps
    the testability of the different parts of the application.
    """
    logging.info(f"Processing {inputFile}")
    cleanFileName = inputFile.replace(".png", "")

    with open(f"{OUTPUT_FILE_LOCATION}/{cleanFileName}.json", "a") as resultFile:

        # simulate some computational work
        time.sleep(2)

        # Just a sample results structure - real one can plug in later
        results = {
            "weights": [
                random.uniform(0, 1),
                random.uniform(0, 1),
                random.uniform(0, 1),
                random.uniform(0, 1)
            ],
            "labels": [
                "No Problems",
                "Needs cleaned",
                "Damaged",
                "Other"
            ]
        }

        # Log outputs...can clean this up later
        logging.info(f"Finished processing {inputFile}...results:")
        logging.info(json.dumps((results)))
        resultFile.write(json.dumps(results))

def poll_input_files():
    """
    Polls the specified input folder for any new files. This is done by tracking the difference 
    in results. This could be faster by leveraging the WIN32 FileChangeAPI, but this code aims to 
    be more cross-platform and easier to digest. 
    """
    global POLL_DELAY
    global INITIAL_FILE_LIST    

    newFiles = dict ([(f, None) for f in os.listdir (INPUT_FILE_LOCATION)])
    added = [f for f in newFiles if not f in INITIAL_FILE_LIST]

    if added: 
        POLL_DELAY = 0.25
        listOfAdded = ", ".join(added)
        logging.info(f"Found: {listOfAdded}")
        compute_results(added[0])
    
    INITIAL_FILE_LIST = newFiles

def init():
    """
    Main startup routine; essentially gets the polling loop running.
    """
    logging.info("Starting main polling loop")

    global POLL_DELAY

    while True:
        poll_input_files()
        time.sleep(POLL_DELAY)

        # If none found, increment backoff delay
        POLL_DELAY *= 2

        if (POLL_DELAY > 2):
            POLL_DELAY = 2

if __name__ == "__main__":
    init()