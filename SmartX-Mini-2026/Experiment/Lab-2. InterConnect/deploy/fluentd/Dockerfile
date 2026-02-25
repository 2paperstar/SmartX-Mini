FROM fluent/fluentd:v1.19-debian
LABEL maintainer="SmartX Labs <mini@smartx.kr>"

# Switch to root to install gems and snmp tools
USER root

# Install snmp CLI tools (provides snmpget) and build dependencies for rdkafka
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        snmp \
        librdkafka-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Kafka output plugin (rdkafka2 backend for Kafka 4.x compatibility)
RUN gem install fluent-plugin-kafka --no-document

# Copy Fluentd configuration
COPY fluent.conf /fluentd/etc/fluent.conf

USER fluent
