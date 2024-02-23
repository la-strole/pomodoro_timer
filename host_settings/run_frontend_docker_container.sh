#!/bin/bash

sudo docker run \
--rm \
-d \
-p 127.0.0.1:8887:80 \
--log-driver syslog \
--log-opt tag=docker/{{.ImageName}} \
--log-opt syslog-address=unixgram:///dev/log \
pomodoro_frontend:1.0.0