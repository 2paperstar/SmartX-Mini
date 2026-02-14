# Kubernetes Reset

```shell
sudo kubeadm reset -f
```

```shell
sudo rm -rf /etc/cni/net.d
```

```shell
sudo rm -rf /etc/kubernetes
sudo rm -rf /var/lib/etcd
sudo rm -rf /var/lib/kubelet
sudo rm -rf /etc/cni
sudo rm -rf /opt/cni
```

```shell
sudo systemctl stop kubelet
sudo systemctl disable kubelet
```

```shell
sudo apt-get purge -y kubeadm kubelet kubectl
sudo apt-get autoremove -y
```

```shell
sudo reboot
```
