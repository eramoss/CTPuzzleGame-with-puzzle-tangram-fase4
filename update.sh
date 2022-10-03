#!/bin/bash
git pull
docker container stop ctplat
docker container rm ctplat
docker image rm ctpuzzlegame:1.0
docker image build -t ctpuzzlegame:1.0 .
docker run --name ctpuzzlegame -p 3339:8080 ctpuzzlegame:1.0 http-server dist
