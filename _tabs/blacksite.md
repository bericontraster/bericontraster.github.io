---
title: BlackSite
icon: fas fa-user-secret
order: 1
draft: false
toc: true
tags: Blacksite vulnerable-vms active-directory ctf-challenges windows
---

Blacksite is a collection of vulnerables lab environments built to practice, learn, and teach real-world offensive security at a deeper level. Each lab simulates the misconfigurations, adversary tradecraft, and privilege escalation chains found in actual internal networks and red-team engagements.

Blacksite started as a way to go past passing certifications and actually master the mechanics behind the attacks building the vulnerability myself, from the ground up, forces an understanding that no walkthrough or course ever could. Every lab in this series is designed, broken, and rebuilt by hand before release, with the goal of giving others that same depth of understanding when they work through it.

> Disclaimer: All labs are built for learning and defensive understanding only. They must be used strictly in isolated environments that you own and control.
{: .prompt-warning}


## SillyAuthority 

<p align="left">
  <img src="/assets/img/blacksite/sillyauthority-cover-by-bericontraster.png" alt="SillyAuthority" width="130">
</p>

> The writeup is available on [Medium](https://medium.com/@bericontraster/inside-sillyauthority-a-complete-pentest-of-a-purpose-built-ad-lab-7fc6978e18f8).

**Name:** SillyAuthority  
**Difficulty:** Medium  
**Release Date:** 19 Nov, 2025  
**Author:** Muhammad Zubair (@bericontraster)  
**Download:** `SillyAuthority.ova` [drive.google.com](https://drive.google.com/drive/folders/1XId5DdpxgJJox9QtcSIbFcQHZMp4mNQW?usp=sharing) (Size: 6.29GB)  
**Tags:** `Windows` `Active Directory` `Privilege Escalation`  
**OVA MD5:** `ACABB3020EA0CC82BE0DC208C5D04A80`  
**Supported Hypervisors:** VirtualBox, VMware Workstation / Fusion  



## Cascading Trust 

<p align="left">
  <img src="/assets/img/blacksite/cascading-trust-by-bericontraster.png" alt="SillyAuthority" width="130">
</p>

The client has provided the following credentials for authenticated testing of the environment: `ethan.mercer:E7han!Ops#Mercury26`.

> The writeup will be available on [Medium](https://medium.com/@bericontraster) soon.

**Name:** Cascading Trust  
**Difficulty:** Medium  
**Release Date:** 10 Sep, 2026    
**Author:** Muhammad Zubair (@bericontraster)  
**Download:** `Cascading Trust.7z` [drive.google.com](https://drive.google.com/drive/folders/1o8bn4Msu7nkRg5Afcu0eV7eUHtYVUSIa?usp=sharing) (Size: 5.62GB)    
**Tags:** `Windows` `Active Directory` `Enumeration` `Privilege Escalation`  
**OVA MD5:** `B0BDC37B3016963D97B5C0CA5A677579`   
**Supported Hypervisors:** VirtualBox, VMware Workstation / Fusion    

## Setup Guide

1. Download the zipped lab files from the provided URL.
2. Extract the archive and verify the MD5 checksum to make sure the file wasn't corrupted or tampered with during download.
3. Import the .ova file into VirtualBox or your preferred hypervisor (VMware Workstation/Fusion also supported).
4. Set the network adapter to NAT, do not bridge this VM or otherwise expose it to your local network or the internet. These machines are intentionally vulnerable.
5. Boot the VM. The machine will pick up an IP via DHCP automatically, no static IP is configured, and network details have been stripped during export. Boot your attacker VM on the same NAT network, then scan to discover the target (e.g. `nmap -sn <subnet>/24` or [Netdiscover](https://github.com/netdiscover-scanner/netdiscover)) before starting enumeration.

> These labs are intentionally vulnerable by design. Never expose them to an untrusted network or the public internet.
{: .prompt-warning}

The commands to get the MD5 hashes are listed below.

```shell
# Linux
md5sum filename.ova

# macOS
md5 filename.ova

# Windows (PowerShell/CMD)
certutil -hashfile filename.ova MD5
```
{: .nolineno}

## Who This Is For

These labs are meant for anyone practicing and learning offensive security techniques, whether you're just getting started with Active Directory attacks or looking for something more challenging to work through.

Some labs include full writeups explaining how they were built, step-by-step, not just the solve path, but the reasoning behind how each vulnerability was designed. If you want to understand the "why" behind a misconfiguration and not just the exploit itself, those writeups are worth reading.

The labs also align well with OSCP, CPTS and similar certifications, so working through them should help with exam prep. That said, they weren't built purely around exam objectives, some go a bit further than what OSCP typically covers, so there's still value here even if you're already certified.

## Future Plans
More advanced vulnerable lab environments will be added over time, all created to support the community’s growth and understanding of enterprise security. Collaboration is always welcome; anyone interested in contributing or co-building labs is encouraged to reach out.