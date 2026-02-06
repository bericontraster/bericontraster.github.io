---
title: Getting Into Cybersecurity in 2026 the Right Way
date: 2026-1-7 12:00:00 +0500
image:
    path: "https://images.unsplash.com/photo-1583743493454-f122b10f8920?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    alt: Getting Into Cybersecurity
toc: true
comments: true
tags: cybersecurity ethical-hacking career-advice pentesting
categories: ["Information Reads"]
description: How to get into cybersecurity in 2026, based on real experience what to learn, where to start, and what actually matters.
---

Every new year, new articles and videos drop. I used to watch them like everyone else, never thinking I’d reach a point where I’d be writing one myself, but here we are. Hard work really does pay off, and most of the time, we don’t even realize we’ve slowly become the person we once wished we could be.

This blog is about **how to get into cybersecurity**, with a stronger focus on the **offensive side** of things. My path to becoming **OSCP certified** was far from smooth. I started back in 2020, watching YouTube videos on “how to hack someone’s Wi-Fi,” genuinely thinking that was all cybersecurity was about. Not long after, I discovered **TryHackMe**, then moved on to **Hack The Box**, eventually passed **CPTS**, and finally, it was time to go for **OSCP**.

I still remember sitting there after showing up, thinking, _shit… who would’ve thought I’d come this far?_

<div style="border:1px solid #043927; padding:1em; display:flex; align-items:center; border-radius:15px; margin-bottom: 15px;">
  <div style="flex:1;">
    <strong><a href="https://medium.com/@bericontraster/the-secret-to-passing-oscp-my-journey-and-tips-424850539e6d" target="_blank">The Secret to Passing OSCP: My Journey and Tips</a></strong>
    <p style="margin:0.3em 0;">The Offensive Security Certified Professional (OSCP) certification is known as one of the toughest certifications in cybersecurity. Some…</p>
    <small><a href="https://medium.com" target="_blank">medium.com</a></small>
  </div>
  <img src="https://miro.medium.com/v2/resize:fit:720/format:webp/1*vk8rdBzrU2T8uINzc9_h5g.png" alt="OSCP+" style="width:100px; margin-left:1em; border-radius:4px;">
</div>
  

After years of learning, failing, restarting, and struggling, I finally found what I believe is a **clear path** for anyone who wants to get into cybersecurity. The reason I’m writing this is for the people who feel lost, overwhelmed, and don’t have anyone to reach out to. I was that guy once, and I know exactly how that feels.

I’ll do my best to clear everything up.

Is Cybersecurity right for you?
-------------------------------

Many people have the wrong idea about cybersecurity. Some are inspired by movies, others by the fantasy of hacking nuclear launch systems and blowing everything up. That’s not how this field works at all.

In cybersecurity, especially on the offensive side, the goal is to **perform penetration tests on systems and make sure they are secure against real attackers**. It’s the complete opposite of the fantasies people imagine. This is about understanding systems deeply, breaking them in controlled environments, and helping organizations fix their weaknesses.

If you’re motivated by **breaking systems, understanding how things work, and finding loopholes**, then cybersecurity might be for you. But if you’re here purely because of the image or hype, I strongly recommend learning how things actually work in cybersecurity before committing.

This field demands a **huge amount of time, patience, and energy**. Realizing halfway through that it’s not for you can be extremely discouraging so it’s better to understand the reality early and make an informed decision.

The Fundamentals
----------------

There are two types of people who want to get into cybersecurity:
those with **no prior experience with computers**, and those who **already know the ins and outs but aren’t sure where to start learning the real stuff**.

Both groups struggle, but for different reasons.

For folks who are completely new, it’s important to slow down and build a solid foundation first. Before touching hacking tools or labs, you should focus on learning the following:

