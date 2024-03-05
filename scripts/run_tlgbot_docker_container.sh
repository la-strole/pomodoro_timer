#!/bin/bash

sudo docker run \
--name pomodoro_tlgbot \
--rm \
-d \
--env-file ./.tlgbotenv \
--log-driver syslog \
--log-opt tag=docker/{{.ImageName}} \
--log-opt syslog-address=unixgram:///dev/log \
eugeneparkhom/pomodoro_tlgbot:1.0.0
