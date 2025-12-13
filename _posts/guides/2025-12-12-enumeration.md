---
title: Enumerating The Target
date: 2025-12-12 12:00:00 +0500
image:
    path: "https://images.squarespace-cdn.com/content/v1/5b6d93494eddecacd175e239/1574087871944-A4ON7R1F17VR7VQP4GWA/Tenable+Nessus+banner.png?format=1500w"
    alt: Nessus
toc: true
comments: true
published: false
tags: guide tool
categories: ["vulnerability-scanner"]
description: Exploring Nessus for efficient vulnerability assessments, learn how to set up scans, interpret findings, and prioritize security fixes.
---


## Directory Enumeration

### Dirsearch
A command-line tool designed to brute force directories and files in webservers. [Installation](https://www.kali.org/tools/dirsearch/)

The following command will perform a directory enumeration on target.
```shell
dirsearch -u {targetURL}
```
{: .nolineno}

### FFUF

```shell
ffuf -w {wordlist} -u {targeturl}/FUZZ
```
{: .nolineno}

[Cheat Cheet](https://www.phrack.me/tools/2022/07/06/Ffuf-cheatsheet.html)

## Domain Enumeration

### FFUF
```shell
ffuf -u {targeturl} -H "Host: FUZZ.{target.domain}" -w {wordlist}
```
{: .nolineno}

## Wordlists
The following wordlists table below is from seclists.

| Wordlist /usr/share/seclists | Description |
| ------ | ---------- |
| `/usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-small.txt` | Directory/Page |
| Discovery/Web-Content/web-extensions.txt | Extensions |
| /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-20000.txt | Sub Domain |
| Web-Content/burp-parameter-names.txt | Parameters |

