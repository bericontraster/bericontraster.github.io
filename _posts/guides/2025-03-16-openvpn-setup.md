---
title: "Step-by-Step Guide: Setting Up and Troubleshooting OpenVPN on Ubuntu 24.04"
date: 2024-03-16 17:51:00 +0500
image:
    path: "https://miro.medium.com/v2/resize:fit:720/format:webp/0*XjcmrsIEtFfjIA6O"
    alt: OpenVpn Cover Image
toc: true
comments: true
tags: OpenVPN ServerManagement
categories: ["Guides & Tutorials"]
---

Welcome Reader, No hacking today :) We will set up an OpenVPN server on Ubuntu 20.04.

### Install OpenVPN and EasyRSA

We will use apt to install the following packages.

```shell
$ sudo apt install openvpn easy-rsa -y
```
{: .nolineno}

Verify the installation.

```shell
$ openvpn --version
# Expected output
OpenVPN 2.6.x ...
```
{: .nolineno}

### Set Up EasyRSA for Certificate Authority (CA)

Create the directory and initialize EasyRSA.

```shell
mkdir -p ~/easy-rsa
ln -s /usr/share/easy-rsa/* ~/easy-rsa/
cd ~/easy-rsa
cp vars.example vars
```
{: .nolineno}

Editing the `vars` file.

```shell
root@vpn-server:~/easy-rsa# nano vars
# Add the lines at the of the file
set_var EASYRSA_REQ_COUNTRY    "US"
set_var EASYRSA_REQ_PROVINCE   "California"
set_var EASYRSA_REQ_CITY       "San Francisco"
set_var EASYRSA_REQ_ORG        "MyVPN"
set_var EASYRSA_REQ_EMAIL      "admin@example.com"
set_var EASYRSA_REQ_OU         "IT"
```
{: .nolineno}

Save and exit. Now, we will initialize and build the CA.

```shell
root@vpn-server:~/easy-rsa# ./easyrsa init-pki
Notice
------
'init-pki' complete; you may now create a CA or requests.
Your newly created PKI dir is:
* /root/easy-rsa/pki
Using Easy-RSA configuration:
* /root/easy-rsa/vars
root@vpn-server:~/easy-rsa# ./easyrsa build-ca nopass
Using Easy-RSA 'vars' configuration:
< ... SNIP ... >
-----
Common Name (eg: your user, host, or server name) [Easy-RSA CA]:vpn-server
Notice
------
CA creation complete. Your new CA certificate is at:
* /root/easy-rsa/pki/ca.crt
```
{: .nolineno}

### Generate Server Certificate and Keys

Run the following.

```shell
./easyrsa gen-req server nopass
./easyrsa sign-req server server
cp pki/ca.crt pki/issued/server.crt pki/private/server.key /etc/openvpn/
```
{: .nolineno}

Generate the Diffie-Hellman key exchange.

```shell
./easyrsa gen-dh
mv pki/dh.pem /etc/openvpn/
```
{: .nolineno}

Generate a tls-crypt key.

```shell
openvpn --genkey secret /etc/openvpn/ta.key
```
{: .nolineno}

### Configure OpenVPN Server

Create the OpenVPN server config file.

```shell
$ sudo nano /etc/openvpn/server.conf
# Paste this
port 1194
proto udp
dev tun
ca /etc/openvpn/ca.crt
cert /etc/openvpn/server.crt
key /etc/openvpn/server.key
dh /etc/openvpn/dh.pem
tls-crypt /etc/openvpn/ta.key
topology subnet
server 172.16.20.0 255.255.255.0
ifconfig-pool-persist /var/log/openvpn/ipp.txt
push "redirect-gateway def1 bypass-dhcp"
push "dhcp-option DNS 208.67.222.222"
push "dhcp-option DNS 208.67.220.220"
keepalive 10 120
data-ciphers AES-256-GCM:AES-128-GCM:AES-256-CBC
persist-key
persist-tun
status /var/log/openvpn/openvpn-status.log
log-append /var/log/openvpn/openvpn.log
verb 3
explicit-exit-notify 1
auth SHA512
compress lz4
allow-compression asym
client-to-client
```
{: .nolineno}

### Enable and Start OpenVPN

Enable OpenVPN at boot.

```shell
sudo systemctl enable openvpn
```
{: .nolineno}

Start OpenVPN.

```shell
sudo systemctl start openvpn
```
{: .nolineno}

Verify that it’s running.

```shell
$ sudo systemctl status openvpn
● openvpn@server.service - OpenVPN connection to server
     Loaded: loaded (/usr/lib/systemd/system/openvpn@.service; enabled; preset: enabled)
     Active: active (running) since Sun 2025-03-16 07:44:30 UTC; 49ms ago
       Docs: man:openvpn(8)
             https://community.openvpn.net/openvpn/wiki/Openvpn24ManPage
             https://community.openvpn.net/openvpn/wiki/HOWTO
   Main PID: 24898 (openvpn)
     Status: "Initialization Sequence Completed"
      Tasks: 1 (limit: 10)
     Memory: 1.4M (peak: 1.6M)
        CPU: 32ms
     CGroup: /system.slice/system-openvpn.slice/openvpn@server.service
             └─24898 /usr/sbin/openvpn --daemon ovpn-server --status /run/openvpn/server.status 10 --cd /etc/openvpn --script-security 2 --config /etc/open>
Mar 16 07:44:30 vpn-server systemd[1]: Starting openvpn@server.service - OpenVPN connection to server...
Mar 16 07:44:30 vpn-server systemd[1]: Started openvpn@server.service - OpenVPN connection to server..
```
{: .nolineno}

