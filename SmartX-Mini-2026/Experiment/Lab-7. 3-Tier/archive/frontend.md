```bash
cd kubernetes/frontend
vim fe-proxy-cm.yaml
```

### edit ConfigMap File

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-proxy-cm
  namespace: <your_namespace>  # Edit This
data:
  app.conf: |
    upstream backend-svc {
      server backend-svc.<your_namespace>.svc.cluster.local:80;  # Edit This
    }
    server {
      listen 80;

      root /usr/share/nginx/html;
      index index.html;

      location /api/ {
        rewrite           ^/api(.*)$ $1 break;
        proxy_pass        http://backend-svc;
        proxy_redirect    off;
        proxy_set_header  Host  $host;
        proxy_set_header  X-Real-IP         $remote_addr;
        proxy_set_header  X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header  X-Forwarded-Host  $server_name;
      }

      location / {
        try_files $uri /index.html;
      }
    }
```

### edit `fe-proxy-svc.yaml`
```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-proxy-svc
  namespace: <your_namespace>
spec:
#...
```

### edit `fe-proxy.yaml`
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-proxy
  namespace: <your_namespace>
spec:
# ...
```

### deploy
```
cd ..
kubectl apply -f ./frontend
```
