# Lab#4. Tower Lab

# 0. Objective

![overall objective](https://user-images.githubusercontent.com/82452337/160807997-9caadb51-b363-4e82-bbb2-e1f5888b08b3.png)

**이번 Lab의 목표는 시스템을 모니터링하고 모니터링된 정보를 시각화할 수 있는 Tower(관제 시스템)을 구축하는 것입니다.**

## 0-1. Lab Goal

- 실시간 시스템 상태 모니터링
- 대량의 시계열 데이터 저장 및 분석
- 데이터 시각화를 통한 시스템 데이터의 직관적인 이해
- Kafka 기반의 데이터 수집 → InfluxDB 저장 → Chronograf 시각화의 흐름

지난 **Lab#2(InterConnect Lab)** 에서 구축한 Kafka 클러스터를 사용합니다.

## 0-2. 모니터링 시스템이 왜 필요한가?

시스템의 성능과 안정성을 유지하기 위해서는 실시간 모니터링이 필수적입니다. 시스템에서 발생한 장애를 신속하게 감지하고 대응할 수 있어야 하며, 시스템에서 발생한 시계열 데이터 분석을 통해 성능 최적화와 용량 계획을 수립할 수 있습니다. 특히, 분산 시스템에서는 다양한 노드에서 수집된 데이터를 종합적으로 분석해야 하므로, 이를 효과적으로 저장하고 시각화하는 시스템이 필요합니다. 이번 Lab에서는 `Fluentd`와 `Kafka`를 활용한 데이터 수집, `InfluxDB`를 통한 시계열 데이터 저장, 그리고 `Chronograf`를 이용한 데이터 시각화를 통해 모니터링 시스템 구축 방법을 익힙니다.

## 0-3. TSDB (Time Series Database)

### Time Series Data의 시각화, 모니터링

![time-series-data](./img/time-series-data.png)

시계열 데이터(Time Series Data)는 시간에 따라 변화하는 데이터를 저장하고 분석하는 방식으로, 각 데이터 포인트가 특정 시점의 값을 나타냅니다. 예를 들어, 서버의 CPU 사용률, 네트워크 트래픽, IoT 센서 데이터, 금융 시장 데이터 등이 시계열 데이터에 해당합니다. **Time Series Database**는 이러한 데이터를 효율적으로 저장하고 쿼리할 수 있도록 설계된 데이터베이스로, 빠른 조회, 실시간 분석, 장기적인 추세 파악에 최적화되어 있습니다.

## 0-4. InfluxDB

![influxdb](./img/influxdb.png)

**InfluxDB**는 InfluxData에서 개발한 오픈소스 시계열 데이터베이스(TSDB)입니다.
Go 프로그래밍 언어로 작성되었으며, 운영 모니터링, 애플리케이션 메트릭, 사물인터넷(IoT) 센서 데이터 및 실시간 분석과 같은 다양한 분야에서 시계열 데이터를 저장하고 검색하는 데 사용됩니다.

> [!note]
>
> **여러분이 생각하시는 대부분의 IT 기업들이 시계열 데이터를 다루기 위해 InfluxDB를 사용합니다.**

## 0-5. Chronograf

![chronograf icon](./img/chronograf-icon.png)

### InfluxDB, Chronograf를 사용한 간단한 모니터링 시스템 아키텍쳐

![chronograf components](./img/chronograf-arch.png)

Chronograf는 InfluxDB 시계열 데이터를 웹에서 조회하고 시각화할 수 있는 사용자 인터페이스(UI)입니다.
이번 Lab에서는 InfluxDB 2.8을 사용하되, 기존 실습 코드와의 호환을 위해 InfluxDB의 v1 compatibility API(`Labs.autogen`)를 함께 사용합니다.

# 1. Practice

## 1-1. InfluxDB 2.8 Container 생성 및 실행 ( in NUC )

기존에 실행 중인 `influxdb` 컨테이너가 있다면 먼저 정리합니다.

```bash
sudo docker rm -f influxdb 2>/dev/null || true
```

아래 명령어로 **InfluxDB 2.8** 컨테이너에 환경변수로 넣어줄 InfluxDB Admin Password와 Admin Token을 미리 선언합니다.

```bash
export INFLUXDB_ADMIN_PASSWORD='SxMiniAdmin!2026'
export INFLUXDB_ADMIN_TOKEN="$(openssl rand -hex 32)"
```

아래 명령어로 **InfluxDB 2.8** 컨테이너를 실행합니다.

```bash
sudo docker run -d \
  --net host \
  --name influxdb \
  -v influxdb2-data:/var/lib/influxdb2 \
  -e DOCKER_INFLUXDB_INIT_MODE=setup \
  -e DOCKER_INFLUXDB_INIT_USERNAME=admin \
  -e DOCKER_INFLUXDB_INIT_PASSWORD="$INFLUXDB_ADMIN_PASSWORD" \
  -e DOCKER_INFLUXDB_INIT_ORG=GIST \
  -e DOCKER_INFLUXDB_INIT_BUCKET=Labs \
  -e DOCKER_INFLUXDB_INIT_ADMIN_TOKEN="$INFLUXDB_ADMIN_TOKEN" \
  influxdb:2.8
```

InfluxDB는 **8086번 port**를 사용하며, `--net host` 옵션을 사용했기 때문에 `localhost:8086` 혹은 `<NUC IP>:8086`으로 접근할 수 있습니다.

### 1-1-1. InfluxDB v1 호환 설정 (Chronograf / Python Consumer 호환)

`broker_to_influxdb.py`와 Chronograf의 기존 쿼리(`Labs.autogen`)를 그대로 사용하기 위해 v1 호환 구성을 추가합니다.

먼저 아래 명령으로 `Labs` bucket ID를 확인하고, 환경변수를 선언합니다.

```bash
LABS_BUCKET_ID=$(sudo docker exec influxdb influx bucket list --name Labs | awk 'NR==2 {print $1}')
```

출력에서 `Labs`의 ID를 위에서 선언한 `LABS_BUCKET_ID`로 사용해 DBRP 매핑을 생성합니다.

```bash
sudo docker exec influxdb influx v1 dbrp create \
  --db Labs \
  --rp autogen \
  --default \
  --bucket-id $LABS_BUCKET_ID \
  --org GIST \
  --token $INFLUXDB_ADMIN_TOKEN
```

DBRP 매핑이 생성되면 아래와 같이 출력됩니다.

```bash
ID                      Database        Bucket ID               Retention Policy        Default Organization ID
104bca211b4ac000        Labs            a239a82440d4728d        autogen                 true    1b30065610067f7a
```

마지막으로 아래 명령을 실행하여 v1 호환 인증 계정을 생성합니다.

> [!tip]
>
> `INFLUXDB_V1_PASSWORD`는 URL 쿼리 문자열에 들어가므로 영문/숫자 조합으로 설정하는 것을 권장합니다.

```bash
export INFLUXDB_V1_USER=tower
export INFLUXDB_V1_PASSWORD='SxMiniV12026'

sudo docker exec influxdb influx v1 auth create \
  --username tower \
  --password $INFLUXDB_V1_PASSWORD \
  --read-bucket $LABS_BUCKET_ID \
  --write-bucket $LABS_BUCKET_ID \
  --org GIST \
  --token $INFLUXDB_ADMIN_TOKEN
```

## 1-2. Chronograf Container 생성 및 실행 ( in NUC )

InfluxDB에 접근할 수 있는 url을 argument로 입력해 **chronograf container**를 생성합니다.

```bash
sudo docker rm -f chronograf 2>/dev/null || true
sudo docker run -d -p 8888:8888 --name chronograf chronograf --influxdb-url http://<NUC IP>:8086
```

이후 아래 명령으로 chronograf container가 정상적으로 실행되고 있는지 확인합니다.

```bash
sudo docker logs --tail 100 chronograf
```

![alt text](img/chronograf_run.png)

- **`-p 8888:8888`의 역할**
  - host의 8888번 port를 container의 8888번 port과 mapping해줍니다.
  - 즉, host의 8888번 port에 접근하면, container의 8888번 port로 forwarding됨을 의미합니다.
  - 이 설정 덕분에, host에서 `localhost:8888`또는 `<NUC IP>:8888`로 접속하면 container 내부에서 실행 중인 Chronograf의 Web UI를 사용할 수 있게 됩니다.
  - `-p <host port>:<container port>`로 사용됩니다!

- **그럼 `--net host`와 `-p 8888:8888`의 주요 차이점은?**
  - -p 8888:8888
    - host의 ports 중 필요한 port(8888)만 노출되기 때문에, 보안적으로 더 안전하다고 볼 수 있습니다.
    - 하지만, 매번 포트를 명시적으로 mapping 해줘야 합니다.
  - --net host
    - Container가 host의 네트워크를 그대로 사용합니다.
    - 즉, container 내부에서 8888번 포트를 열면, host에서도 동일한 8888번 포트를 사용할 수 있습니다.
    - 별도의 port mapping 설정이 필요하지 않습니다.

## 1-3. Python venv 및 packages 설치하기 ( in NUC )

### 1-3-1. python-pip / venv 모듈 설치

Python 3.12 환경(Externally Managed Environment)에서는 시스템 전역에 `pip install`이 제한되므로, 아래처럼 `venv`를 함께 설치합니다.

```bash
sudo apt-get install -y libcurl4 openssl curl python3-pip python3-venv
```

### 1-3-2. 가상환경 생성 및 Python Packages 설치

<!-- pip path edit, .gitignore 추가 필요 -->

Lab 2에서 생성한 python venv를 실행하고 package를 설치합니다.

```bash
source ~/.venv/bin/activate
python -m pip install --upgrade pip
pip install requests kafka-python influxdb msgpack
```

필요 시 설치 버전을 확인합니다.

```bash
pip show requests kafka-python influxdb msgpack
```

> [!tip]
>
> 새 터미널을 열 때마다 `source ~/.venv/bin/activate`를 먼저 실행한 뒤 Python 명령을 사용하세요.

## 1-4. Kafka Cluster 실행 (KRaft, in NUC)

**지난 Lab2에서 구성한 Kafka KRaft 클러스터**(`controller0`, `controller1`, `controller2`, `broker0`, `broker1`, `broker2`)를 다시 실행합니다.

### 1-4-1. Kafka 클러스터 Containers 재실행

먼저 컨테이너 상태를 확인합니다.

```bash
sudo docker ps -a --format "table {{.Names}}\t{{.Status}}" | egrep "controller|broker"
```

중지되어 있다면 아래 명령어로 실행합니다.

```bash
sudo docker start controller0 controller1 controller2 broker0 broker1 broker2
```

### 1-4-2. Kafka 동작 및 Topic 확인

KRaft 모드에서는 `zookeeper` 컨테이너를 사용하지 않습니다.
컨트롤러/브로커 상태와 `resource` topic 존재 여부를 확인합니다.

```bash
sudo docker ps --format "table {{.Names}}\t{{.Status}}" | egrep "controller|broker"

sudo docker exec broker0 /kafka/bin/kafka-topics.sh --list \
  --bootstrap-server localhost:9090
```

`resource` topic이 없다면 생성합니다.

```bash
sudo docker exec broker0 /kafka/bin/kafka-topics.sh --create \
  --bootstrap-server localhost:9090 \
  --replication-factor 3 \
  --partitions 3 \
  --topic resource
```

## 1-5. Fluentd container ( in PI )

### 1-5-1. `/etc/hosts`

Pi가 reboot되면, 기존에 작성했던 /etc/hosts 정보가 사라질 수 있습니다. 그런 경우, /etc/hosts에 IP와 hostname 정보를 다시 입력해줘야 합니다.

```bash
sudo vim /etc/hosts
```

만약 기존에 작성했던 정보가 사라져있다면, 아래 2개의 lines을 추가하고 저장해주세요.

> [!warning]
>
> `<>`는 본인에게 해당되는 정보로 교체해야함

```txt
<NUC_IP> <NUC_HOSTNAME>
<PI_IP> <PI_HOSTNAME>
```

### 1-5-2. Fluentd container 실행

Lab 2에서 생성한 `pi-fluentd` 이미지를 사용해 Fluentd를 실행합니다.

```bash
sudo docker run -it --rm \
  --net=host \
  --security-opt seccomp=unconfined \
  --name fluentd \
  pi-fluentd
```

> [!note]
>
> 만약 `pi-fluentd` 이미지가 없다면, Lab 2의 `2-5-2. (NUC) Fluentd 이미지 크로스빌드`와 `2-5-3. (PI) 이미지 로드 및 Fluentd 실행` 절차를 먼저 수행하세요.

## 1-6. Python File `broker_to_influxdb.py` ( in NUC )

`broker_to_influxdb.py`는 kafka consumer로서 kafka broker로부터 message를 전달받고, influxdb에 해당 message data를 적재하는 역할을 합니다.

### 1-6-1. `broker_to_influxdb.py` 코드 수정

> [!note]
>
> 새로운 터미널을 열고 진행해주세요!

```bash
vim ~/SmartX-Mini/SmartX-Mini-2026/Experiment/Lab-4. Tower/deploy/ubuntu-kafkatodb/broker_to_influxdb.py
```

```python
# before
consumer = KafkaConsumer('resource',bootstrap_servers=['<NUC_IP>:9091'])
consumer = KafkaConsumer('resource', bootstrap_servers=['<NUC_IP>:9091'])
cmd = "curl -XPOST 'http://localhost:8086/query' --data-urlencode 'q=CREATE DATABASE Labs'"
cmd = "curl -i -XPOST 'http://localhost:8086/write?db=Labs' --data-binary '...'"

# after
consumer = KafkaConsumer('resource',bootstrap_servers=['localhost:9090'])
consumer = KafkaConsumer('resource', bootstrap_servers=['localhost:9090'])
# Labs bucket은 1-1에서 이미 생성하므로 CREATE DATABASE 호출은 제거(또는 주석 처리)
# write URL의 u/p는 환경변수(INFLUXDB_V1_USER, INFLUXDB_V1_PASSWORD)로 처리
cmd = "curl -sS -XPOST 'http://localhost:8086/write?db=Labs&u=<INFLUXDB_V1_USER>&p=<INFLUXDB_V1_PASSWORD>' --data-binary '...'"
```

![broker_to_influxdb python file](https://user-images.githubusercontent.com/82452337/160814546-da543a58-e6b6-49cb-bdb1-19aa2de9c1fb.png)

### 1-6-2. `broker_to_influxdb.py` 실행

파일 디스크립터와 핸들에 대한 설정과 함께, `broker_to_influxdb.py`를 실행하는 아래 명령어를 입력해주세요.

```bash
sudo sysctl -w fs.file-max=100000
ulimit -S -n 2048
source ~/.venv/bin/activate


# optional: v1 인증/DBRP 매핑 확인
curl -sS -XPOST "http://localhost:8086/query?u=${INFLUXDB_V1_USER}&p=${INFLUXDB_V1_PASSWORD}&db=Labs" \
  --data-urlencode "q=SHOW MEASUREMENTS"

python ~/SmartX-Mini/SmartX-Mini-2026/Experiment/Lab-4. Tower/deploy/ubuntu-kafkatodb/broker_to_influxdb.py
```

## 1-7. Chronograf 대시보드 ( in NUC )

### 1-7-1. Chronograf 대시보드 접근하기

웹 브라우저를 열고, Chronograf Dashboard에 접근하세요

> **접근 주소**: `http://<Your NUC IP>:8888`

![chronograf-1](./img/chronograf-1.png)

### 1-7-2. Config - Connections 수정하기

Chronograf Config에서 Default Connection을 먼저 수정하여 InfluxDB 인증 정보를 추가합니다. 위와 같이 Configuration --> Connections 아래에 위치한 default connection을 클릭합니다.

![chronograf-config-1](./img/chronograf-config-1.png)

그리고 이전에 InfluxDB container를 올릴 때 사용한 `INFLUXDB_V1_USER`, `INFLUXDB_V1_PASSWORD`를 각각 `username`, `password` 필드에 입력합니다.

![chronograf-config-2](./img/chronograf-config-2.png)

Dashboard 섹션에서 InfluxDB를 클릭하고 넘어간 뒤, Kapacitor 설정은 skip 합니다.

![chronograf-config-3](./img/chronograf-config-3.png)

- URL: `http://<NUC IP>:8086`
- Username: `tower`
- Password: `<INFLUXDB_V1_PASSWORD>`

### 1-7-3. 대시보드 생성하기

![chronograf-2](./img/chronograf-2.png)

### 1-7-4. 쿼리 등록하기

![chronograf-4](./img/chronograf-4.png)

```sql
SELECT "memory" FROM "Labs"."autogen"."labs" WHERE time > :dashboardTime:
```

> [!tip]
>
> `Submit Query`에서 `received status code 401 ... unauthorized access`가 나오면 아래 순서로 확인하세요.
>
> 1. 먼저 CLI에서 v1 인증이 정상인지 확인
>
>    ```bash
>    curl -i -XPOST "http://localhost:8086/query?db=Labs&u=tower&p=<INFLUXDB_V1_PASSWORD>" \
>      --data-urlencode "q=SHOW MEASUREMENTS"
>    ```
>
> 2. `200 OK`이면 Chronograf의 `Configuration -> Connections`에서 default connection을 다시 생성
>    - URL: `http://<NUC IP>:8086`
>    - Username: `tower`
>    - Password: `<INFLUXDB_V1_PASSWORD>`
> 3. Query 화면 상단에서 방금 만든 Config가 선택되었는지 확인 후 다시 `Submit Query`
>    ![chronograf-config-4](./img/chronograf-config-4.png)

### 1-7-5. 모니터링 확인하기

#### Memory 모니터링

Memory의 현재 상태를 모니터링할 수 있습니다.

![chronograf-5](./img/chronograf-5.png)

#### CPU 모니터링

CPU의 현재 상태를 모니터링할 수 있습니다.

![chronograf-6](./img/chronograf-6.png)

#### CPU 부하 테스트 ( in PI )

모니터링 시스템이 데이터를 제대로 시각화하는지 확인하기 위해, CPU에 의도적인 부하를 줄 수 있습니다.

우선, Chronograf Dashboard의 Fields를 `CPU_Usage`로 변경합니다

![chronograf-6](./img/chronograf-6.png)

그 다음, **PI에서 다음의 명령어를 입력해보세요**.

```bash
docker run --rm -it busybox sh -c "while true; do :; done"
```

브라우저에서 새로고침을 누르다보면 Dashboard의 그래프가 위로 움직이는 것을 확인할 수 있습니다.

확인했으면 `Ctrl + C`를 눌러 CPU 부하를 멈춰주세요 ( in PI ).

# 2. Lab Summary

이 Lab의 목표는 시스템 모니터링 및 데이터 시각화를 위한 관제 시스템(Tower)을 구축하는 것입니다.
이를 위해 Kafka 클러스터를 활용하여 수집한 데이터를 InfluxDB에 저장하고, Chronograf를 통해 시각화했습니다.

## (Recall) Why this lab?

- 실시간 시스템 상태 모니터링
- 대량의 시계열 데이터 저장 및 분석
- 데이터 시각화를 통한 시스템 데이터의 직관적인 이해
- Kafka 기반의 데이터 수집 → InfluxDB 저장 → Chronograf 시각화의 흐름

## 주요 과정 요약

1. InfluxDB 2.8 컨테이너 실행 + v1 호환(DBRP/Auth) 설정 → 기존 코드와 쿼리 호환 유지
2. Chronograf 컨테이너 실행 → InfluxDB 데이터를 시각화하는 Web UI
3. Kafka KRaft 클러스터 재시작 → 지난 Lab2에서 구축한 Controller/Broker 실행
4. Fluentd 실행 → 데이터 스트리밍을 위한 Fluentd 에이전트 실행
5. Python (Kafka) Consumer 실행 (broker_to_influxdb.py) → Kafka Broker로부터 데이터를 받아 InfluxDB에 적재
6. Chronograf 대시보드 구성 → InfluxDB의 데이터를 시각적으로 확인할 수 있도록 설정
