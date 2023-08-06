#!/usr/bin/env python3

import subprocess

command = "curl -s '127.0.0.1:8080/' | grep -oP '<title>\K.*?(?=<\/title>)'"
output = subprocess.check_output(command, shell=True, text=True, stderr=subprocess.STDOUT)

if output.find('Pomodoro') == -1:
    raise ValueError


