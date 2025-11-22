---
title: Nmap Cheat Sheet
date: 2025-11-14 17:51:00 +0500
image:
    path: "https://www.vaadata.com/blog/wp-content/uploads/2025/05/Nmap.png"
    alt: Nessus
toc: true
comments: true
tags: guide tools enumeration
categories: ["network-tools"]
description: A quick-access reference covering essential Nmap commands, scanning techniques, evasion tricks, and enumeration options for fast and effective network reconnaissance.
---

## What is NMAP?    

Nmap is a free and open-source tool for network discovery and security auditing that scans networks to discover hosts, services, and operating systems

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