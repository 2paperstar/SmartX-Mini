# Container Image Registry Deployment on Kubernetes

지금까지 생성된 대부분의 container들은 원격으로 존재하는 public container image 저장소인 Docker Hub에서 pull 해온 container image를 바탕으로 생성되었습니다.  

이제부터는 Docker Hub와 같이 공개된 container image registry를 사용하지 않고, Private Container Image Registry를 직접 구축하고 해당 저장소로 container image를 push, pull 해보겠습니다.  

그렇게 하기 위해서, 직접 구축한 kubernetes cluster에 Docker Hub와 같은 역할을 하는 Container Image Registry를 구축해야 합니다.  

아래의 과정을 따라, 여러분만의 Private Container Image Registry를 간단하게 구축해보겠습니다.

## Container Runtime 설정

지금까지 우리는 Docker를 주된 container runtime으로 사용했습니다.  
그러나 Docker를 제외하고도 다양한 container runtime이 존재합니다.  
실제로 kubernetes는 기본적으로 `Containerd`를 기본 container runtime으로 사용합니다.  

실습에서는 두 단계에서 각각 다른 container runtime이 사용됩니다.
1. Host machine에 설치된 `Docker`를 통해 container image를 build하고 해당 image를 container image registry로 push하는 과정
2. Kubernetes pod 생성 시, kubernetes 기본 container runtime인 `Containerd`를 통해 private container image registry에서 container image를 조회하여 사용하는 과정

따라서 우리는 두 개의 container runtime의 설정을 해주어야 합니다.  

기본적으로 Docker와 Containerd 모두 https 프로토콜을 사용하여 container image의 push와 pull을 진행하도록 구현되어 있습니다.  

그러나 이번 실습에서는 private container image registry를 구축하며 https 지원을 위한 SSL/TLS 인증서까지 도입하는 과정은 다루지 않을 것입니다.  

Kubernetes cluster 내부에서 hostname을 통한 http 통신만 사용할 것이기 때문에, 아래의 설정을 진행해야 합니다. 

## For NUC01
> [!WARNING]
> **이번 실습에서는 NUC01에서만 Docker에 대한 설정을 진행합니다.**  
> **NUC01 역할을 하는 실습자만 Docker 설정을 하면 됩니다.**  

아래의 명령어를 입력하여 Docker에 대한 설정을 진행합니다.

```shell
sudo vim /etc/docker/daemon.json
```

파일에 존재하는 가장 바깥 중괄호 안에 "insecure-registries" 필드를 추가하고 이에 해당하는 값을 같이 적어줍니다. 이 설정을 통해 http 프로토콜을 사용하여 container image를 push, pull할 수 있게 됩니다.  

> [!WARNING]
> 예시에 나와있는 `...`은 제외하고 `"insecure-registries": ["nuc01:5000", "nuc02:5000", "nuc03:5000"]`만 입력해주시기 바랍니다. 나머지 필드는 수정하지 않습니다.

```json
{
  ...
  ...
  ...
  ...
  "insecure-registries": ["nuc01:5000", "nuc02:5000", "nuc03:5000"]
}
```

파일의 수정을 완료했다면, 아래의 명령어를 입력하여 Docker를 재시작합니다.  

```shell
sudo systemctl restart docker
```

## For All NUCs
> [!WARNING]
> **Containerd에 대한 설정은 모든 NUC에서 진행합니다.**  
> **실습자들은 ssh로 접속한 NUC01이 아니라, 각자 NUC에서 터미널을 열고 Containerd 설정을 진행합니다.**  

이제는 Containerd에 대한 설정을 진행하겠습니다.  
아래의 명령어를 입력하여 파일을 열어줍니다.

```shell
sudo vim /etc/containerd/config.toml
```

파일의 내용 중 `[plugins."io.containerd.grpc.v1.cri".registry.mirrors]`라는 필드를 찾고, 다음과 같이 수정합니다.  

> [!WARNING]
> 예시에 나와있는 `...`은 제외하고 내용을 입력하여 주시기 바랍니다. **들여쓰기에 주의해주시기 바랍니다.** 나머지 부분은 수정하지 않습니다.

```toml
...
...
...

[plugins."io.containerd.grpc.v1.cri".registry.mirrors]
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."nuc01:5000"]
    endpoint = ["http://nuc01:5000"]
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."nuc02:5000"]
    endpoint = ["http://nuc02:5000"]
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."nuc03:5000"]
    endpoint = ["http://nuc03:5000"]

...
...
...
```

