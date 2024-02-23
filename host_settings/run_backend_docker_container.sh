#!/bin/bash

sudo docker run \
--rm \
-d \
-p 127.0.0.1:8888:80 \
--env-file ./.env \
--log-driver syslog \
--log-opt tag=docker/{{.ImageName}} \
--log-opt syslog-address=unixgram:///dev/log \
pomodoro_backend:1.0.0