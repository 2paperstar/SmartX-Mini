#!/bin/bash

while true; do

	python3 RPI_capture.py

	sleep 1

	python3 RPI_transfer.py
done
