install:
	./scripts/install_project_host_config.sh
	$(MAKE) run_frontend_conatainer
	$(MAKE) run_backend_container
	$(MAKE) run_tlgbot_container

run_frontend_conatainer:
	./scripts/run_frontend_docker_container.sh

run_backend_container:
	./scripts/run_backend_docker_container.sh
	./scripts/create_django_superuser.sh

run_tlgbot_container:
	./scripts/run_tlgbot_docker_container.sh

remove_project:
	./scripts/remove_project.sh