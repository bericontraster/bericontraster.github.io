---
icon: fas fa-clipboard-check
order: 0
draft: false
---

<style>
  .compliance-grid {
    --card-radius: 18px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    margin: 28px 0 16px;
  }

  .compliance-card {
    position: relative;
    display: flex;
    align-items: flex-end;
    min-height: 220px;
    border-radius: var(--card-radius);
    overflow: hidden;
    text-decoration: none;
    color: #f8f8f8;
    background-image: var(--bg-image);
    background-size: cover;
    background-position: center;
    border: none;
    border-bottom: none;
    box-shadow: 0 10px 22px rgba(0, 0, 0, 0.24);
    transition: box-shadow 160ms ease, transform 160ms ease;
  }

  .content a.compliance-card,
  .content a.compliance-card:hover,
  .content a.compliance-card:focus-visible {
    color: #f8f8f8 !important;
    text-decoration: none !important;
    border-bottom: none !important;
  }

  .compliance-card::after {
    content: none;
  }

  .compliance-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.35);
    transition: background-color 160ms ease;
    pointer-events: none;
  }

  .compliance-card__title {
    padding: 18px 20px;
    font-size: clamp(1.1rem, 1.05rem + 0.9vw, 1.5rem);
    font-weight: 600;
    line-height: 1.2;
    text-align: left;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.55);
    position: relative;
    z-index: 1;
  }

  .compliance-card:hover,
  .compliance-card:focus-visible {
    color: #f8f8f8;
    text-decoration: none;
    transform: translateY(-3px);
    box-shadow: 0 14px 26px rgba(0, 0, 0, 0.3);
  }

  .compliance-card:hover::before,
  .compliance-card:focus-visible::before {
    background-color: rgba(0, 0, 0, 0.7);
  }

  .compliance-card:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.85), 0 14px 26px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 720px) {
    .compliance-grid {
      grid-template-columns: 1fr;
    }

    .compliance-card {
      min-height: 190px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .compliance-card {
      transition: none;
    }
  }
</style>

<div class="compliance-grid">
  <a
    class="compliance-card"
    href="/REPLACE_EXTERNAL_PERIMETER_AUDIT"
    style="--bg-image: url('https://images.unsplash.com/photo-1752606402425-fa8ed3166a91?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');"
  >
    <span class="compliance-card__title">The External Perimeter Audit</span>
  </a>
  <!-- LINK: replace /REPLACE_EXTERNAL_PERIMETER_AUDIT -->

  <a
    class="compliance-card"
    href="/REPLACE_INTERNAL_NETWORK_ASSESSMENT"
    style="--bg-image: url('https://images.unsplash.com/photo-1754516733606-008062751e0f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');"
  >
    <span class="compliance-card__title">Internal Network Assessment</span>
  </a>
  <!-- LINK: replace /REPLACE_INTERNAL_NETWORK_ASSESSMENT -->

  <a
    class="compliance-card"
    href="/REPLACE_WEB_APPLICATION_PENTEST"
    style="--bg-image: url('https://images.unsplash.com/photo-1532190872407-280735d27e08?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDEwfHx8ZW58MHx8fHx8');"
  >
    <span class="compliance-card__title">Web Application Pentest</span>
  </a>
  <!-- LINK: replace /REPLACE_WEB_APPLICATION_PENTEST -->

  <a
    class="compliance-card"
    href="/REPLACE_CASE_STUDIES"
    style="--bg-image: url('https://images.unsplash.com/photo-1760978632119-5069b6c9fb68?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE5fHx8ZW58MHx8fHx8');"
  >
    <span class="compliance-card__title">Case Studies</span>
  </a>
  <!-- LINK: replace /REPLACE_CASE_STUDIES -->
</div>
