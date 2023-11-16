docker_build:
	docker build -t pomodoro_production .

docker_create_volume:
	docker volume create --name pomo_test -o type=none -o o=bind -o device=/home/zzz/Downloads/GIT/pomodoro_timer

docker_run_test:
	docker run --name pomo_timer_container -d -t --rm -v pomo_test:/usr/app pomodoro_production

docker_run_prod:
	docker run --name pomo_timer_container -d -t --rm -p 8080:80 pomodoro_production

run_dev_server:
	npm run run_server