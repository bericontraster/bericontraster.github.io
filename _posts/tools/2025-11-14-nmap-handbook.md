---
title: Nmap Cheat Sheet
date: 2025-11-14 17:51:00 +0500
image:
    path: "assets/img/posts/nmap-cheatsheet/nmap-logo.png"
    alt: Nmap Eye Logo
toc: true
comments: true
tags: guide tools enumeration
categories: ["network-tools"]
description: A quick-access reference covering essential Nmap commands, scanning techniques, evasion tricks, and enumeration options for fast and effective network reconnaissance.
---

## What is NMAP?    

[Nmap](https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://en.wikipedia.org/wiki/Nmap&ved=2ahUKEwifksPOouSOAxVms1YBHdHtObYQmhN6BAg0EAQ&usg=AOvVaw0PI_u5gUbhEAOzSewimiSk) is a network scanner created by Gordon Lyon. Nmap is used to discover hosts and services on a computer network by sending packets and analyzing the responses. Nmap provides a number of features for probing computer networks, including host discovery and service and operating system detection.

```shell
nmap -sC -sV -p -vvv IP -oX "filename.xml"
```
{: .nolineno}

Convert the `.xml` file to `.html`.
```shell
apt install xsltproc
xsltproc filename.xml -o filename.html
```
{: .nolineno}

## Nmap Target Specification
Define the specific IPs, ranges, or subnets you want Nmap to examine during reconnaissance. 

| COMMAND    | DESCRIPTION |
| -------- | ------- |
| nmap $targetip | Scan a single IP    |
| nmap 10.10.10.10 10.10.10.20 | Scan specific IPs     |
| nmap 10.10.10.10-20    | Scan a range of IPs    |
| nmap $domain   | Scan a domain |
| nmap 10.10.10.0/24 | Scan using CIDR notation |
| nmap -iL $filename | Scan a list of targets |
| nmap -iR 20 | Scan 20 random hosts | 
| nmap -exclude $targetip | Exclude listed IP |


## Bypassing Filters


| SWITCH | DESCRIPTION |
|--------|-------------|
| -f | Fragment packets |
| -g 80 | Spoof source port |
| -D RND:10 | Use random decoys |
| -sI $zombieip $targetip | Idle (zombie) scan |
| -sA | ACK scan |
| `--spoof-mac` | Spoof MAC address |

## Saving Scans

| SWITCH | DESCRIPTION |
|--------|-------------|
| -oX | Output in XML format |
| -oN | Normal text output |
| -oG | Greppable output |
| -oA | Output in all formats |
| `-append-output` | Append to existing output |

## Scan Timming 

| SWITCH |	DESCRIPTION |
|--------|--------------|
| -T0 | Paranoid (very slow, IDS evasion) |
| -T1 | Sneaky (slow, quiet) |
| -T2 |	Polite (reduced speed) |
| -T3 | Normal (default timing)	 |
| -T4 |	Aggressive (fast scan) |
| -T5 | Insane (very fast, noisy) |

## Service & Version Detection

| SWITCH | DESCRIPTION |
|--------|-------------|
| -sV | Service/version detection |
| -sC | Run default scripts |
| -A  | Aggressive scan (OS, scripts, traceroute) |
| `--script` | Run specific NSE scripts | 
| -O | OS detection |

## Resources

- [Nmap Cheat Sheet](https://www.stationx.net/nmap-cheat-sheet/)