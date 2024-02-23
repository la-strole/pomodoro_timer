#!/bin/bash

# To configure Rsyslog on Docker host we will need to 
# create new configuration include file in /etc/rsyslog.d/ directory
sudo cp ./30-docker.conf /etc/rsyslog.d/
sudo systemctl restart rsyslog
echo "To configure Rsyslog on Docker host we will need to create new configuration include file in /etc/rsyslog.d/ directory"

# We need to compress and rotate older log files on our Docker host
sudo cp rsyslog-docker_logrotate /etc/logrotate.d/
echo "We need to compress and rotate older log files on our Docker host with logrotate"

# Generate and Copy additional Nginx configuration
./generate_nginx_configuration.sh
sudo cp pomodoro_nginx.conf /etc/nginx/sites-enabled/

# Check Nginx configuration
if sudo nginx -t; then
    echo "Nginx configuration test successful"

    # Read server_name from settings.json
    server_name=$(grep -oP '(?<="server_name": ")[^"]*' ./settings.json)

    # Run Certbot only if Nginx test is successful
    sudo certbot-auto --expand -d $server_name

else
    echo "Error: Nginx configuration test failed, Certbot will not be run"
fi

echo 'Nginx configuration generated and copied to the /etc/nginx/site-enabled/ directory. If the Nginx configuration is okay, restart Nginx with sudo systemctl restart nginx.'

echo 'Now, with scripts: run backend Docker container, create superuser for Django database (Insert the container ID into the script), run frontend Docker container.'
