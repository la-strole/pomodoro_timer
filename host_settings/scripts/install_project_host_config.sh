#!/bin/bash

# To configure Rsyslog on Docker host we will need to 
# create new configuration include file in /etc/rsyslog.d/ directory
# Check if rsyslog package is installed
if ! dpkg -l | grep -q '^ii.*rsyslog'; then
    echo "rsyslog is not installed. Installing..."
    # Update package index
    sudo apt update
    # Install rsyslog package
    sudo apt install -y rsyslog
    # Verify installation success
    if dpkg -l | grep -q '^ii.*rsyslog'; then
        echo "rsyslog installed successfully."
    else
        echo "Failed to install rsyslog."
        exit 1
    fi
else
    echo "rsyslog is already installed."
fi
sudo cp ./configurations/30-docker.conf /etc/rsyslog.d/
sudo systemctl restart rsyslog
echo "To configure Rsyslog on Docker host we will need to create new configuration include file in /etc/rsyslog.d/ directory"

# We need to compress and rotate older log files on our Docker host
# Check if logrotate package is installed
if ! dpkg -l | grep -q '^ii.*logrotate'; then
    echo "rsyslog is not installed. Installing..."
    # Update package index
    sudo apt update
    # Install rsyslog package
    sudo apt install -y logrotate
    # Verify installation success
    if dpkg -l | grep -q '^ii.*logrotate'; then
        echo "logrotate installed successfully."
    else
        echo "logrotate to install rsyslog."
        exit 1
    fi
else
    echo "logrotate is already installed."
fi
sudo cp ./configurations/rsyslog-docker_logrotate /etc/logrotate.d/
echo "We need to compress and rotate older log files on our Docker host with logrotate"

# Generate and Copy additional Nginx configuration
# Check if the nginx is installed
if ! dpkg -l | grep -q '^ii.*nginx'; then
    echo "nginx is not installed. Installing..."
    # Update package index
    sudo apt update
    # Install the package
    sudo apt install -y nginx
    # Verify installation success
    if dpkg -l | grep -q '^ii.*nginx'; then
        echo "nginx installed successfully."
    else
        echo "Failed to install nginx."
        exit 1
    fi
else
    echo "nginx is already installed."
fi
./scripts/generate_nginx_configuration.sh
sudo cp ./configurations/pomodoro_nginx.conf /etc/nginx/sites-enabled/

# Check Nginx configuration
if sudo nginx -t; then
    echo "Nginx configuration test successful"

    # Read server_name from settings.json
    server_name=$(grep -oP '(?<="server_name": ")[^"]*' ./settings.json)

    # Run Certbot only if Nginx test is successful
    sudo certbot --nginx -d $server_name
    echo 'Nginx configuration generated and copied to the /etc/nginx/site-enabled/ directory. Restart Nginx with sudo systemctl restart nginx.'
    sudo systemctl restart nginx

else
    echo "Error: Nginx configuration test failed, Certbot will not be run"
fi


