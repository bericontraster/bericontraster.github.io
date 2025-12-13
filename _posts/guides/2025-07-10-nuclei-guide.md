---
title: Nuclei Vulnerability Scanner HandBook
date: 2025-07-10 14:24:00 +0500
image:
    path: "https://pbs.twimg.com/media/Fb4i5VLXEAIHFPD.png"
    alt: Nuclei Cover Image
toc: true
comments: true
tags: guide nuclei vulnerability-scanning
categories: ["vulnerability-scanner"]
description: Learn how to harness the power of Nuclei, a fast, customizable vulnerability scanner from ProjectDiscovery. This guide walks you through installation, template usage, and practical examples to help automate security testing across web applications and infrastructure with ease.
---

## Nuclei

[Nuclei](https://github.com/projectdiscovery/nuclei) is a fast, flexible, and community-driven vulnerability scanner developed by ProjectDiscovery. Unlike traditional scanners, Nuclei uses customizable templates written in YAML, allowing security professionals to define and automate checks for a wide range of vulnerabilities from misconfigurations and CVEs to exposed panels and security headers. Its modular nature, speed, and extensibility make it a powerful tool for bug bounty hunters, penetration testers, and red teams aiming to scale their reconnaissance and vulnerability discovery efforts with precision and efficiency.

### Installation
To install Nuclei, we'll first install Go (Golang) using apt, and then fetch Nuclei using the Go toolchain.

```shell
sudo apt update && sudo apt install golang-go -y
```
{: .nolineno}

This will install the latest stable release of Nuclei and place the binary in `$HOME/go/bin`.

```shell
go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest
```
{: .nolineno}

To make nuclei accessible system-wide:

```shell
mkdir -p /usr/local/go/bin
cp /root/go/bin/nuclei /usr/local/go/bin/
```
{: .nolineno}

Verify Installation

```shell
nuclei -version
```
{: .nolineno}

## Nuclei Usage
### Basic Scan
After installing the tool, it can be as simple as running (for a single target):

```shell
nuclei -u https://my.target.site
```
{: .nolineno}

List of targets.

```shell
nuclei -l /path/to/list-of-targets.txt
```
{: .nolineno}

These commands will use Nuclei to scan for thousands of known vulnerabilities and enumerate information about the target(s).

### Filtering Templates
#### Automatic Selection (-as)

This option attempts to fingerprint the technology stack and components used on the target, then select templates that have been tagged with those tech stack keywords. Example:

```shell
nuclei -u https:// my.target.site -as
```
{: .nolineno}

#### Only New Templates (-nt)
This option will use only templates that were added from the last update (for example by running nuclei -update-templates). Example:

```shell
nuclei -u https://my.target.site -nt
```
{: .nolineno}

#### Specific Templates By Filename (-t)
This option will run specific individual templates. Instead of a single filename, a file containing a list of template filenames (one per line) can be supplied as the argument. Multiple -t arguments can be provided.

```shell
nuclei -u https://my.target.site -t file/logs/python-app-sql-exceptions.yaml -t exposures/files/pyproject-disclosure.yaml
```
{: .nolineno}

```shell
user@kali:~/nuclei-templates$ cat templates-35.txt
file/logs/python-app-sql-exceptions.yaml
exposures/files/pyproject-disclosure.yaml
```
{: .nolineno}

```shell
user@kali:~/nuclei-templates$ nuclei -u https://my.target.site -t templates-35.txt
```
{: .nolineno}

[More Options](https://projectdiscovery.io/blog/ultimate-nuclei-guide#filtering-templates)

### Rate Limiting
Nuclei features a number of options to limit the rate the scanning engine sends requests to the target. These options prevent disrupting the availability of a target or where there are bandwidth issues between our host and the target. These options allow restricting the number of requests being sent (150 per second by default) and how many concurrent templates are executed (25 by default). Example (restrict outgoing requests to 3 per second and only 2 concurrent templates):

```shell
nuclei -u https://my.target.site/ -rl 3 -c 2
```
{: .nolineno}

## Credits
**Credits:** Based on [ProjectDiscovery](https://github.com/projectdiscovery/nuclei)'s official documentation.
