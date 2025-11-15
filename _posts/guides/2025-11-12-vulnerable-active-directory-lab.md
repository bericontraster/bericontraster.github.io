---
title: "Building a Vulnerable Active Directory Lab for Penetration Testing: A Practical Walkthrough"
date: 2025-11-15 12:27:00 +0500
image:
    path: "https://miro.medium.com/v2/resize:fit:1100/format:webp/0*z8dSR_gomnO2wvl7.jpeg"
    alt: "Building a Vulnerable Active Directory Lab for Penetration Testing: A Practical Walkthrough"
toc: true
comments: true
tags: guide pentesting active-directory red-teaming
categories: ["pentesting"]
description: Learn how to build a vulnerable Active Directory lab for penetration testing and ethical hacking practice. This step-by-step guide helps you simulate real-world AD attacks, strengthen your red-team skills, and master Windows domain exploitation in a safe environment. 
---


Why You Should Learn Active Directory
-------------------------------------

Active Directory is the backbone of identity and access control in most enterprise environments. For penetration testers, defenders, and sysadmins, understanding AD, including its authentication flows, delegated rights, and common misconfigurations, is essential, and the best way to learn AD is to build it yourself. When I first started learning AD back in 2022, it was a nightmare for me, but now AD is my favourite.

Before We Start
---------------

Writing this article took me four days, and I’ve done my best to make it both easy to follow and informative. My next blog will focus on attacking this lab, and I’ll also provide a downloadable version of the environment. Make sure to follow so you don’t miss new content. If you run into any issues or have questions, feel free to reach out.

If you are new to Active Directory, I recommend reading my previous blog.

<div style="border:1px solid #043927; padding:1em; display:flex; align-items:center; border-radius:15px;">
  <div style="flex:1;">
    <strong><a href="https://medium.com/@bericontraster/master-active-directory-a-complete-beginners-to-intermediate-guide-2f5faf9a4fa5" target="_blank">Master Active Directory: A Complete Beginner’s to Intermediate Guide</a></strong>
    <p style="margin:0.3em 0;">A practical walkthrough of Active Directory’s core components, authentication system, and administrative functions.</p>
    <small><a href="https://medium.com" target="_blank">medium.com</a></small>
  </div>
  <img src="https://miro.medium.com/v2/resize:fit:1100/format:webp/0*z8dSR_gomnO2wvl7.jpeg" alt="Active Directory" style="width:100px; margin-left:1em; border-radius:4px;">
</div>


Overview
--------

In this guide, I’ll walk you through building an isolated, vulnerable Active Directory lab that shows how attacks are crafted, how to mitigate them, and what to do when you find these issues in the wild. By the end of this, you’ll have a deep understanding of AD, and you’ll start to love it like I do

### Vulnerable Active Directory Lab Flowchart

The flowchart below shows the user, the attacks, the machines, and the flow from initial access through to gaining admin rights on the Domain Controller.