모두 수정했다면, 아래의 명령어를 입력하여 containerd를 재시작합니다.  

```shell
sudo systemctl restart containerd
```

## 이제부터 NUC02, NUC03 사용자는 다시 ssh로 접속한 NUC01에서 실습을 진행합니다.  

## Persistent Volume(PV) 생성

여러분이 직접 build한 container image를 container registry에 push 했을 때, 해당 image에 대한 정보가 영구적으로 파일 시스템에 남아있어야 합니다. 그래야 원할 때 해당 image를 pull 해올 수 있기 때문입니다.  

이전 실습 과정에서도 살펴보았듯이, Kubernetes에서는 데이터를 실제 스토리지에 저장하기 위한 방법으로 Persistent Volume과 Persistent Volume Claim을 사용합니다.  

### Persistent Volume이란?
> [!NOTE]  
> Persistent volume은 kubernetes cluster에 존재하는 실제 스토리지 영역을 나타냅니다. 우리는 kubernetes 환경에서 다양한 Pod를 생성하고 삭제하는데, Pod가 삭제되어도 보존되었으면 하는 데이터가 있는 상황에서 Persistent Volume을 사용할 수 있습니다.

아래의 명령어를 입력하여 Persistent Volume을 정의한 yaml 파일을 확인하겠습니다.  
본인이 사용중인 hostname과 namespace를 기반으로 yaml 파일의 내용을 수정해주시기 바랍니다.

```shell
cd ~/<your_namespace>/kubernetes/container
vim container-image-registry-pv.yaml
```

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: container-image-registry-pv-<your_namespace>
  labels:
    volume: container-image-registry-pv-<your_namespace>
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  storageClassName: manual
  persistentVolumeReclaimPolicy: Retain
  hostPath:
    path: /mnt/data/<your_namespace>/registry
    type: DirectoryOrCreate
  nodeAffinity:
    required:
      nodeSelectorTerms:
        - matchExpressions:
            - key: kubernetes.io/hostname
              operator: In
              values:
                - <your_hostname>
```

이제, 수정한 파일을 적용하여 PV를 생성합니다.  
아래의 명령어를 입력하여 파일의 내용을 적용하고 PV 목록을 확인해봅니다.

```shell
kubectl apply -f container-image-registry-pv.yaml
kubectl get pv
```

## Persistent Volume Claim(PVC) 생성

그 다음으로, Persistent volume claim도 생성합니다.  

> [!NOTE]
> Persist volume claim은 사용자가 특정 조건을 만족하는 스토리지(PV)를 사용하겠다고 선언하는 역할을 합니다. 일반적으로 특정 기능을 하는 Pod가 스토리지를 요구할 때, Persistent volume claim을 통해 사전에 정의된 Persistent volume을 사용할 수 있습니다.  

아래의 명령어를 입력하여 PVC에 대한 내용이 담긴 yaml 파일을 열고, 내용을 수정합니다.

```shell
vim container-image-registry-pvc.yaml
```

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: container-image-registry-pvc-<your_namespace>
  namespace: <your_namespace>
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: manual
  selector:
    matchLabels:
      volume: container-image-registry-pv-<your_namespace>
  resources:
    requests:
      storage: 5Gi
```

수정이 완료되었다면, 아래의 명령어를 입력하여 PVC를 생성하고 PVC가 잘 생성되었는지 확인합니다.

```shell
kubectl apply -f container-image-registry-pvc.yaml
kubectl get pvc -n <your_namespace>
```

## Deployment 생성

지금까지는 container image가 push 되었을 때 저장될 스토리지에 대한 설정을 했다면,  
이제는 실제로 container image를 처리하는 pod를 띄우기 위한 과정을 다룹니다.  
우리는 Deployment를 정의하여 pod를 생성합니다.  

아래의 명령어를 입력하여 deployment가 정의된 yaml 파일을 열고, 수정합니다.

```shell
vim container-image-registry.yaml
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: container-image-registry
  namespace: <your_namespace>
spec:
  replicas: 1
  selector:
    matchLabels:
      app: container-image-registry
  template:
    metadata:
      labels:
        app: container-image-registry
    spec:
      nodeSelector: 
        kubernetes.io/hostname: <your_hostname>
      tolerations:
        - key: "node-role.kubernetes.io/master"
          operator: "Exists"
          effect: "NoSchedule"
      containers:
        - name: registry
          image: registry:2
          ports:
            - containerPort: 5000
              hostPort: 5000
          volumeMounts:
            - name: registry-storage
              mountPath: /var/lib/registry
      volumes:
        - name: registry-storage
          persistentVolumeClaim:
            claimName: container-image-registry-pvc-<your_namespace>
```