1.  [Introduction to Networking](https://academy.hackthebox.com/module/details/34) & [Network Fundamentals](https://academy.hackthebox.com/module/details/289)
2.  Operating System ([Windows](https://academy.hackthebox.com/module/details/49) & [Linux](https://academy.hackthebox.com/module/details/18))
3.  [Web Applications](https://academy.hackthebox.com/module/details/75) & [Web Requests](https://academy.hackthebox.com/module/details/35)

I’ve linked the **best courses** in the bullet points above. If you search on Google, you’ll find plenty of free resources as well. There’s no need to pay for anything at this stage.

All of the courses I mentioned are from **Hack The Box**. This isn’t sponsored in any way; it’s simply my personal recommendation. The pricing is **very affordable**, the content is **clean and well-structured**, and it saves a lot of confusion.

There _are_ completely free paths you can take, but they usually cost you more **time and energy**. Choose what fits your situation best.

> Never try to rush. This is a field that demands more than just effort it demands **your soul**. You have to be obsessed with it, breathe it, and live it. That level of curiosity and commitment is often the only real sign that someone will succeed here.
> 
> Cybersecurity isn’t something you casually pick up on the side. The people who make it are the ones who can’t stop learning, breaking, testing, and asking _why_.

The Secret Pathway
------------------

Now, for the people who already know all of this, here’s the secret.

![captionless image](https://miro.medium.com/v2/resize:fit:960/format:webp/0*zfLptRK94Z6P9ITn.gif)

Web Security is a must, so we will start with [PortSwigger](https://portswigger.net/web-security/all-topics) Academy. It covers all the topics. It teaches you everything you need to know about web security, and it includes hands-on labs so you can practice as you learn. If you take your time, practice properly, and keep notes, you’ll be able to perform [Bug Bounty](https://en.wikipedia.org/wiki/Bug_bounty_program) and web pentesting.

For most beginners, the confusion around web security disappears after completing PortSwigger Academy. Then comes the Active Directory, Cloud Pentesting, Privilege Escalation, etc. All these terms might sound scary, but they won’t be once you understand them. I remember when I first started Active Directory, I wished it never existed,d but now I love AD.

Since PortSwigger already made you good at web, the following certifications will teach you Active Directory and Post Exploitation.

The usual choice is between **OffSec** and **Hack The Box**, and both are solid. There are other platforms like [TCM Security](https://certifications.tcm-sec.com/) (beginner-friendly) and [INE](https://ine.com/).

*   Offsec [OSCP+ PEN-200](https://www.offsec.com/courses/pen-200/) includes web, Active Directory, post-exploitation, and cloud. If you want to focus on web only, then [OSWE WEB-300](https://www.offsec.com/courses/web-300/) from Offsec is for you.
*   HackTheBox has a lot of certifications. [CPTS](https://academy.hackthebox.com/exams/3) is an alternative to OSCP+. If you want to do web only, then the [Web Penetration Tester](https://academy.hackthebox.com/exams/2) is for you.
*   TCM Security has certifications as well, both web-focused PWPA and PNPT, which is CPTS-like but more beginner-friendly.

The main difference is this:

*   **OffSec** is expensive but has strong market recognition, which can help when applying for jobs.
*   **Hack The Box** focuses on pure knowledge. People do it for the love of the game. It does not mean these can’t land you a job.
*   TCM Security is beginner-friendly; people also do certs from here, like PNPT, to prepare for OSCP.

A quick reality check: **OffSec certifications alone do not guarantee a job**. They help, but only when paired with real skills, consistency, and the right mindset.

I’m not presenting this as the perfect path that everyone must follow because that doesn’t exist. Everyone is different, and the same path won’t suit everyone. But if I were to start again, I would absorb all the PortSwigger Knowledge and jump straight to CPTS and then OSCP.

Don’t get stuck overthinking which certification to choose. My advice is simple: once your fundamentals are solid, start with **PortSwigger Academy** or the [**Web Penetration Tester**](https://academy.hackthebox.com/exams/2) **path on Hack The Box**. After that, move on to **CPTS**, and then go straight for **OffSec certifications**.

It’s not complicated at all, that is it. Itis very simple. People often complicate it because there are so many options. It’s fine, you don’t have to plan all of your path in one day. Just start, and you will know the step yourself.

Tips
----

*   **Take notes while you learn.** This is not optional. You _must_ take notes; you’ll thank yourself later.
*   **Don’t rush any part of the journey.** If you rush, you’ll end up coming back to relearn it properly anyway.
*   **Keep it simple.** Don’t overcomplicate things; fundamentals matter more than fancy tools.

Conclusion
----------

I hope this helped in some way and cleared up your confusion. If you have any questions, feel free to ask in the comments or reach out to me [here](https://bericontraster.github.io/) or on Discord (**bericontraster**). I’m even happy to hop on a 1-on-1 call and guide you further on anything to give back to the community that helped me come this far.

Best of Luck.

![captionless image](https://miro.medium.com/v2/resize:fit:490/format:webp/0*7WG7u-jZ0QrDveTv.gif)