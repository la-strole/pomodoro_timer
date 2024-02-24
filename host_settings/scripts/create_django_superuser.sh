#!/bin/bash

# Container name
container_name="pomodoro_backend"

# Get container ID from container name
container_id=$(sudo docker ps -qf "name=$container_name")

# Check if the container ID is not empty
if [ -n "$container_id" ]; then
    echo "Container ID found: $container_id"
    # Execute the command within the container
    # Pause execution before making container migrations.
    sleep 5
    sudo docker exec -it "$container_id" python manage.py createsuperuser
else
    echo "Container '$container_name' not found."
fi
