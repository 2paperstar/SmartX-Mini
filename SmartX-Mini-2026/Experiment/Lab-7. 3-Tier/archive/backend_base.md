# Backend deployment

### Directory Architecture

```bash
.
├── backend
│   ├── dist
│   ├── Dockerfile
│   ├── eslint.config.mjs
│   ├── nest-cli.json
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   ├── prisma
│   ├── README.md
│   ├── src
│   ├── tsconfig.build.json
│   └── tsconfig.json
├── frontend
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   ├── README.md
│   ├── src
│   └── vite.config.js
├── kubernetes
│   ├── backend
│   └── database
└── README.md
```

각자 nuc01, nuc02, nuc03 디렉터리 만들고 그 안에서 git clone 받도록 해야 함
그리고 각자 네임스페이스를 만들도록 명령어 추가

## Database deployment on Kubernetes

**Deploy `postgres-pv.yaml`**

Persistent Volume 생성

```bash
# 여기 경로도 수정해야 함
cd ~/3-tier-lab/kubernetes/database
vim postgres-pv.yaml
```

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: postgres-pv-<your_namespace>
  labels:
    volume: postgres-pv-<your_namespace>
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  storageClassName: standard
  hostPath:
    path: /mnt/data/postgres #여기 각각의 nuc마다 경로 다르게 /mnt/data/nuc01/postgres
  persistentVolumeReclaimPolicy: Retain
```

```bash
kubectl apply -f postgres-pv.yaml
kubectl get pv
```

**Deploy `postgres.yaml`**

```bash
vim postgres.yaml
```

```yaml
# postgres.yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
  namespace: <your_namespace> # You need to replace this with your own namespace
type: Opaque
stringData:
  POSTGRES_USER: myuser
  POSTGRES_PASSWORD: mypassword # Don't use this kind of password in real life. It's just for study.
  POSTGRES_DB: mydb
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: <your_namespace> # You need to replace this with your own namespace
spec:
  selector:
    app: postgres
  ports:
    - port: 5432
      targetPort: 5432
  type: ClusterIP
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: <your_namespace> # You need to replace this with your own namespace
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:16
          envFrom:
            - secretRef:
                name: postgres-secret
          ports:
            - containerPort: 5432
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: standard
        selector:
          matchLabels:
            volume: postgres-pv-<your_namespace>
        resources:
          requests:
            storage: 5Gi
```

```bash
kubectl apply -f postgres.yaml
kubectl get secret -n <your_namespace>
kubectl get svc -n <your_namespace>
kubectl get statefulset -n <your_namespace>
```

## Backend deployment on Kubernetes

**Deploy `secret.yaml`**

```bash
# 여기도 경로 수정
cd ~/3-tier-lab/kubernetes/backend
vim secret.yaml
```

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: backend-secret
  namespace: <your_namespace> # You need to replace this with your own namespace
type: Opaque
stringData:
  DATABASE_URL: "postgresql://myuser:mypassword@postgres.<your_namespace>.svc.cluster.local:5432/mydb"
  PASSWORD_SECRET: <your_password_secret> # You need to replace this with your own secret like random string
```

```bash
kubectl apply -f secret.yaml
kubectl get secret -n <your_namespace>
```

**Deploy `deployment.yaml`**

```bash
vim deployment.yaml
```

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-api
  namespace: <your_namespace> # You need to replace this with your own namespace
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend-api
  template:
    metadata:
      labels:
        app: backend-api
    spec:
      containers:
        - name: api
          image: cjfgml0306/backend:latest
          ports:
            - containerPort: 3000
          envFrom:
            - secretRef:
                name: backend-secret
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
```

```bash
kubectl apply -f deployment.yaml
kubectl get deploy -n <your_namespace>
```

**Deploy `service.yaml`**

```bash
vim service.yaml
```

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-svc
  namespace: <your_namespace> # You need to replace this with your own namespace
spec:
  selector:
    app: backend-api
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
```

```bash
kubectl apply -f service.yaml
kubectl get svc -n <your_namespace>
```
