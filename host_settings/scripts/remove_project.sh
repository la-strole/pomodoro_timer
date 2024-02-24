#!/bin/bash

# Remove the images
sudo docker container stop pomodoro_frontend
sudo docker container stop pomodoro_backend
sleep 5
sudo docker rmi eugeneparkhom/pomodoro_frontend:1.0.0
sudo docker rmi eugeneparkhom/pomodoro_backend:1.0.0

sudo rm /etc/rsyslog.d/30-docker.conf
sudo systemctl restart rsyslog

# We need to compress and rotate older log files on our Docker host
sudo rm /etc/logrotate.d/rsyslog-docker_logrotate

# Copy additional Nginx configuration
sudo rm /etc/nginx/sites-enabled/pomodoro_nginx.conf
sudo nginx -t
