run_dev_server:
	npm run run_server

build:
	npm run build
	cd ../host_settings/scripts && ./replace_baseURL_front_js.sh

build_docker_container:
	docker build -t eugeneparkhom/pomodoro_frontend:1.0.0 .