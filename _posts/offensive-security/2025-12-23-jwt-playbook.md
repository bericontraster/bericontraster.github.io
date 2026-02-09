---
title: JSON Web Token (JWT) Playbook
date: 2025-12-23 18:00:00 +0500
image:
    path: 'https://images.unsplash.com/photo-1770321695654-c07b5a61edf9?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    alt: JSON WEB TOKENS
toc: true
comments: true
tags: web-exploitation
categories: ["Offensive Security"]
description: This JWT guide covers everything you need to understand, test, and exploit JWT vulnerabilities in real-world applications.
---

## JSON Web Tokens (JWT)
A JSON Web Token (JWT), pronounced "jot," is a compact, self-contained, and digitally signed standard `(RFC 7519)` for securely transmitting information as a JSON object between parties, commonly used for authentication and authorization in web apps and APIs.

### Structure of a JWT
A JWT has three parts, separated by dots: 
- Header: Contains metadata like the token type (JWT) and signing algorithm (e.g., HMAC SHA256).
- Payload: Contains the "claims" (user data, roles, expiration time).
- Signature: Created by hashing the encoded header, encoded payload, and a server's secret key, ensuring integrity

### How JWTs Work (Authentication Example)

1. **Login:** User provides credentials; server verifies them.
2. **Token Creation:** Server creates a JWT with user info (claims) and signs it.
3. **Token Delivery:** Server sends the JWT to the client (browser).
4. **Requesting Access:** Client sends the JWT in the `Authorization` header with subsequent requests.
5. **Verification:** Server verifies the signature; if valid, grants access

## JWT vs JWS vs JWE

The JWT standard itself is intentionally minimal. It defines a structured way to represent a set of claims as a JSON object that can be passed between two parties, but it does not prescribe how those claims should be protected or used in practice.

In real-world implementations, JWTs are almost always realized through extensions to the core specification. These extensions are JSON Web Signature (JWS), which provides integrity through digital signatures, and JSON Web Encryption (JWE), which provides confidentiality by encrypting the token contents.

As a result, what is commonly referred to as a “JWT” is typically either a JWS or a JWE. In most cases, the term “JWT” is used to mean a JWS, where the claims are encoded and signed. JWE tokens follow a similar structure, but differ in that the claims are encrypted rather than merely encoded.

For more in depth learning please read [JWT - PortSwigger](https://portswigger.net/web-security/jwt) documentation.

## JWT Library
The following list contains information you can use to exploit JWT tokens.

1. [Testing JSON Web Tokens - OWASP](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/06-Session_Management_Testing/10-Testing_JSON_Web_Tokens)
2. [JWT Security Testing/Penetration Testing Checklist](https://chintangurjar.com/files/jwt-pentest.pdf)

## JWT Toolset

1. [JWT.IO](https://www.jwt.io/)
2. [ GitHub - ticarpi/jwt_tool ](https://github.com/ticarpi/jwt_tool)