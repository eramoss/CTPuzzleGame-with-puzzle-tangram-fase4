#!/bin/bash
git pull
docker container stop ctplat
docker container rm ctplat
docker image rm ctplatform:1.0
docker image build -t ctplatform:1.0 .
docker run --name ctplat -it -p 3339:8080 ctplatform:1.0 http-server dist
