#!/bin/bash

# To configure Rsyslog on Docker host we will need to 
# create new configuration include file in /etc/rsyslog.d/ directory
sudo cp ./30-docker.conf /etc/rsyslog.d/
sudo systemctl restart rsyslog

# We need to compress and rotate older log files on our Docker host
sudo cp rsyslog-docker_logrotate /etc/logrotate.d/

# Copy additional Nginx configuration
sudo cp pomodoro_nginx.conf /etc/nginx/sites-enabled/
sudo nginx -t
echo 'If the Nginx configuration is okay, restart Nginx with sudo systemctl restart nginx.'

echo 'Now, with scripts: run backend Docker container, create superuser for Django database, run frontend Docker container.'