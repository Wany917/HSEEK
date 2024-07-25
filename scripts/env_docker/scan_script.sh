#!/bin/bash
set -e

cleanup() {
    mv $LOG_FILE log/ || echo "Failed to move file: $?"
}

trap cleanup EXIT

LOG_FILE=$(date +'%d-%m-%Y_%H-%M-%S').txt

clamscan . --log=$LOG_FILE &
CLAMSCAN_PID=$!
wait $CLAMSCAN_PID