#!/bin/bash

# Function to generate nginx.conf
generate_nginx_conf() {
    cat > pomodoro_nginx.conf <<EOF
server {
    server_name $server_name;

    # frontend
    location / {
        proxy_pass http://localhost:8887/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_redirect off;
    }

    # backend
    location /backend {
        proxy_pass http://localhost:8888/backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_redirect off;
    }

    location /admin {
        proxy_pass http://localhost:8888/admin;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_redirect off;
    }

    location /backend/static/admin {
        proxy_pass http://localhost:8888/backend/static/admin;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_redirect off;
    }
}
EOF
}

# Main script starts here

# Prompt user for server_name
read -p "Enter server_name: " server_name

# Call function to generate nginx.conf
generate_nginx_conf

echo "nginx.conf generated with server_name: $server_name"
