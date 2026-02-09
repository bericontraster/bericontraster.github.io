---
title: Cross-Site Scripting (XSS) Playbook
date: 2025-12-22 12:00:00 +0500
image:
    path: 'https://images.unsplash.com/photo-1739288435226-e288f81a0ed6?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    alt: Cross-Site Scripting 
toc: true
comments: true
tags: web-exploitation
categories: ["Offensive Security"]
description: This XSS guide covers everything you need to understand, test, and exploit cross-site scripting vulnerabilities in real-world applications.
---

## Cross-Site Scripting (XSS)
XSS (Cross-Site Scripting) is a vulnerability where a web application allows attacker-controlled input to be treated as executable JavaScript by a user’s browser, causing the script to run in the security context of the vulnerable site. This happens when untrusted data is included in a page without proper context-aware encoding or sanitization, breaking the boundary between data and code and letting an attacker read sensitive information, hijack sessions, or perform actions as the victim.

### XSS Types

**Reflected XSS** happens when attacker input is sent to the server and immediately reflected back in the response, causing the script to execute when the victim clicks a crafted link or submits a request.

**Stored XSS** occurs when malicious input is saved on the server (like in comments or profiles) and later served to other users, executing automatically for anyone who views the affected content.

**DOM-based XSS** happens entirely in the browser when client-side JavaScript takes attacker-controlled data and writes it to the DOM using unsafe APIs, without the payload ever being part of the server’s response.

## XSS Cheat Sheats
These references collect commonly used XSS payloads, filter-evasion techniques, and context-specific examples observed in real applications. They are meant to help you understand how XSS actually works in practice, how defenses fail, and why proper input handling matters—not to encourage reckless testing.

1. [XSS Filter Evasion Cheat Sheet -  OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/cheatsheets/XSS_Filter_Evasion_Cheat_Sheet.html)
2. [Cross-site scripting (XSS) cheat shee - PortSwigger](https://portswigger.net/web-security/cross-site-scripting/cheat-sheet)
3. [kurobeats/xss_vectors.txt](https://gist.github.com/kurobeats/9a613c9ab68914312cbb415134795b45)

> These cheat sheets are provided strictly for educational and authorized security testing purposes.
Applying the techniques or payloads in production environments can cause service disruption, data loss, or unexpected behavior. Only perform testing on systems you own or have explicit permission to assess.
Any misuse, unauthorized testing, or impact resulting from the use of this material is solely the responsibility of the user.
{: .prompt-warning}

```javascript
<script>alert(69)</script>
```
{: .nolineno}

## Places to Practive XSS
These platforms are intentionally vulnerable and designed for learning and hands-on practice. They let you experiment with XSS payloads in a safe, legal environment, understand different contexts, and see how real-world filters behave without the risk of breaking production systems or crossing any lines.

1. [XSS Game - Google](https://xss-game.appspot.com/)
2. [alert(1) to win](https://alf.nu/alert1?world=alert&level=alert0)
3. [OWASP Juice Shop](https://owasp.org/www-project-juice-shop/)
4. [HackThisSite](https://www.hackthissite.org/)

[Read more](https://www.invicti.com/blog/web-security/test-xss-skills-vulnerable-sites)
