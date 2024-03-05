#!/bin/bash

# Remove the images
sudo docker container stop pomodoro_frontend
sudo docker container stop pomodoro_backend
sudo docker container stop pomodoro_tlgbot
sleep 5

# Function to delete Docker image by name
delete_image_by_name() {
    local image_name=$1
    local image_ids=$(docker images -q $image_name)

    if [ -z "$image_ids" ]; then
        echo "No image found with the name '$image_name'."
    else
        echo "Deleting image(s) with name '$image_name'..."
        docker rmi $image_ids
        echo "Image(s) with name '$image_name' deleted successfully."
    fi
}

# Names of Docker images you want to delete
images=("eugeneparkhom/pomodoro_backend" "eugeneparkhom/pomodoro_frontend" "eugeneparkhom/pomodoro_tlgbot")

# Loop through the array of image names and delete them
for image_name in "${images[@]}"; do
    delete_image_by_name $image_name
done

sudo rm /etc/rsyslog.d/30-docker.conf
sudo systemctl restart rsyslog

# We need to compress and rotate older log files on our Docker host
sudo rm /etc/logrotate.d/rsyslog-docker_logrotate

# Copy additional Nginx configuration
sudo rm /etc/nginx/sites-enabled/pomodoro_nginx.conf
sudo nginx -t
