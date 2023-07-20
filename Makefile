docker_build:
	docker build -t pomodoro_test .

docker_create_volume:
	docker volume create --name pomo_test -o type=none -o o=bind -o device=/home/zzz/Downloads/GIT/pomodoro_timer

docker_run:
	docker run -d -t --rm -v pomo_test:/usr/app  pomodoro_test