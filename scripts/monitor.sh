#!/bin/bash

WATCH_DIR=~/data
DOCKERFILE_SRC=~/dockerfile_av_image/clamav/Dockerfile
SCAN_SCRIPT_SRC=~/dockerfile_av_image/clamav/scan_script.sh
PULUMI_DIR=~/pulumi_script
VENV_DIR=$PULUMI_DIR/venv

process_directory() {
    local USER_DIR=$1
    local ID=$(basename "$USER_DIR")
    echo "Processing directory: $USER_DIR with ID: $ID"

    mkdir -p "$USER_DIR/cont"
    mkdir -p "$USER_DIR/temp_file"
    mkdir -p "$USER_DIR/temp_log"

    echo "Created directories cont, temp_file, and temp_log in $USER_DIR"

    if [ -f "$DOCKERFILE_SRC" ]; then
        cp "$DOCKERFILE_SRC" "$USER_DIR/cont"
        cp "$SCAN_SCRIPT_SRC" "$USER_DIR/cont"  
        echo "Copied Dockerfile to $USER_DIR/cont"
    fi

    for FILE in "$USER_DIR"/*; do
        if [ -f "$FILE" ] && [[ "$FILE" != *"/cont/"* ]] && [[ "$FILE" != *"/temp_file/"* ]] && [[ "$FILE" != *"/temp_log/"* ]] && [[ "$FILE" != *"Dockerfile"* ]]; then
            cp "$FILE" "$USER_DIR/cont"
            mv "$FILE" "$USER_DIR/temp_file"
            echo "Moved file $FILE to $USER_DIR/temp_file and copied to $USER_DIR/cont"
        fi
    done

    source "$VENV_DIR/bin/activate"
    (cd $PULUMI_DIR && pulumi stack select "user_$ID" || pulumi stack init "user_$ID")
    (cd $PULUMI_DIR && pulumi config set user_id $ID && pulumi up --yes)

    rm "$USER_DIR/cont/"*

}

inotifywait -m -r -e create,modify,moved_to --format '%w%f' "$WATCH_DIR" | while read NEW_ITEM
do
    echo "Detected change: $NEW_ITEM"
    if [ -d "$NEW_ITEM" ] && [[ "$NEW_ITEM" != *"/cont"* ]] && [[ "$NEW_ITEM" != *"/temp_file"* ]] && [[ "$NEW_ITEM" != *"/temp_log"* ]]; then   
        echo "New directory created: $NEW_ITEM"
        process_directory "$NEW_ITEM"
    elif [ -f "$NEW_ITEM" ]; then   
        USER_DIR=$(dirname "$NEW_ITEM")
        if [[ "$USER_DIR" != *"/cont"* ]] && [[ "$USER_DIR" != *"/temp_file"* ]] && [[ "$USER_DIR" != *"/temp_log"* ]]; then
            echo "New file created or modified: $NEW_ITEM in directory: $USER_DIR"
            process_directory "$USER_DIR"
        fi
    fi
done
