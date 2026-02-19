#!/bin/bash
set -e

cd /kafka

if [ "${KAFKA_PROCESS_ROLES}" = "controller" ]; then
    BASE_CONF="config/controller.properties"
else
    BASE_CONF="config/broker.properties"
fi

CONF="/kafka/config/server-node${KAFKA_NODE_ID}.properties"

cp "$BASE_CONF" "$CONF"

sed -i "s|^node.id=.*|node.id=${KAFKA_NODE_ID}|"                                                                          "$CONF"
sed -i "s|^process.roles=.*|process.roles=${KAFKA_PROCESS_ROLES}|"                                                        "$CONF"
sed -i "s|^listeners=.*|listeners=${KAFKA_LISTENERS}|"                                                                     "$CONF"

if [ "${KAFKA_PROCESS_ROLES}" = "controller" ]; then
    sed -i "/^#*advertised.listeners=/d" "$CONF"
fi
KAFKA_CONTROLLER_QUORUM_SERVERS="${HOST_HOSTNAME}:19090,${HOST_HOSTNAME}:19091,${HOST_HOSTNAME}:19092"
sed -i "s|^controller.quorum.bootstrap.servers=.*|controller.quorum.bootstrap.servers=${KAFKA_CONTROLLER_QUORUM_SERVERS}|" "$CONF"
sed -i "s|^log.dirs=.*|log.dirs=${KAFKA_LOG_DIRS}|"                                                                       "$CONF"

if [ -n "${KAFKA_ADVERTISED_LISTENERS}" ]; then
    sed -i "/^#*advertised.listeners=/d" "$CONF"
    echo "advertised.listeners=${KAFKA_ADVERTISED_LISTENERS}" >> "$CONF"
fi

INITIAL_CONTROLLERS="0@${HOST_HOSTNAME}:19090:${CONTROLLER0_UUID},1@${HOST_HOSTNAME}:19091:${CONTROLLER1_UUID},2@${HOST_HOSTNAME}:19092:${CONTROLLER2_UUID}"

bin/kafka-storage.sh format \
    --cluster-id "${CLUSTER_ID}" \
    --config "$CONF" \
    --ignore-formatted \
    --initial-controllers "${INITIAL_CONTROLLERS}"

exec bin/kafka-server-start.sh "$CONF"