수정이 완료되었다면, 명령어를 입력하여 deployment를 생성합니다.  
그리고 해당 deployment가 잘 생성되었는지 확인합니다.

```shell
kubectl apply -f container-image-registry.yaml
kubectl get deploy -n <your_namespace>
```

## Build & Push Container Image

이제 container image를 build하고, 구축한 private container image registry로 push할 수 있게 되었습니다.  

아래의 명령어를 입력하여 container image를 build 하고 tag를 붙이고, push 해보겠습니다.  
이전에 사용한 Frontend용 container image와 Backend용 container image 모두에 대해 실행합니다.

```shell
sudo docker build -t <your_namespace>-frontend ~/<your_namespace>/frontend
sudo docker tag <your_namespace>-frontend <your_hostname>:5000/<your_namespace>-frontend
sudo docker push <your_hostname>:5000/<your_namespace>-frontend
```

Frontend를 위한 container image를 build하고 push 했다면, Backend를 위한 container image에 대해서도 동일한 과정을 진행합니다.

```shell
sudo docker build -t <your_namespace>-backend ~/<your_namespace>/backend
sudo docker tag <your_namespace>-backend <your_hostname>:5000/<your_namespace>-backend
sudo docker push <your_hostname>:5000/<your_namespace>-backend
```

이제 직접 build한 container image가 private container image registry에 push되었기 때문에, 해당 container image에 대한 실제 물리적 데이터를 파일 시스템을 통해 확인해보며 잘 저장되었는지 확인할 수 있습니다.  

우리는 Persistent Volume에 대한 yaml 파일에서 각각의 PV가 실습자의 NUC에 설정되도록 만들었습니다.  

따라서 **push된 container image에 대한 물리적 파일을 확인하기 위해서는 각자의 NUC에서 아래의 명령어를 입력해야 합니다.**  

> [!WARNING]
> 아래의 명령어는 ssh로 접속한 터미널이 아니라, 실습자 자신의 터미널을 새로 열고 입력해야 합니다.  

```shell
ls -al /mnt/data/<your_namespace>/registry/docker/registry/v2/repositories
```

지금까지의 과정에서 문제가 발생하지 않았다면, 위의 명령어를 통해 push된 container image를 확인할 수 있을 것입니다.  

## Re-Deployment of Frontend and Backend

이제는 직접 build한 container image로 저번 실습에서 생성한 Frontend, Backend를 다시 배포해보겠습니다.  
간단하게, 이전에 생성한 Deployment와 관련된 yaml 파일의 container image 필드만 수정하면 됩니다.  

아래의 명령어를 입력해서 수정할 파일을 열어주시기 바랍니다.  

```shell
cd ~/<your_namespace>/kubernetes/backend  
vim deployment.yaml  
```

그리고 containers 아래의 image 필드 값을 아래와 같은 값으로 수정합니다.  

```yaml
...

spec:
  containers:
    - name: api
      image: <your_hostname>:5000/<your_namespace>-backend
      ports:
        - containerPort: 3000

...
```

수정을 완료했다면, 아래의 명령어를 입력하여 수정사항을 반영합니다.  

```shell
kubectl apply -f deployment.yaml  
```

이제는 Frontend도 변경해보겠습니다.  
아래의 명령어를 입력해주시기 바랍니다.  

```shell
cd ~/<your_namespace>/kubernetes/frontend  
vim fe-proxy.yaml  
```
그리고 Backend와 마찬가지로, containers 아래의 image 필드 값을 수정합니다.  

```yaml
containers:
  - name: nginx
    image: <your_hostname>:5000/<your_namespace>-frontend  
    imagePullPolicy: Always
```

수정을 완료했다면 아래의 명령어를 입력하여 수정사항을 반영합니다.  

```shell
kubectl apply -f fe-proxy.yaml  
```

Backend와 Frontend를 담당하는 Pod가 모두 재생성되었는지 확인합니다.  

```shell
kubectl get pod -n <your_namespace> -o wide  
```

모든 Pod의 재생성이 완료되었다면 NGINX Pod의 IP 주소를 브라우저에 입력하여 실행 결과를 확인합니다.  