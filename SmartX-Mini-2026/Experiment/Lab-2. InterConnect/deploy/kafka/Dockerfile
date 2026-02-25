FROM ubuntu:24.04
LABEL maintainer="SmartX Labs <mini@smartx.kr>"

# Disable interactive prompts during apt installs
ENV DEBIAN_FRONTEND=noninteractive

RUN sed -i 's@archive.ubuntu.com@mirror.kakao.com@g' /etc/apt/sources.list.d/ubuntu.sources

# Install dependencies
RUN apt-get update && \
    apt-get install -y wget vim iputils-ping net-tools iproute2 dnsutils openjdk-21-jdk && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Kafka 4.2.0
RUN wget -q https://downloads.apache.org/kafka/4.2.0/kafka_2.13-4.2.0.tgz -O - | tar -zxv && \
    mv kafka_2.13-4.2.0 /kafka

WORKDIR /kafka

# Copy startup script
COPY start-kafka.sh /start-kafka.sh
RUN chmod +x /start-kafka.sh
