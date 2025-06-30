---
title: "Install and Configure Git on Any Linux Distribution"
date: 2025-06-30
description: "If you’ve ever felt a bit lost setting up Git on Linux, you’re not alone and this blog is here to help. I’ll walk you through everything you need to get Git up and running, from installing it to setting up your name, email, and SSH keys. By the end, you won’t just have Git installed you’ll know how to actually use it like a pro."
draft: false
author: "bericontraster"
type: "post"
tags: ["linux", "tools", "linux management", "github"]
categories: ["tools"]
cover: 'https://images.unsplash.com/photo-1618401479427-c8ef9465fbe1?q=80&w=1143&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
alt: 'Install and Configure Git on Any Linux Distribution Cover Image'
translationKey: 'media'
stage: 'robot'
toc: true
---

{{< figure src="cover" caption="alt" >}}

## What is Git?

Git is a free, open-source version control system that helps you track changes in your code over time. Think of it as a powerful undo button for your projects whether you’re working alone or collaborating with others. It lets you save snapshots of your work, switch between versions, and collaborate without overwriting each other’s code. Git is fast, flexible, and has become the industry standard for managing code especially when paired with platforms like GitHub or GitLab.

## Installation

If you’re on Fedora (or any closely-related RPM-based distribution, such as RHEL or CentOS), you can use dnf:  

```bash
sudo dnf install git-all
```  
  
If you’re on a Debian-based distribution, such as Ubuntu, try apt: 

```shell
apt update && apt install git -y
```

We can download Git for windows from [here](https://git-scm.com/downloads/win). For more details on installation please visit this guide from [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).

Once installed we can verify the installtion in our terminal with:
```shell
git --version
```

## Configuring Git

Once Git is installed, it's important to configure your identity so that your commits are properly attributed. This information is stored in your Git configuration file and will be used in every repository you work with.

Start by setting your name and email address:

```shell
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

The `--global` flag ensures that these settings apply to all repositories on your system. If you want to override these details for a specific project later, you can re-run the same commands without `--global` from within that repository.

```shell
git config --list
```

This will display your Git setup, including user information, editor, and other useful defaults.

## Setting Up SSH Keys

To securely connect your local Git setup with services like GitHub or GitLab, it’s recommended to use SSH authentication. This avoids entering your username and password every time you push or pull from a remote repository.

### Step 1: Check for existing SSH keys

First, check if you already have an SSH key:

```shell
ls -al ~/.ssh
```

If you see files like `id_rsa` and `id_rsa.pub`, you already have a key pair.

### Step 2: Generate a new SSH key

If you don’t have one, or want a fresh key for Git:

```shell
ssh-keygen -t ed25519 -C "you@example.com"
```

If you're using an older system that doesn’t support `ed25519`, use:

```shell
ssh-keygen -t rsa -b 4096 -C "you@example.com"
```

Just press Enter through the prompts to use the default file location and no passphrase (or set one if you prefer more security).

### Step 3: Add the SSH key to your agent

```shell
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### Step 4: Adding Your SSH Key to GitHub

1. Copy your public SSH key to the clipboard:

```shell
cat ~/.ssh/id_ed25519.pub
```

2. Go to [GitHub → Settings → SSH and GPG keys](https://github.com/settings/keys)

![New SSH Key](/images/new-ssh-key.png)

3. Click “New SSH key”, give it a name (like “my-ssh-key”), and paste the key
4. Click Add SSH key