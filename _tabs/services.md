---
icon: fas fa-clipboard-check
order: 0
draft: false
toc: true
---

<style>
  .service-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    margin: 24px 0 20px;
  }

  .service-widget {
    background: #0f1115;
    border: 1px solid #1f222b;
    border-radius: 16px;
    padding: 20px 22px;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .service-widget__icon {
    font-size: 1.4rem;
    color: #8fe0c3;
  }

  .service-widget__title {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
  }

  .service-widget__copy {
    margin: 0;
    color: #d5d9e0;
  }

  .service-widget__button {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #043927;
    color: #ffffff;
    padding: 8px 14px;
    border-radius: 999px;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.95rem;
    border: 1px solid #0b553c;
  }

  .service-widget__button,
  .service-widget__button:hover,
  .service-widget__button:focus-visible {
    color: #ffffff !important;
    text-decoration: none !important;
    border-bottom: none !important;
  }

  .content a.service-widget__button,
  .content a.service-widget__button:hover,
  .content a.service-widget__button:focus-visible,
  .content a.service-widget__button:visited {
    color: #ffffff !important;
    text-decoration: none !important;
    border-bottom: none !important;
  }

  .service-widget__button:hover,
  .service-widget__button:focus-visible {
    background: #0b4b34;
  }

  @media (max-width: 900px) {
    .service-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

I deliver manual-first penetration testing that mirrors how real attackers probe, pivot, and exploit. You get clear, prioritized risk and evidence-backed findings that stand up to audits and executive scrutiny.

<div class="service-grid">
  <article class="service-widget">
    <div class="service-widget__icon"><i class="fas fa-satellite-dish"></i></div>
    <h3 class="service-widget__title">External Perimeter Audit</h3>
    <p class="service-widget__copy">Map your true internet exposure, including shadow IT, forgotten assets, and leaked access paths. I validate what an attacker can actually reach, not just what a scanner reports.</p>
    <a class="service-widget__button" href="{{ '/services/external-perimeter-audit/' | relative_url }}">Learn More</a>
  </article>

  <article class="service-widget">
    <div class="service-widget__icon"><i class="fas fa-network-wired"></i></div>
    <h3 class="service-widget__title">Internal Network Assessment</h3>
    <p class="service-widget__copy">Assume breach and test how far a threat actor can move inside the network. I focus on Active Directory security, lateral movement, and privilege escalation chains.</p>
    <a class="service-widget__button" href="{{ '/services/internal-network-assessment/' | relative_url }}">Learn More</a>
  </article>

  <article class="service-widget">
    <div class="service-widget__icon"><i class="fas fa-code"></i></div>
    <h3 class="service-widget__title">Web Application Pentest</h3>
    <p class="service-widget__copy">Cover OWASP Top 10 and the business logic flaws that scanners miss. I test real user flows to uncover authorization gaps and exploitability.</p>
    <a class="service-widget__button" href="{{ '/services/web-application-pentest/' | relative_url }}">Learn More</a>
  </article>
</div>

## The Problem
Attack surfaces are expanding faster than most teams can track. Automated tools flag volume, but they rarely prove exploitability, path to impact, or business risk.

## Our Approach
1. Recon: Enumerate external and internal exposures using OSINT, configuration review, and targeted discovery.
2. Enumeration: Validate assets, access paths, and trust relationships with manual verification.
3. Exploitation: Safely demonstrate real-world impact and chain weaknesses where it matters.
4. Post-Exploitation: Document pivot paths, privilege escalation opportunities, and blast radius.

## The Deliverables
- Executive Summary for leadership and risk owners.
- Technical Breakdown with reproducible evidence and severity context.
- Remediation Roadmap with prioritized fixes and hardening guidance.
- 1-year re-test window to verify fixes and measure risk reduction.

## Why Me
I operate to OSCP and CPTS standards, with 3 years of real-world assessment experience. My work emphasizes manual testing, clear evidence, and practical remediation so engineering teams can act fast.

## Book a Security Call
If you need a clear, defensible view of your exposure, schedule a short scoping call. We will align on scope, timelines, and the highest-risk areas so testing stays focused on outcomes.

<!-- Calendly inline widget begin -->
<div style="display: flex; justify-content: center; width: 100%;">
  <div class="calendly-inline-widget"
       data-url="https://calendly.com/contact-bericontraster/30min"
       style="min-width:600px; height:700px; width:600px;margin-top:30px;margin-bottom:30px;">
  </div>
</div>

<script type="text/javascript"
        src="https://assets.calendly.com/assets/external/widget.js"
        async>
</script>
<!-- Calendly inline widget end -->

[**Email Me**](mailto:contact@bericontraster.com) and let's secure your business today.
