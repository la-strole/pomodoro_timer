#!/bin/bash

# Run Django migrations
python manage.py makemigrations pomo
python manage.py migrate
python manage.py collectstatic

# Start the Django application with Gunicorn
exec gunicorn --bind 0.0.0.0:80 pomodoro_server.wsgi:application

# Function to run your command
run_command() {
    # Your command here
    python manage.py clearsessions
}

# Run your command repeatedly
while true; do
    run_command
    sleep 3600  # Adjust interval as needed
done