If you face an error, try stopping and starting the service again.

### Setip Firewall for OpenVPN

Enable the firewall and add the following rule.

```shell
sudo ufw enable
sudo ufw allow 1194/udp
sudo ufw reload
```
{: .nolineno}

Check that OpenVPN is listening on port 1194**.**

```shell
$ sudo netstat -tulnp | grep 1194
udp        0      0 0.0.0.0:1194          0.0.0.0:*               1234/openvpn
```
{: .nolineno}

### Create a Client Profile

Generate the client certificate.

```shell
./easyrsa gen-req client1 nopass
./easyrsa sign-req client client1
```
{: .nolineno}

Copy client certificates.

```shell
mkdir -p /etc/openvpn/client
cp pki/ca.crt pki/issued/client1.crt pki/private/client1.key /etc/openvpn/client/
cp /etc/openvpn/ta.key /etc/openvpn/client/
```
{: .nolineno}

Create the client configuration file. The files will be located under `/etc/openvpn/client`. Don’t forget to change the host-ip.

```shell
$ sudo nano /etc/openvpn/client/client1.ovpn
# Paste the following
client
dev tun
proto udp
remote host-ip 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
data-ciphers AES-256-GCM:AES-128-GCM:AES-256-CBC
auth SHA512
compress lz4
allow-compression asym
verb 3
explicit-exit-notify 2
<ca>
-----BEGIN CERTIFICATE-----
(Paste contents of /etc/openvpn/client/ca.crt here)
-----END CERTIFICATE-----
</ca>
<cert>
-----BEGIN CERTIFICATE-----
(Paste contents of /etc/openvpn/client/client1.crt here)
-----END CERTIFICATE-----
</cert>
<key>
-----BEGIN PRIVATE KEY-----
(Paste contents of /etc/openvpn/client/client1.key here)
-----END PRIVATE KEY-----
</key>
<tls-crypt>
-----BEGIN OpenVPN Static key V1-----
(Paste contents of /etc/openvpn/client/ta.key here)
-----END OpenVPN Static key V1-----
</tls-crypt>
```
{: .nolineno}

After creating the file, move the file to the client's machine. I will use my Windows machine to connect with the VPN server.

![Connected Successfuly](https://miro.medium.com/v2/resize:fit:560/format:webp/1*kbpB-_gVP7OllswYEZg1wQ.png)

Verifying the connection.

```shell
PS C:\Users\beric\Downloads\Documents> ping 172.16.20.1 -n 3
Pinging 172.16.20.1 with 32 bytes of data:
Reply from 172.16.20.1: bytes=32 time=8ms TTL=64
Reply from 172.16.20.1: bytes=32 time=3ms TTL=64
Reply from 172.16.20.1: bytes=32 time=3ms TTL=64
Ping statistics for 172.16.20.1:
    Packets: Sent = 3, Received = 3, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 3ms, Maximum = 8ms, Average = 4ms
```
{: .nolineno}

### Enable Internet Access for VPN Clients

Enable IP forwarding with the following command.

```shell
sudo sysctl -w net.ipv4.ip_forward=1
# Permanent Changes
sudo nano /etc/sysctl.conf
# Add or uncomment the following line
net.ipv4.ip_forward=1
# Apply the chnages
sudo sysctl -p
```
{: .nolineno}

Setup NAT for Inernet Routing. We can find our NAT interface with the following command.

```shell
ip route show | grep default
# Expected output
default via 192.168.18.1 dev enp0s3 proto dhcp metric 100
                                |--> Interface
```
{: .nolineno}

Set up NAT (IP Masquerading) to forward VPN traffic.

```shell
sudo iptables -t nat -A POSTROUTING -s 172.16.20.0/24 -o enp0s3 -j MASQUERADE
```
{: .nolineno}

Allow VPN traffic forwarding.

```shell
sudo iptables -A FORWARD -i tun0 -o enp0s3 -j ACCEPT
sudo iptables -A FORWARD -i enp0s3 -o tun0 -m state --state RELATED,ESTABLISHED -j ACCEPT
```
{: .nolineno}

Save the IP tables.

```shell
sudo apt update && sudo apt install -y iptables-persistent
sudo netfilter-persistent save
```
{: .nolineno}

Push Default routes to VPN clients.

```shell
sudo nano /etc/openvpn/server.conf
# Add the following
push "redirect-gateway def1 bypass-dhcp"
push "dhcp-option DNS 8.8.8.8"
push "dhcp-option DNS 1.1.1.1"
```
{: .nolineno}

Save the file and restart the VPN server.

```shell
sudo systemctl restart openvpn@server
```
{: .nolineno}

If you face any errors, please don’t hesitate to ask in the comments. Thanks for reading.