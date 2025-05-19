# Helm Install / Prometheus+Grafana Deployment

## Helm Install

```bash
cd ~
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
```

```bash
helm version
helm repo list
helm list -A
```

## Prometheus + Grafana Install

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo list
helm repo update
```

```bash
helm list -n <your_namespace>
helm install prometheus prometheus-community/kube-prometheus-stack -n <your_namespace> --create-namespace
helm list -n <your_namespace>

kubectl get pods -n <your_namespace>
kubectl get svc -n <your_namespace>

# prometheus-grafana의 svc에 해당하는 ip로 접근
```

```bash
# ID: admin
# PW: 아래 출력 결과output (아마 prom-operator)
kubectl get secret --namespace <your_namespace> monitoring-grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
```