![Vulnerble AD Lab Flowchart](https://miro.medium.com/v2/resize:fit:1086/format:webp/1*fhztHqWzpIdtmxy15p4VMA.png)

> **Note:** The user _Harry_ can abuse the **ESC1** vulnerability to gain administrator rights on the Domain Controller (DC). However, for the sake of learning, we’ll focus on abusing **GenericAll** rights and then dumping hashes to perform a **Pass-the-Hash** attack to gain access to the DC.
{: .prompt-info}

### Prereuiqists

I will be using VirtualBox for the labs. There will be two Windows machines and a Kali instance.

*   Domain Controller ([Windows Server 2019](https://www.microsoft.com/en-us/evalcenter/download-windows-server-2019))
*   One [Windows 10 Enterprise](https://www.microsoft.com/en-us/software-download/windows10) (User Machines)
*   [Kali Linux](https://www.kali.org/) (Our Attacking Machines)
*   60GB — 80GB Storage & 16GB — 34GB RAM

Setting Up Windows Server 2019
------------------------------

You can download [**VirtualBox**](https://www.virtualbox.org/wiki/Downloads) and start installing Windows Server 2019 by attaching the ISO to a new VM and following the installer prompts. I’ll skip a step-by-step walkthrough of the Windows installation itself. We’ll be using 4GB RAM, 2 CPUs for the domain controller.

![Attaching the ISO image](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*i1PlTv6GSsFAWVmH7ypu7g.png)
![Specifying the Base Memory & CPUs](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*li_whXYAZGA_gyegUjKJvQ.png)
![Creating 25GB Preallocated Sotrage](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*iC0pZjMybS8oD8hf3hVGLg.png)

When prompted to select Operating System, select Windows Server 2019 Standard Evaluation (Desktop Experience).

![Select Operating System](https://miro.medium.com/v2/resize:fit:1382/format:webp/1*QJX5Zdl0U2fQ2EiUHEpI8Q.png)

When prompted for the Administrator password, use `Admin#90`

### Configuring NAT Network

After the installation is done. We will create a NAT Network for our lab. I named my Nat Network “Nebula Network” with `10.10.10.0/24` IPv4 Prefix. Check the `Enable DHCP` option.

![NAT Network Configuration](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*eJ26EtgU2bNYTJU8w6D0fQ.png)

Once the configuration is done, click Apply, and our NAT Network will be ready to use. Open the settings of our Domain Controller VM and switch to the Network tab, and select NAT Network. Click Ok, and the changes will be saved.

![Changing Network Type](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*mMvRYo8yjXSJtClU7ojvDA.png)

### Assigning a Static IPv4 Address

Once our Server is powered on. Log in and open IPv4 settings from the control panel, and assign the following IPv4 settings for DC01. Click OK, and our settings will be saved.

![Static IPv4 Settings](https://miro.medium.com/v2/resize:fit:790/format:webp/1*s7WI7UKK7dP2upFv8gsfEQ.png)

### Renaming Our DC

I renamed my domain controller's Pc name `Nebula-DC` It’ll help us identify it more easily. We’ll need to restart our PC after renaming it.

![Renaming Our Pc](https://miro.medium.com/v2/resize:fit:1348/format:webp/1*atRfK7pyohhWfW1SygJeyw.png)

Configuring Domain Controller
-----------------------------

We will use Server Manager for configuring and managing Active Directory. Server Manager is the built-in Windows Server console that gives us a quick dashboard of server roles, features, and basic health. We can use it to add roles (for example, install **Active Directory Domain Services**), promote a server to a domain controller, view installed features, and manage multiple servers from one pane. It’s ideal when we’re learning because the Add Roles and Features wizard walks us through the steps, and the Dashboard shows us what’s installed.

![Server Manager Active Directory](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*GTc6DvonWPYvF5Q9HJDfqw.png)

### Enabling Active Directory Domain Services

AD Domain Services is a Microsoft service that provides a centralized, hierarchical directory for managing network resources like users, computers, and groups. It authenticates users and controls access to resources using security protocols, making it a core component of identity and access management for Windows networks. Key features include a structured data store, a replication system for redundancy, and tools like Group Policy Objects for central administration

Click Manage from the menu on the top-right and select “**Add Roles and Features**”.

![Adding Roles and Features](https://miro.medium.com/v2/resize:fit:486/format:webp/1*wdtbr5Warua8IgACEia6xw.png)

*   Click Next on “**Before you begin**”.
*   Click Next on “**Installation Type**” with the default options.
*   Click Next on “**Server Selection**” with the default options.
*   From there, select “**Active Directory Domain Services**”.

![Select Server Roles](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*K4N5u_qJdiKCMpRVtfMrhA.png)

*   Click on “**Add Features”** and then click Next.

![Add Features](https://miro.medium.com/v2/resize:fit:800/format:webp/1*wZlJxcZB7fILym-WmB3xtQ.png)

*   Click Next on “**Features**” with the default options.
*   Click Next on “**Active Directory Domain Services**”.
*   Now click Install, and it’ll be installed in a few minutes.

![Confirm Installation Selections](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*m1Q5BnHvx182DeEcvbY-pg.png)

### Promoting Our Server to a Domain Controller

Once the installation is done, hit close, and we’ll notice a flag before the Manage option on the top-right. Click on Promote this server to a domain controller.

![Promoting Server to DC](https://miro.medium.com/v2/resize:fit:810/format:webp/1*MmAI8d1LMh5c_rRKdFo8JA.png)

The following Deployment Configuration page will pop up. Select Add a new forest and type the domain. We’ll be using `NEBULA.local` domain for this lab. Click Next.

![Deployment Configuration](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*Cp1N6ZBZVl5wXHJlhscWrw.png)

On “**Domain Controller Option**s” type in the password. I used `Admin#90` for this lab. Click Next.

![Domain Controller Options](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*L2owCVzGRkgXl-CQd7Zoww.png)

*   Click Next on “**DNS Options**” with the default options.
*   Click Next on “**Additional Options**” with the default settings.
*   Click Next on “**Paths**”.
*   Click Next on “**Review Options**”.
*   Click Install on “**Prerequisites Check**”. It’ll install the prerequisites and then reboot.

Once it reboots, we’ll notice our `Nebula\Administrator` account for Active Directory is created. We can now use our password `Admin#90` to log in.

![Joined as Domain Controller](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*HvAEG1VMqsmDlx2XApH3RQ.png)

### Enabling Active Directory Certificate Services

AD Certificate Services is a Windows Server role that provides public key infrastructure (PKI) to issue and manage digital certificates for secure communication, authentication, and encryption within an organization.

Now, for some LDAP attacks, we will enable Active Directory Certificate Services. Click on “**Manage**” from the menu on the top-right and select “**Add Roles and Features**” like we did earlier, and click next until we reach the “**Select Server Roles**” page.

Now, check the “**Active Directory Certificate Services**” option and click Add Features.

![Select Server Roles](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*7HjlfReWCp5uwrrAYf-WOQ.png)

Now, click next until we reach “**Confirm Installation Selections**” and check the “**Restart the destination server automatically if required**” and click yes on the “**Add Roles and Features**” pop-up.

Click Install, and it’ll install the selected services.

![Confirm Installation Selections](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*m6Gbl-bpMw1LDdP5x4X8fQ.png)

Once it’s done, hit close, and we’ll notice the flag again before the Manage options on the top-right. Click on Configure Active Directory Certificate Services….

![Configure ADCS](https://miro.medium.com/v2/resize:fit:826/format:webp/1*aAVuF3d48rYiIir81KgqPA.png)

Click Next on “**Credentials**” and check the “**Certification Authority**” options, and click Next.

![Role Services](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*iu7hvWrJwD82vtSyv5DZ0w.png)

Click Next on all the pages and continue with the default options. I changed the validity period on the “**Validity Period**” page to `100` years, just so it never expires. Continue clicking Next, and then click “Configure” on the confirmation page. Reboot the DC to reflect the changes.

### Creating Users

Click on **Tools** from the top right corner and click on “**Active Directory Users and Computers**”.

![Active Directory Users and Computers](https://miro.medium.com/v2/resize:fit:724/format:webp/1*Zz7V1qlBHob0cXoZwoj9LA.png)

Click on the dropdown and click on Users, and all the users will be displayed on the right. Only the Administrator user is the real user, and all the other are security groups. The arrow in the Guest account shows it’s disabled.

![Active Directory Users and Computers](https://miro.medium.com/v2/resize:fit:1244/format:webp/1*E-awjBxrZRkg6lZ-kUIhwg.png)

Let’s create an Organizational Unit and move security groups into that OU. Right-click on NEBULA.local and hover over “**New**” and click on “**Organizational Unit**” name it Groups and click Ok.

![Creating New OU](https://miro.medium.com/v2/resize:fit:1380/format:webp/1*wnWR_gzBkxfio68zehF5dQ.png)

Now, select all the security groups, leaving the user Administrator & Guest, and move them to the Groups OU we just created.

![Users Managment](https://miro.medium.com/v2/resize:fit:1226/format:webp/1*aGaqGOF0vMjt5zP3IETttA.png)

Click yes on the pop-up, and they’ll be moved to the newly created OU. Now, to create a new user, we can either use the GUI or use PowerShell. For the GUI, you can right-click below the users list and hover over “**New**”, and click on “**User**”.

![Creating New User](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*w6nStMq-9JsCK8aYNoXLQw.png)

Type in the name `Mike Ross` and logon name `mike.ross` and click Next.

![Naming Details](https://miro.medium.com/v2/resize:fit:858/format:webp/1*0V-mGrmvRPDk1yGVBVMMcQ.png)

Type in the password `Roses#870` and check “**Password never expires**”, click Next, and Finish.

![Setting Password](https://miro.medium.com/v2/resize:fit:868/format:webp/1*AjiHsC-I1DHJcNcud4e0Wg.png)

We will create another user `svc-filesmgr` with the password `Secure#4045` and “**Password Never Expires**”.

![Creating New User](https://miro.medium.com/v2/resize:fit:866/format:webp/1*kY6kC9Vh0PgnS2gQzycb8w.png)

Now create the following users with the same properties.

*   Helpdesk Harper `h.harper:Harp3r!2`
*   Harry John `h.john:Jhonny!40s`
*   Nebula Admin `n.admin:N3bul4!`

### Enabling AS-REP Roasting on Mike Ross

In AS-REP, an attacker sends an AS-REQ for a target user. Because pre-authentication is disabled, the DC sends back an AS-REP response (containing data encrypted with the user’s password hash) **without** verifying the user’s identity.

Right-click on the newly created user and click on “**Properties**”. Under “**Account options**” scroll all the way to the bottom and check “**Do not require Kerberos preauthentication**”. Click Apply and close.

![Enabling Kerberos Pre-Auth](https://miro.medium.com/v2/resize:fit:810/format:webp/1*FyZTZkDs8Bqd4VF_3AIpwg.png)

### Adding AD LDAP Services & Enabling Anonymous Logon

Click on Manage from the top-right menu and click on Add Roles and Features. Keep clicking Next and check “**Active Directory Lightweight Services**” when you reach the “**Select server roles**” page. Follow the installation steps and click on the flag icon like we did earlier, and follow the installation steps again.

Click on the Tools option from the top-right menu and click “**ADSI Edit**”, and click “**Connect to…**”

![Conencting to ADCS](https://miro.medium.com/v2/resize:fit:584/format:webp/1*XfC6pnYXemDnv23Hc5QOBg.png)

Select “**Configuration**” from the “**Select a well-known naming context**” dropdown list and click OK.

![Connection Settings for ADCS](https://miro.medium.com/v2/resize:fit:750/format:webp/1*H3f6i_jHpC6bSdGQxvUyzQ.png)

Right-click on Configuration and expand the following, like the screenshot below, and right-click on `CN=Directory Service` and click on properties.

![Configuring CN=Windows NT](https://miro.medium.com/v2/resize:fit:1032/format:webp/1*KYsjlHqKCij36RGh3SDbmA.png)

From properties, click on `dSHeuristics` and click on edit. Type the Value `0000002` and click Ok, apply, and close.

![Setting dSHeuristics](https://miro.medium.com/v2/resize:fit:794/format:webp/1*ctudW5sg2ma5Ixn2IQZTgw.png)

Click on the Tool from the top-right menu in Server Manager, and click on AD Users and Computers. Click on View from the menu and check the “**Advanced Features”** options.

![Enabling Advance Features](https://miro.medium.com/v2/resize:fit:748/format:webp/1*SV2hQvJg9QOVtwpPqLbxpA.png)

Right-click on Users OU and click on properties. Click on Add and type in `ANONYMOUS LOGON` Click on “**Check Name**” and then let it populate and click on OK.

![Adding Anonymous Logon](https://miro.medium.com/v2/resize:fit:900/format:webp/1*pavog7cSnjqUG9ywqWMahQ.png)

Select `ANONYMOUS LOGON` user and check the Read as Allow, apply, and then close.

![Giving Read Permission](https://miro.medium.com/v2/resize:fit:788/format:webp/1*KFGt9gT63jz6KKTJb73h4g.png)

### Enabling Kerberoating on Files Manager

Open a PowerShell on Nebula-DC as an administrator and type in the following command. It will convert the `svc-filesmgr` to a service account.

```
setspn -a Nebula-DC/svc-filesmgr.nebula.local NEBULA\svc-filesmgr
```

### Setting up User Machine MS01

Install Windows 10 Enterprise using the ISO file on VirtualBox. Once the installation is done, select “**Domain join instead**” when prompted to log in. Use the user `h.harper:Harp3r!2` and fill in the security questions and login.

Set the static IP `10.10.10.20` and set the DNS as the IP of the domain controller, which in our case is `10.10.10.10`

![Static IP MS01](https://miro.medium.com/v2/resize:fit:790/format:webp/1*2lzib3JKGIchZL9WzLOiQA.png)

Rename this PC as MS01 and restart.

### Adding MS01 to Active Directory

After logging into MS01, search “**Access work or school**” and open settings. Click on connect.

![Joining MS01 to AD](https://miro.medium.com/v2/resize:fit:944/format:webp/1*I86S2T8KOlto1vwVYReSiQ.png)

Click “**Join this device to a local Active Directory domain**”.

![Joining to Local Active Directory Domain](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*nLYdQxIrSi2rKx0rd2R7Lw.png)

Type the domain name `NEBULA.local` and click Next.

![Renaming MS01](https://miro.medium.com/v2/resize:fit:1336/format:webp/1*iRIJFM-aD1hQh-Dl9LZY5Q.png)

Type in the credentials of Helpdesk Harper `h.harper:Harp3r!2` and click OK, and then click Next and select “**Administrator**” from the Account Type dropdown, and then “**Restart Now**”.

![Passing Credentials](https://miro.medium.com/v2/resize:fit:884/format:webp/1*wRGaCH_Mk1mJ2f9UB4lzeA.png)

Our MS01 is now joined to the domain and is part of the Active Directory.

### Enabling SMB Shares

In the context of Active Directory (AD), **SMB (Server Message Block)** is a network file-sharing protocol that is crucial for core AD functions, but also presents security vulnerabilities.

Create a new folder named Nebula on MS01.

![Creating Foler](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*_LdUxpRYTOGqf39XGyTG9g.png)

Right-click on the Nebula folder, hover on “**Give access to**” and click on “**Specific people…**”.

![Giving Access to People](https://miro.medium.com/v2/resize:fit:1234/format:webp/1*gDCVeLa7n91NA4B0GoDmBg.png)

Click on the dropdown button and click “**Find People…**”.

![Finding People](https://miro.medium.com/v2/resize:fit:1072/format:webp/1*Ex1HcVS4U3xo0BNqho2LZw.png)

Type in the object name `svc-filesmgr` and click on “**Check Names**” and it’ll populate the field like in the screenshot below.

![Adding Username](https://miro.medium.com/v2/resize:fit:888/format:webp/1*czR1K7imN638AsAmeCNQ2A.png)

Click on the dropdown button next to the permission of Files Manager and select the **Read/Write** options. Click Share and then Done.

![Giving Read/Write Permissions](https://miro.medium.com/v2/resize:fit:1242/format:webp/1*GYa-ZJJQtXG6s_PdRE4fQQ.png)

### Adding Schedule Task to Trigger LNK File on SMB Share

We will now create a scheduled task as `h.harper` user, it’ll run on system startup. The script will trigger the latest `.lnk` file on the SMB share every minute and clear the folder.

Save the script below at `C:\Users\h.harper\lnk-trigger.ps1`

```
while ($true) {
    $folder = "C:\Nebula"
    $latest = Get-ChildItem -Path $folder -Filter "*.lnk" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($latest) {
        Start-Process $latest.FullName
    }
    Start-Sleep -Seconds 60
    Remove-Item -Path "C:\Nebula\*" -Recurse -Force
}
```

*   Press **Win + R** and Type **taskschd.msc** and press enter.
*   Click on “**Create Task**” and name the task **LNK TRIGGER**.
*   Check the “**Run whether the user is logged on or not**” option and “**Run with highest privileges**”. Select Windows 10 from **the Configure for** dropdown.

![Creating New Schedule Task](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*oTwnHobw3x7jf7fcMf8N7Q.png)

*   Switch to the Triggers tab and add a “**New trigger”**.
*   Select “**At startup**” from the **Begin the task** dropdown.
*   Make sure to match the Advanced Settings, like in the screenshot below.

![Configuring Trigger Settings](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*pvBAOwuxbc8oLhfxP9mFlA.png)

*   Switch to the “**Actions**” tab and add a new Action.
*   Select the **Action** as “**Start a program**”, click browse, and select `powershell.exe`
*   Paste in the following Argument `-ExecutionPolicy Bypass -WindowStyle Hidden -File “C:\Users\h.harper\lnk-trigger.ps1”` and click Ok.

![Adding PowerShell.exe and Arguments](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*pc2XQaHPw08WiNZ3UcfSYQ.png)

*   Switch to the Conditions tab and uncheck “**Start the task only if the Computer is on AC power**”.
*   Switch to the Settings tab and uncheck “**Stop the task if it runs longer**”.

### Adding ESC1 Vulnerability in AD Certificate Services

ESC1 stands for **Enterprise Security Configuration 1**, a type of cybersecurity attack that exploits misconfigured Active Directory (AD) certificate templates to gain higher privileges. It allows an attacker to request a certificate that can be used to impersonate other users or accounts, leading to a potential full compromise of a network.

*   Press **Win + R** and type `certtmpl.msc` and press enter.
*   Click on Certificate Templates… and right-click on **User** and click “**Duplicate Template**”.

![Duplicate User Template](https://miro.medium.com/v2/resize:fit:1250/format:webp/1*d_54SQvp90kC45vUBJF8Vw.png)

*   Switch to the General tab and rename the template to Nebula ESC and set the expiry years to 100 & 75, like in the screenshot below.

![Configuring General Settings](https://miro.medium.com/v2/resize:fit:790/format:webp/1*IPXRlP7FfDsUwHNjYHbn0g.png)

*   Switch to the security tab and add `h.harper` and enable Enroll.

![Adding User and Enroll Check](https://miro.medium.com/v2/resize:fit:786/format:webp/1*65eT_RU-2D-pOfPqy-ujLg.png)

*   Switch to Subject Name and select the Supply in the name request.
*   Clicky apply and close.

![Selecting Supply in the reuqest option](https://miro.medium.com/v2/resize:fit:790/format:webp/1*UaExHaGePEn4AalIsjyt8g.png)

*   Press **Win + R** and type `certsrv.msc` and press enter.
*   Right-click Certificate Template, hover on New, and click on “**Certificate Template to Issue**”.

![Adding Vulnerable Template](https://miro.medium.com/v2/resize:fit:1374/format:webp/1*JvuYvEX9XcOBpr_ZgRW8kA.png)

*   Select Nebula ESC and click ok.

![Saving Changes](https://miro.medium.com/v2/resize:fit:1126/format:webp/1*wTvysY8ASJYtPsX8ZYRi9w.png)

### Giving GenericALL to Harry Over User Nebula

*   Click on **Tools** from the top right corner and click on “**Active Directory Users and Computers**”.
*   Click on View and check the Advanced Features option.
*   Click on Groups OU and right-click on DNSAdmins and switch to the members tab, and add the n.admin user.
*   Click on Users OU, right-click on Nebula Admin, and enable the user if disabled. Right-click again and click on properties, switch to the security tab, and add h.john user and check the Full Control option.

![Adding User for GenericAll rights](https://miro.medium.com/v2/resize:fit:762/format:webp/1*HBqjUBUEoHxMNpN0mqIvyQ.png)

*   Once done, click apply and close.

### Adding Nebula Admin to Remote Management Users Group

We will add `n.admin` user to the **Remote Management Users** group, so we can perform a Pass the Hash attack and log in via WinRM.

Open Server Manager on DC and click on Tools, and then AD Users and Computers. Open Builtin and right-click on **Remote Management Users** and click on **properties**.

![Remote Managment Users](https://miro.medium.com/v2/resize:fit:1262/format:webp/1*srC_IS8rL8g748onk52gGA.png)

Switch to members, click on add, and type `n.admin` Click on the check name button like we did earlier and apply, and with that, our fully vulnerable lab setup is complete.

What We Learned
---------------

We learned to set up a **Domain Controller**, including creating users, OUs, groups, and configuring basic policies. We also learned to add and manage **domain-joined machines**, simulating a realistic corporate network with MS01 and DC01. We created and managed **SMB shares**, set permissions. We installed and configured **Active Directory Certificate Services (AD CS)** and created a vulnerable ESC1 certificate template.

> **One important** lesson I learned is that you must be clear about your design before building a vulnerable lab. Trying to plan the lab while setting it up leads to confusion, inconsistent configurations, and extra rework. A well-defined plan upfront saves time and makes the entire learning process smoother and more effective.
{: .prompt-tip}

Before You Go
-------------

By completing this setup, you now have a solid and realistic foundation for learning how attacks unfold inside an Active Directory environment. In the next blog, we’ll dive into exploiting this lab step-by-step and understanding how each misconfiguration can be leveraged by an attacker. Until then, feel free to experiment, break things, and rebuild. That’s the best way to truly understand AD. Thanks for reading, and stay tuned for the next part.
