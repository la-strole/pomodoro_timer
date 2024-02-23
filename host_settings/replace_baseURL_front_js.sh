#!/bin/bash

# Read the server_name from pomodoro_nginx.conf
server_name=$(grep -oP '(?<=server_name\s).+?(?=;)' pomodoro_nginx.conf)

# Replace server name in api.js
sed -i "s|'https://SERVERNAME/|'https://$server_name/|g" ../frontend/google_charts/js/api.js
echo "Server name replaced in api.js google.charts"
sed -i "s|'https://SERVERNAME/|'https://$server_name/|g" ../frontend/pomodoro/public/js/api.js
echo "Server name replaced in api.js pomodoro"
