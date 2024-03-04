#!/bin/bash

# Read server_name from settings.json
server_name=$(grep -oP '(?<="server_name": ")[^"]*' ./settings.json)

# Generate pomodoro_nginx.conf
cat > ./configurations/pomodoro_nginx.conf <<EOF
server {
    server_name $server_name wwww.$server_name;

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
        proxy_pass http://localhost:8887/djangostatic/admin;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_redirect off;
    }
}
EOF

echo "pomodoro_nginx.conf generated with server_name: $server_name"
