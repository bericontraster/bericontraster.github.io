---
title: If I Joined Your Security Team, This Is What I’d Fix in the First 90 Days
date: 2025-12-16 12:00:00 +0500
image:
    path: "https://miro.medium.com/v2/resize:fit:1100/format:webp/1*jemI5eTW0rybP6hy27QNSQ.jpeg"
    alt: Network Block Formation
toc: true
comments: true
tags: red-teaming 
categories: ["Information Reads"]
description: I’d start by figuring out what I could do inside your environment without being noticed.
---

I wouldn’t start by running scans.  
I wouldn’t ask for a new tool.  
I wouldn’t flood the SOC with “quick wins.”  

I’d start by figuring out what I could do inside your environment **without being noticed**.

Because that’s how real attackers begin.

After years of offensive security work and hands-on adversary simulation, one pattern shows up everywhere: organizations don’t usually fail because they lack security controls. They fail because they don’t understand how those controls behave under pressure.

This isn’t a theoretical roadmap.
This is exactly how I’d approach my first 90 days on a security team.

Days 0–30: Kill Blindness Before Chasing Exploits
-------------------------------------------------

The first month isn’t about breaking things. It’s about seeing clearly.

Before touching exploitation, I’d want answers to a few uncomfortable questions:
1. What telemetry actually exists?
2. What’s assumed to exist?
3. And what quietly doesn’t exist at all?

Most environments believe they have “good visibility.” In practice, visibility is usually partial, inconsistent, and misunderstood.

I’d start by validating logging at the most boring layers:
1. Authentication events
2. Endpoint telemetry
3. Identity changes
4. Service account activity

Not by reading diagrams. By testing behavior.

If I can authenticate, move laterally, or enumerate critical assets without generating a single meaningful alert, that’s not a tuning problem. That’s a visibility gap.

During this phase, I’m not trying to be loud or impressive. I’m trying to understand how an attacker would map the environment while staying invisible. Because if that phase goes undetected, everything that follows is already lost.

Security teams don’t need more alerts in the first 30 days.
They need clarity.

Days 31–60: Abuse Identity, Not Vulnerabilities
-----------------------------------------------

Once visibility is understood, the real attack surface appears.
And it’s rarely the latest CVE.

Modern breaches are identity-driven.

In this phase, I’d focus almost entirely on how trust is assigned and abused:
1. Over-privileged users
2. Long-lived service accounts
3. Delegated permissions no one remembers granting
4. Identity paths that quietly collapse the separation of duties

Attackers don’t need zero-days when credentials give them legitimate access. They move using allowed protocols, valid tokens, and trusted relationships.

From an offensive perspective, identity is where environments bleed slowly and silently.

The question isn’t “Who is admin?”
The question is “Who can become an admin without triggering alarms?”

That distinction matters.

At this stage, the goal isn’t exploitation for sport. It’s mapping a realistic blast radius. Understanding how far a single compromised identity can travel, how quickly, and with how little resistance.

This is where breaches stop being hypothetical and start becoming expensive.

Days 61–90: Turn Attacks Into Detections
----------------------------------------

The final phase is where offense stops being about breaking in and starts being about making defenders stronger.

Every successful attack path uncovered earlier becomes a detection question:
1. What should have fired?
2. What data would have made this obvious?
3. What signal exists but wasn’t connected?

This is where red and blue stop being separate teams and start becoming one system.

I’d work closely with detection engineers and SOC analysts to translate attacker behavior into actionable detections:
1. Credential misuse patterns
2. Abnormal identity transitions
3. Lateral movement that looks “normal” until it isn’t
4. Persistence that hides in plain sight

Not more alerts. Better ones.

Metrics matter here. Not vanity metrics, but operational ones:
1. Time to detection
2. Time to containment
3. Depth of attacker movement before discovery

If security can’t measure how fast an attacker is detected, it isn’t managing risk. It’s guessing.

Purple teaming in this phase isn’t a workshop. It’s a feedback loop. Attack. Detect. Improve. Repeat.

That loop is where real security maturity shows up.

What I Would Not Do
-------------------

I wouldn’t buy tools in the first 90 days.
I wouldn’t run noisy scans just to look productive.
I wouldn’t deliver an 80-page report no one will read.

Security doesn’t fail because teams don’t work hard.
It fails because effort is aimed in the wrong direction.

My focus would be on understanding how the environment behaves under realistic attack conditions, and helping the organization reduce risk in ways that actually change outcomes.

The Mindset
-----------

Good security doesn’t stop every attack.
That’s not realistic.

Good security makes attackers loud, slow, and expensive.

It shortens dwell time.
It limits blast radius.
It turns assumptions into verified facts.

That’s the mindset I bring on day one.