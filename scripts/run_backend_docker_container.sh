#!/bin/bash

sudo docker run \
--name pomodoro_backend \
--rm \
-d \
-p 127.0.0.1:8888:80 \
--env-file ./.env \
--log-driver syslog \
--log-opt tag=docker/{{.ImageName}} \
--log-opt syslog-address=unixgram:///dev/log \
eugeneparkhom/pomodoro_backend:1.0.55