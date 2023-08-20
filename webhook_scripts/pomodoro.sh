#!/bin/bash

log_file="./docker_webhook/webhook.log"

module_name="pomodoro.sh"

log() {
    local timestamp=$(date "+%Y-%m-%d %H:%M:%S,%3N")
    local level="$1"
    local message="$2"
    echo "$timestamp - $module_name - $level - $message" >> "$log_file"
}

repoName="$1"
tagName="$2"
containerName="pomodoro"

# Pull new Docker image
./docker_webhook/scripts/pullNewImageFromDocker.sh $repoName $tagName && 

# If pull new Docker image successfull: 
# Stop and remove existed pomodoro container
./docker_webhook/scripts/stopDockerContainer.sh $containerName && 
./docker_webhook/scripts/removeDockerContainer.sh $containerName &&
# If Stopping and removing existed pomodoro container successfull: 
# Run new Image as container
{
    ./docker_webhook/scripts/runImage.sh $repoName $tagName $containerName '-d -p 8123:80' '' &&
        # If Running new Image as container successfull: 
    # Remove all stopped Docker images with specific name
    {
        log "INFO" "Attempt to remove all Docker images with name $repoName that are currently in a stopped state."
        sudo docker images | grep $repoName | grep -vw $tagName | awk '{print $3}' | xargs sudo docker rmi 
    }  || 

    # Otherwise, if there's a failure in running the new image as a container: 
    {

        log "ERROR" "There's a failure in running the new image as a container."

        # Get a list of semantic version tags for the specified image name
        tags=$(sudo docker images --format "{{.Tag}}" "$repoName" | grep -E "^[[:digit:]]+\.[[:digit:]]+\.[[:digit:]]+$")
        # Sort the tags in decreasing order
        sorted_tags=$(echo "$tags" | sort -rV)

        # Attempt to execute the image with the latest tag in semantic version format.

        # Flag to track if the first iteration is complete
        first_iteration=true

        # Iterate through the sorted tags
        successful=false
        for tag in $sorted_tags; do
            if [ "$first_iteration" = true ]; then
                first_iteration=false
                continue  # Skip the first tag
            fi

            log "INFO" "Trying to start image $repoName:$tag"
            if ./docker_webhook/scripts/runImage.sh $repoName $tag $containerName '--rm -d -p 8123:80' '' ; then
                log ""INFO "Successfully ran image with tag: $tag"
                successful=true
                break
            else
                log "ERROR" "Failed to run image with tag: $tag"
            fi
        done

        # If unable to execute any image, raise an error.
        # Check if any successful run occurred
        if [ "$successful" = false ]; then
            log "ERROR" "Unable to run any image from the loop of existed images"
            exit 1  # Exit with an error status
        fi
    }
}