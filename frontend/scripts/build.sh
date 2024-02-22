#!/bin/bash
mkdir dist
mkdir ./dist/pomodoro
mkdir ./dist/google_charts
cp -r ./google_charts/css/ ./dist/google_charts/
cp -r ./pomodoro/assets ./dist/pomodoro 
cp -r ./pomodoro/public/css ./dist/pomodoro/
grunt minification