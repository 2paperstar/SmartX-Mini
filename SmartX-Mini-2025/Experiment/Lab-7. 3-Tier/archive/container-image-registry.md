```shell
cd ~/<your_namespace>/3-tier-lab/kubernetes/container
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
                - <your_namespace>
```

```shell
kubectl apply -f container-image-registry-pv.yaml
kubectl get pv
```

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

```shell
kubectl apply -f container-image-registry-pvc.yaml
kubectl get pvc -n <your_namespace>
```

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
      containers:
        - name: registry
          image: registry:2
          ports:
            - containerPort: 5000
          volumeMounts:
            - name: registry-storage
              mountPath: /var/lib/registry
      volumes:
        - name: registry-storage
          persistentVolumeClaim:
            claimName: container-image-registry-pvc-<your_namespace>
      nodeSelector:
        kubernetes.io/hostname: <your_namespace>
```

```shell
kubectl apply -f container-image-registry.yaml
kubectl get deploy -n <your_namespace>
```

```shell
vim container-image-registry-svc.yaml
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: container-image-registry
  namespace: <your_namespace>
spec:
  selector:
    app: container-image-registry
  ports:
    - port: 80
      targetPort: 5000
  type: ClusterIP
```

```shell
kubectl apply -f container-image-registry-svc.yaml
kubectl get service -n <your_namespace>
```

```shell
sudo vim /etc/docker/daemon.json
```

```shell
sudo systemctl restart docker
```

```shell
sudo docker build -t <your_namespace>-frontend ~/<your_namespace>/3-tier-lab/frontend
sudo docker tag <your_namespace>-frontend <svc-ip>/<your_namespace>-frontend
sudo docker push <svc-ip>/<your_namespace>-frontend
```

```shell
sudo docker build -t <your_namespace>-backend ~/<your_namespace>/3-tier-lab/backend
sudo docker tag <your_namespace>-backend <svc-ip>/<your_namespace>-backend
sudo docker push <svc-ip>/<your_namespace>-backend
```

```shell
ls -al /mnt/data/<your_namespace>/registry/docker/registry/v2/repositories
```
