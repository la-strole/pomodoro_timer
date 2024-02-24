install:
	./scripts/install_project_host_config.sh
	$(MAKE) run_frontend_conatainer
	$(MAKE) run_backend_container

run_frontend_conatainer:
	./scripts/run_frontend_docker_conatainer.sh

run_backend_container:
	./scripts/run_backend_docker_container.sh
	./scripts/create_django_superuser.sh

remove_project:
	./scripts/remove_project.sh