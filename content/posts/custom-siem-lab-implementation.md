---
title: Custom SIEM Lab Implementation
description: Welcome, Readers! Today, we’ll walk through setting up a
  comprehensive SIEM lab using Elastic, where we’ll explore how to monitor,
  analyze, and respond to security threats effectively. This hands-on guide will
  get you up and running in no time!
slug: custom-siem-lab-implementation
date: 2024-08-13
author: Beri Contraster
tags:
  - guide
  - lab
cover: /assets/media/blog/custom-siem-lab-implementation/cover.jpg
coverAlt: SIEM Lap Setup
featured: true
draft: false
---

## What is SIEM?

SIEM (Security Information and Event Management) is a security solution that aggregates and analyzes data from across an organization's IT environment to detect threats and respond quickly. By combining real-time event monitoring (SEM) with historical data analysis and reporting (SIM), SIEM provides comprehensive visibility, enhances threat detection, and helps meet regulatory compliance.


## Why Set Up an Elastic SIEM Lab?

Creating an Elastic SIEM lab gives you a safe and controlled environment to explore and experiment with security practices. It allows you to:

- Analyze and interpret security logs and events.
- Identify and respond to potential threats effectively.
- Deepen your understanding of incident response processes.
- Experiment with the powerful features of the Elastic Stack without any risk to live systems.

## Requirements

- VirtualBox or VMware
- Elastic Cloud

### VirtualBox Setup

We'll be using Kali Linux for this project. You can use it on any [virtualization](https://en.wikipedia.org/wiki/Virtualization) platform.

