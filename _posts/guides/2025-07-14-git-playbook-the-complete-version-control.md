---
title: "Git Playbook: The Complete Guide to Git Commands for Version Control"
date: 2025-07-14 12:40:00 +0500
image:
    path: https://miro.medium.com/v2/resize:fit:1100/format:webp/1*JLYlSLSK8-AZo8gt9UdYqA.jpeg
    alt: Github Cover Image
toc: true
comments: true
draft: false
tags: guide github guide
categories: ["administration"]
description: "If you’ve ever felt a bit lost setting up Git on Linux, you’re not alone and this blog is here to help. I’ll walk you through everything you need to get Git up and running, from installing it to setting up your name, email, and SSH keys. By the end, you won’t just have Git installed you’ll know how to actually use it like a pro."
---

## What is Git?

Git is a free, open-source version control system that helps you track changes in your code over time. Think of it as a powerful undo button for your projects whether you’re working alone or collaborating with others. It lets you save snapshots of your work, switch between versions, and collaborate without overwriting each other’s code. Git is fast, flexible, and has become the industry standard for managing code especially when paired with platforms like GitHub or GitLab.

## Installation

If you’re on Fedora (or any closely-related RPM-based distribution, such as RHEL or CentOS), you can use dnf:  

```bash
sudo dnf install git-all
```  
{: .nolineno}

If you’re on a Debian-based distribution, such as Ubuntu, try apt: 

```shell
apt update && apt install git -y
```
{: .nolineno}

We can download Git for windows from [here](https://git-scm.com/downloads/win). For more details on installation please visit this guide from [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).

Once installed we can verify the installation in our terminal with:
```shell
git --version
```
{: .nolineno}

## Configuring Git

Once Git is installed, it's important to configure your identity so that your commits are properly attributed. This information is stored in your Git configuration file and will be used in every repository you work with.

Start by setting your name and email address:

```shell
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```
{: .nolineno}

The `--global` flag ensures that these settings apply to all repositories on your system. If you want to override these details for a specific project later, you can re-run the same commands without `--global` from within that repository.

```shell
git config --list
```
{: .nolineno}

This will display your Git setup, including user information, editor, and other useful defaults.

## Setting Up SSH Keys

To securely connect your local Git setup with services like GitHub or GitLab, it’s recommended to use SSH authentication. This avoids entering your username and password every time you push or pull from a remote repository.

### Step 1: Check for existing SSH keys

First, check if you already have an SSH key:

```shell
ls -al ~/.ssh
```
{: .nolineno}

If you see files like `id_rsa` and `id_rsa.pub`, you already have a key pair.

### Step 2: Generate a new SSH key

If you don’t have one, or want a fresh key for Git:

```shell
ssh-keygen -t ed25519 -C "you@example.com"
```
{: .nolineno}

If you're using an older system that doesn’t support `ed25519`, use:

```shell
ssh-keygen -t rsa -b 4096 -C "you@example.com"
```
{: .nolineno}

Just press Enter through the prompts to use the default file location and no passphrase (or set one if you prefer more security).

### Step 3: Add the SSH key to your agent

```shell
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```
{: .nolineno}

### Step 4: Adding Your SSH Key to GitHub

1. Copy your public SSH key to the clipboard:

```shell
cat ~/.ssh/id_ed25519.pub
```
{: .nolineno}

2. Go to [GitHub → Settings → SSH and GPG keys](https://github.com/settings/keys)

![New SSH Key](/assets/img/images/new-ssh-key.png)

3. Click “New SSH key”, give it a name (like “my-ssh-key”), and paste the key
4. Click Add SSH key

## Git CheatSheet

### Create / Clone Repository
```shell
git init                     # Initialize new Git repo
git clone <url>              # Clone existing repo
```
{: .nolineno}

### Working with Files
```shell
git status                   # Show file changes
git add <file>               # Stage specific file
git add .                    # Stage all files
git restore <file>           # Unstage or discard changes
```
{: .nolineno}

### Committing Changes
```shell
git commit -m "message"      # Commit staged changes
git commit -am "message"     # Stage + commit tracked files
```
{: .nolineno}

### Syncing with Remote
```shell
git remote add origin <url>  # Add remote repo
git push -u origin main      # Push to remote (first time)
git push                     # Push changes
git pull                     # Pull latest changes
```
{: .nolineno}

### Branching
```shell
git branch                   # List branches
git branch <name>            # Create branch
git checkout <name>          # Switch branch
git switch -c <name>         # Create and switch
git merge <name>             # Merge branch into current
git branch -d <name>         # Delete branch
```
{: .nolineno}

### Viewing History
```shell
git log                      # Full commit history
git log --oneline --graph    # Visual history
git show <commit>            # Show specific commit
```
{: .nolineno}

### Undo / Reset
```shell
git reset --soft HEAD~1      # Undo last commit (keep changes)
git reset --hard HEAD~1      # Remove commit + changes
git revert <commit>          # Create revert commit
```
{: .nolineno}

### Tags
```shell
git tag                      # List tags
git tag <v1.0>               # Create tag
git push origin <tagname>    # Push tag
```
{: .nolineno}

