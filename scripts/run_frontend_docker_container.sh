#!/bin/bash

sudo docker run \
--name pomodoro_frontend \
--rm \
-d \
-p 127.0.0.1:8887:80 \
--log-driver syslog \
--log-opt tag=docker/{{.ImageName}} \
--log-opt syslog-address=unixgram:///dev/log \
eugeneparkhom/pomodoro_frontend:1.0.9