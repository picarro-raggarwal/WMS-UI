SHELL:=/bin/bash
PROJ_BASE=$(shell pwd)
CONTAINERNAME=wms-ui
CONTAINERVERSION=${docker_tag}
CONTAINER_ID=`docker image ls | grep -m 1 wms-ui | awk -F '  +' '{print $$3}'`
DOCKER_REPOSITORY=picarro-wms-ui-dev.jfrog.io

.PHONY: docker_build
docker_build:
	@echo "Building Docker Image: ${CONTAINERNAME}"
	docker build --build-arg WMS_UI_TAG=${CONTAINERVERSION} --tag ${CONTAINERNAME}:${CONTAINERVERSION} .
	@echo "Image ID: ${CONTAINER_ID}"

.PHONY: docker_deploy
docker_deploy:
	@echo "Deploying image: ${CONTAINERNAME} - ID: ${CONTAINER_ID}"
	docker tag ${CONTAINER_ID} ${DOCKER_REPOSITORY}/${CONTAINERNAME}:${CONTAINERVERSION}
	docker push ${DOCKER_REPOSITORY}/${CONTAINERNAME}:${CONTAINERVERSION}

