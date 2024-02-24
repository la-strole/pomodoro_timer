#!/bin/bash

# Read server_name from settings.json
server_name=$(grep -oP '(?<="server_name": ")[^"]*' ../settings.json)

# Replace server name in api.js
sed -i "s|SERVERNAME|$server_name|g" ../../frontend/dist/google_charts/js/api.js
echo "Server name replaced in dist/ api.js google.charts to $server_name"
sed -i "s|SERVERNAME|$server_name|g" ../../frontend/dist/pomodoro/js/api.js
echo "Server name replaced in dist/ api.js pomodoro to $server_name"