- Download the vbox image from [kali](https://www.kali.org/get-kali/#kali-platforms).
- Download [VirtualBox](https://www.virtualbox.org/wiki/Downloads) or any other platform.

> Make the sure the date & time of the kali machine is correct.

### Elastic Cloud Setup

- Signup on [Elastic Cloud](https://cloud.elastic.co/registration) (free trial).

## Setting up the Agent

- On Elastic homepage click on menu and then select add integerations.

![adding integeration](/assets/media/blog/custom-siem-lab-implementation/add-integrations.png)
_Adding Integration_ 

- Now in the search bar type "**Elastic Defend**" and select it.

![elastic defend](/assets/media/blog/custom-siem-lab-implementation/elastic-defend.png)
_Elastic Defend_

- Now select "**Add Elastic Defend**".

![Adding Elastic Defend](/assets/media/blog/custom-siem-lab-implementation/adding-defend.png)
_Adding Elastic Defend_

- Now click on "**Install Elastic Agent**".

![elastic defend](/assets/media/blog/custom-siem-lab-implementation/install-agent.png)
_Installing Elastic Agent_

- Copy the command and paste in the kali terminal and super user. If it asks for any options just go with the default ones. We can see that the commands for other operating systems are available as well **i.e** window, mac etc.

![installing on linux](/assets/media/blog/custom-siem-lab-implementation/linux-install.png)
_Installing on Linux_

- Confirming the installation `systemctl status elastic-agent.service`.

```bash
~$ systemctl status elastic-agent.service
● elastic-agent.service - Elastic Agent is a unified agent to observe, monitor and protect your system.
     Loaded: loaded (/etc/systemd/system/elastic-agent.service; enabled; preset: disabled)
     Active: active (running) since Wed 2024-11-13 04:57:51 EST; 6min ago
 Invocation: 703e7feedf504581803789f97736546a
   Main PID: 3933 (elastic-agent)
      Tasks: 36 (limit: 6819)
     Memory: 308M (peak: 369.6M)
        CPU: 7.719s
     CGroup: /system.slice/elastic-agent.service
             ├─3933 elastic-agent
             ├─4093 /opt/Elastic/Agent/data/elastic-agent-8.16.0-3f07f2/components/agentbeat filebeat -E setup.ilm.enabled=false -E setup.template.enabled=fal>
             ├─4099 /opt/Elastic/Agent/data/elastic-agent-8.16.0-3f07f2/components/agentbeat metricbeat -E setup.ilm.enabled=false -E setup.template.enabled=f>
             └─4109 /opt/Elastic/Agent/data/elastic-agent-8.16.0-3f07f2/components/agentbeat metricbeat -E setup.ilm.enabled=false -E setup.template.enabled=f>

Nov 13 04:57:56 kali elastic-agent[3933]: {"log.level":"info","@timestamp":"2024-11-13T04:57:56.748-0500","message":"Stopping 0 inputs","component":{"binary":>
Nov 13 04:57:56 kali elastic-agent[3933]: {"log.level":"info","@timestamp":"2024-11-13T04:57:56.748-0500","message":"Crawler stopped","component":{"binary":"f>
Nov 13 04:57:56 kali elastic-agent[3933]: {"log.level":"info","@timestamp":"2024-11-13T04:57:56.748-0500","message":"Stopping Registrar","component":{"binary">
Nov 13 04:57:56 kali elastic-agent[3933]: {"log.level":"info","@timestamp":"2024-11-13T04:57:56.748-0500","message":"Ending Registrar","component":{"binary":">
Nov 13 04:57:56 kali elastic-agent[3933]: {"log.level":"info","@timestamp":"2024-11-13T04:57:56.748-0500","message":"Registrar stopped","component":{"binary":>
Nov 13 04:57:56 kali elastic-agent[3933]: {"log.level":"info","@timestamp":"2024-11-13T04:57:56.760-0500","message":"Total metrics","component":{"binary":"fil>
Nov 13 04:57:56 kali elastic-agent[3933]: {"log.level":"info","@timestamp":"2024-11-13T04:57:56.761-0500","message":"Uptime: 3.16115161s","component":{"binary>
Nov 13 04:57:56 kali elastic-agent[3933]: {"log.level":"info","@timestamp":"2024-11-13T04:57:56.761-0500","message":"Stopping metrics logging.","component":{">
Nov 13 04:57:56 kali elastic-agent[3933]: {"log.level":"info","@timestamp":"2024-11-13T04:57:56.761-0500","message":"Stats endpoint (/opt/Elastic/Agent/data/t>
Nov 13 04:57:56 kali elastic-agent[3933]: {"log.level":"info","@timestamp":"2024-11-13T04:57:56.761-0500","message":"filebeat stopped.","component":{"binary":>
lines 1-24/24 (END)
```

- We can also comfirm by checking the enrolled agent on the Elastic Cloud below the given commands.

![enrolled agents](/assets/media/blog/custom-siem-lab-implementation/agent-enrolled.png)
_Enrolled Agents_

- Now once all of that is done click on "**Add the integration**" and then "**Confirm incoming data**".

![add the integration](/assets/media/blog/custom-siem-lab-implementation/add-integration.png)
_Add Integration_

- Now from the menu select **logs** and we'll be able to see logs coming from the enrolled system.

![viewing logs](/assets/media/blog/custom-siem-lab-implementation/view-logs.png)
_Viewing Incoming Logs_

## Generating Events

Let's run a nikto scan on localhost to create an event.

```bash
~$ nikto -url 127.0.0.1           
- Nikto v2.5.0
---------------------------------------------------------------------------
---------------------------------------------------------------------------
+ 0 host(s) tested
```

Now search `process.args nikto` and click on details to view more about the event.

![viewing events](/assets/media/blog/custom-siem-lab-implementation/view-event.png)
_Viewing Nikto Event_

## Setting up the Dashboard

- Now from the menu select "**Dashboards**" and then select "**Create Dashboard**".

![create dashboard](/assets/media/blog/custom-siem-lab-implementation/create-dashboard.png)
_Creating Dashboard_

![create visualization](/assets/media/blog/custom-siem-lab-implementation/create-visualization.png)
_Create Visualization_

- Now for the "**Horizontal Axis**" select `@timestamp` and for "**Vertical Axis**" select `Records`.

![Adding Axis Values](/assets/media/blog/custom-siem-lab-implementation/axis-setup.png)
_Setting up the Axis Values_

![graph](/assets/media/blog/custom-siem-lab-implementation/graph.png)
_Final Visualization_

## Setting up Alerts

In a SIEM system, alerts are notifications triggered when specific security events or patterns are detected. These alerts are generated based on predefined rules or machine learning models that monitor logs and data streams for suspicious activities.

- From menu select "**Alerts**" and then select "**Manage Rule**" and then select "**Create new rule**".

![create new rule](/assets/media/blog/custom-siem-lab-implementation/create-rule.png)
_Creating New Rule_

- Now from "**Define Rule**" select "**Rule Type**" as `Custom query`
- From "**Source**" select `Data View`
- From "**Data View**" select `logs-*`
- In "**Custom query**" type `process.args nikto`, so we'll get an alert whenever someones run nikto on the system.
- Click Continue

![custom rule](/assets/media/blog/custom-siem-lab-implementation/custom-rule.png)
_Custom Query_

- Now in "**About rule**" Type **name**, **description**, **severity** and continue.

![Adding rule details](/assets/media/blog/custom-siem-lab-implementation/rule-name.png)
_Adding Rule Information_

- Now in "**Schedule rule**" select your values, for this project I'll be using default ones.

![Rule Schedule](/assets/media/blog/custom-siem-lab-implementation/rule-interval.png)
_Schedule Rule_

- Now in "**Rule actions**" select `Mail` and add the details
- Click "**Create & enable rule**"

![Setting up action](/assets/media/blog/custom-siem-lab-implementation/rule-action.png)
_Adding the Rule Action_

- Now run the same nikto command to trigger an alert.

```bash
nikto -url 127.0.0.1
```

![alert trigger](/assets/media/blog/custom-siem-lab-implementation/alert-nikto.png)
_Nikto Alert_

![mail image](/assets/media/blog/custom-siem-lab-implementation/alert-mail.png)
_Alert Mail_

## Conclusion

Setting up your own Elastic SIEM lab equips you with practical cybersecurity skills by providing a robust, hands-on environment. In this guide, you have successfully established an Elastic Stack setup, complete with Elasticsearch, Logstash, and Kibana, to monitor and analyze security data from both Linux and Windows machines.

Throughout this lab, you accomplished the following:

- **Environment Configuration:** You created an Elastic Cloud account and deployed Elasticsearch, laying the groundwork for your SIEM lab.
- **Virtual Machine Setup:** Using virtualization tools like VMware, you installed and configured Kali Linux and Windows 10, ensuring they were networked correctly and time-synchronized.
- **Elastic Agent Installation:** You deployed Elastic Agents on both operating systems to collect and stream logs, verifying that data was correctly ingested into Elasticsearch.
- **Log Monitoring and Analysis:** By executing network scans and system commands, you observed real-time data flow in Kibana, enhancing your understanding of how to interpret and manage security logs.
- **Data Visualization:** You used Kibana to create interactive visualizations, making it easier to identify trends, anomalies, and potential threats in your data.
- **Alert Configuration:** You set up alerts for critical events, such as network scans or unauthorized access attempts, ensuring you’re notified promptly and can respond effectively.

By building and interacting with this lab, you've gained crucial insights into SIEM operations. The experience you’ve gathered helps in analyzing security events, detecting threats, and implementing proactive responses. Practicing in this controlled setup prepares you for real-world scenarios, enhancing your expertise in defending against cyber threats.
