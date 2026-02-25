import threading, logging, time
import multiprocessing
import msgpack

from kafka import TopicPartition
from kafka import KafkaConsumer
from kafka.errors import KafkaError

import requests, json
import time
import os
import sys
import subprocess
#import urllib, urllib2

from time import localtime, strftime


# InfluxDB 2.x(v1 compatibility)에서는 bucket/DBRP를 사전 생성하므로
# 실행 시 CREATE DATABASE 호출을 하지 않습니다.

timeout = 100
actual_data=[]

consumer = KafkaConsumer('resource',bootstrap_servers=['localhost:9090'])
partitions = consumer.poll(timeout)
while partitions == None or len(partitions) == 0:

        consumer = KafkaConsumer('resource', bootstrap_servers=['localhost:9090'])
        message = next(consumer)
        print(message.value.decode('utf-8'))

        str1 = message.value.decode('utf-8')

        payload = json.loads(str1)

        str3 = payload.get('free_ram', 0)   # memory

        str4 = payload.get('tx_bytes', 0)   # tx

        str5 = payload.get('rx_bytes', 0)   # rx

        str6 = payload.get('cpu_load', 0)   # cpu_usage

        str7 = payload.get('tx_drops', 0)   # tx_dropped

        str8 = payload.get('rx_errors', 0)  # rxError

        str9 = payload.get('disk_util', 0)  # disk

        str10 = payload.get('rx_drops', 0)  # rx_dropped

        str11 = payload.get('tx_errors', 0) # txError

        str12 = payload.get('time', '')     # time_stamp

        variables = "labs"
        cmd = "curl -i -XPOST 'http://localhost:8086/write?db=Labs&u=tower&p=SxMiniV12026' --data-binary '%s,host=Labs,region=GIST memory=%s'" % (variables, str3)
        subprocess.call([cmd], shell=True)

        variables = "labs"
        cmd = "curl -i -XPOST 'http://localhost:8086/write?db=Labs&u=tower&p=SxMiniV12026' --data-binary '%s,host=Labs,region=GIST tx=%s'" % (variables, str4)
        subprocess.call([cmd], shell=True)

        variables = "labs"
        cmd = "curl -i -XPOST 'http://localhost:8086/write?db=Labs&u=tower&p=SxMiniV12026' --data-binary '%s,host=Labs,region=GIST rx=%s'" % (variables, str5)
        subprocess.call([cmd], shell=True)

        variables = "labs"
        cmd = "curl -i -XPOST 'http://localhost:8086/write?db=Labs&u=tower&p=SxMiniV12026' --data-binary '%s,host=Labs,region=GIST CPU_Usage=%s'" % (variables, str6)
        subprocess.call([cmd], shell=True)

        variables = "str7"
        cmd = "curl -i -XPOST 'http://localhost:8086/write?db=Labs&u=tower&p=SxMiniV12026' --data-binary '%s,host=Labs,region=GIST tx_dropped=%s'" % (variables, str7)
        subprocess.call([cmd], shell=True)

        variables = "str8"
        cmd = "curl -i -XPOST 'http://localhost:8086/write?db=Labs&u=tower&p=SxMiniV12026' --data-binary '%s,host=Labs,region=GIST rxError=%s'" % (variables, str8)
        subprocess.call([cmd], shell=True)


        variables = "str8"
        cmd = "curl -i -XPOST 'http://localhost:8086/write?db=Labs&u=tower&p=SxMiniV12026' --data-binary '%s,host=Labs,region=GIST disk=%s'" % (variables, str9)
        subprocess.call([cmd], shell=True)



        variables = "str8"
        cmd = "curl -i -XPOST 'http://localhost:8086/write?db=Labs&u=tower&p=SxMiniV12026' --data-binary '%s,host=Labs,region=GIST rx_dropped=%s'" % (variables, str10)
        subprocess.call([cmd], shell=True)


        variables = "str8"
        cmd = "curl -i -XPOST 'http://localhost:8086/write?db=Labs&u=tower&p=SxMiniV12026' --data-binary '%s,host=Labs,region=GIST txError=%s'" % (variables, str11)
        subprocess.call([cmd], shell=True)

