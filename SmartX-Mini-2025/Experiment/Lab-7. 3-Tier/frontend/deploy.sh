#! /usr/bin/env sh

DOCKERHUB_ID=tori209
DOCKERHUB_REPO=test-image
IMAGE_TAG=latest

sudo docker build . --tag ${DOCKERHUB_ID}/${DOCKERHUB_REPO}:${IMAGE_TAG} --no-cache &&
sudo docker push ${DOCKERHUB_ID}/${DOCKERHUB_REPO}:${IMAGE_TAG} &&
kubectl apply -f ../kubernetes/frontend
