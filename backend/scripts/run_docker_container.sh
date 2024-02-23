#!/bin/bash
docker run --rm -d -p 127.0.0.1:8888:80 --env-file ./.env pomodoro_backend:v0