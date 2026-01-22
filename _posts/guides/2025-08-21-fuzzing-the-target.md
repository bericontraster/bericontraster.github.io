---
title: "Fuzzing The Web: 101"
date: 2025-07-30 12:27:00 +0500
image:
    path: https://images.unsplash.com/photo-1764598218868-a2a64655aec1?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D
    alt: Netowrk Penetration Testing Guide Cover Image
toc: true
comments: true
published: true
tags: [fuzzing, pentesting, bugbounty, websecurity, wordlists, tools]
categories: ["pentesting", "web-app-security"]
description: >
  A complete fuzzing guide for penetration testers and bug bounty hunters. 
  Learn how to discover hidden domains, directories, and files using the best 
  wordlists and tools like ffuf, dirsearch, Gobuster, and more. Step-by-step 
  commands and practical examples included to help automate reconnaissance 
  and maximize your attack surface discovery.
---

> This article is not completed yet.
{: .prompt-warn}

## Fuzzing Subdomain

### FFUF 
Fuzzing the subdomain using the following ffuf command.

```shell
ffuf -u https://FUZZ.domain.com/ -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-110000.txt -fc 403
```
{: .nolineno}

#### Filter Output

![Filter Output FFUF](/assets/img/posts/fuzzing-the-web/filter-help-ffuf.png)

## Fuzzing Directories

### Feroxbuster

```shell
feroxbuster -u https://domain.com/ -w /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt --filter-words 17
```
{: .nolineno}

#### Filter Output
![Filter Output Feroxbuster](/assets/img/posts/fuzzing-the-web/filter-help-feroxbuster.png)

