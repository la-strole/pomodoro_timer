#!/bin/bash

# Read server_name from settings.json
server_name=$(grep -oP '(?<="server_name": ")[^"]*' ./settings.json)

# Replace server name in api.js
sed -i "s|'https://SERVERNAME/|'https://$server_name/|g" ../frontend/google_charts/js/api.js
echo "Server name replaced in api.js google.charts"
sed -i "s|'https://SERVERNAME/|'https://$server_name/|g" ../frontend/pomodoro/public/js/api.js
echo "Server name replaced in api.js pomodoro"
