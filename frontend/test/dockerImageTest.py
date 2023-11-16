#!/usr/bin/env python3

import subprocess

COMMAND = "curl -s '127.0.0.1:8080/' | grep -oP '<title>\K.*?(?=<\/title>)'"
output = subprocess.check_output(
    COMMAND, shell=True, text=True, stderr=subprocess.STDOUT
)

if output.find("Pomodoro") == -1:
    raise ValueError
