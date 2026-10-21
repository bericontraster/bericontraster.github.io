import fs from 'node:fs';
import { escapeHtml as e } from './content.mjs';

const services = JSON.parse(fs.readFileSync(new URL('../content/services.json', import.meta.url), 'utf8'));
const arrow = '<span aria-hidden="true">↗</span>';
const icons = {
  'web-api': '<rect x="3" y="4" width="26" height="24" rx="3"/><path d="M3 11h26M8 7.5h.01M12 7.5h.01M12 16l-4 4 4 4m8-8 4 4-4 4m-3-9-2 10"/>',
  cloud: '<path d="M8 24a7 7 0 0 1-1-14 9 9 0 0 1 17-1 7.5 7.5 0 0 1 1 15M16 17v12m-4-8 4-4 4 4"/>',
  'active-directory': '<rect x="12" y="3" width="8" height="7" rx="1.5"/><rect x="3" y="22" width="8" height="7" rx="1.5"/><rect x="21" y="22" width="8" height="7" rx="1.5"/><path d="M16 10v7M7 22v-5h18v5"/>',
  network: '<circle cx="16" cy="16" r="5"/><circle cx="5" cy="5" r="2"/><circle cx="27" cy="5" r="2"/><circle cx="5" cy="27" r="2"/><circle cx="27" cy="27" r="2"/><path d="m7 7 5 5m8 8 5 5M7 25l5-5m8-8 5-5"/>'
};
const icon = id => `<svg class="service-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[id]}</svg>`;
const label = text => `<p class="services-label">${e(text)}</p>`;
const sectionHead = (number, eyebrow, title, text = '') => `<div class="services-section-heading"><div>${label(`${number} / ${eyebrow}`)}<h2>${e(title)}</h2></div>${text ? `<p>${e(text)}</p>` : ''}</div>`;
const enquiryUrl = (settings, service) => {
  const subject = service ? `${service.name} enquiry` : 'Security assessment enquiry';
  const body = `Hi Muhammad,\n\nI'd like to discuss ${service ? service.name.toLowerCase() : 'a security assessment'}.\n\nOrganization / website:\nEnvironment and assets to assess:\nMain concern or objective:\nPreferred timeframe:\n\nThanks,\n`;
  return `mailto:${settings.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

export function serviceBooking(settings, service) {
  const configured = settings.booking?.calendlyUrl?.trim();
  if (!configured) return null;
  let url;
  try { url = new URL(configured); } catch { throw new Error('booking.calendlyUrl must be a full Calendly event URL.'); }
  if (url.protocol !== 'https:' || url.hostname !== 'calendly.com' || url.port || url.username || url.password || url.pathname.split('/').filter(Boolean).length < 2) {
    throw new Error('booking.calendlyUrl must be an HTTPS event link on calendly.com.');
  }
  const duration = settings.booking.durationMinutes ?? 30;
  if (!Number.isInteger(duration) || duration < 5 || duration > 480) throw new Error('booking.durationMinutes must be a whole number between 5 and 480.');
  url.hash = '';
  url.searchParams.set('utm_source', new URL(settings.siteUrl).hostname);
  url.searchParams.set('utm_medium', 'website');
  url.searchParams.set('utm_campaign', 'security-services');
  url.searchParams.set('utm_content', service?.id || 'services');
  return { url: url.href, name: settings.booking.eventName || 'Security Discovery Call', duration };
}

function diagram(service) {
  const nodes = service?.chain || ['Initial access', 'Connected weaknesses', 'Business impact'];
  return `<figure class="services-diagram" aria-label="Illustrative attack path: ${e(nodes.join(' to '))}">
    <div class="services-diagram-top"><span class="services-label"><span class="services-status-dot"></span> Think in attack paths</span><span class="services-label">${service ? 'ASSESSMENT / ' + e(service.id.toUpperCase()) : 'ASSESSMENT / 01'}</span></div>
    <div class="services-path">${nodes.map((node, i) => `<div class="services-path-node"><span class="services-node-mark">${i === 2 ? '◎' : i === 1 ? '⌁' : '↳'}</span><div><span class="services-label">${['Entry point', 'Weakness', 'Impact'][i]}</span><strong>${e(node)}</strong></div><span class="services-node-index">0${i + 1}</span></div>`).join('<div class="services-path-connector" aria-hidden="true"><span></span>↓</div>')}</div>
    <figcaption><span aria-hidden="true">↳</span> ${service ? 'A scenario to investigate. Evidence determines the finding.' : 'Individual findings matter. How they connect matters more.'}<span class="services-label">Illustrative scenario</span></figcaption>
  </figure>`;
}

function serviceCard(service, index, compact = false) {
  return `<a class="service-card${compact ? ' service-card-compact' : ''}" href="${e(service.path)}">
    <div class="service-card-top">${icon(service.id)}<span class="services-label">0${index + 1}</span></div>
    ${label(service.category)}<h3>${e(service.name)}</h3><p>${e(service.short)}</p>
    ${compact ? '' : `<div class="service-card-tags">${service.tags.map(tag => `<span>${e(tag)}</span>`).join('')}</div><p class="service-card-fit"><span>Best for</span>${e(service.bestFor)}</p>`}
    <span class="service-card-link">Explore the service ${arrow}</span>
  </a>`;
}

function process() {
  const steps = [
    ['Agree the scope', 'Define your objectives, assets, access, testing windows, and rules of engagement. Scope and written authorization come first.'],
    ['Test & validate', 'Combine manual testing with supporting tools. Investigate realistic attack paths and raise critical findings during the assessment.'],
    ['Explain the risk', 'Receive a report with business impact, reproducible evidence, priorities, and practical remediation steps.'],
    ['Support the fix', 'Walk through the findings together. Agree any remediation support and retest window in the proposal.']
  ];
  return `<section class="services-section" id="process">${sectionHead('02', 'The engagement', 'Clear scope. Thorough testing. Useful answers.', 'You know what is being tested, how findings are communicated, and what happens next.')}<ol class="services-process">${steps.map(([title, text], i) => `<li><span class="services-step">0${i + 1}</span><h3>${e(title)}</h3><p>${e(text)}</p></li>`).join('')}</ol></section>`;
}

function deliverables(settings) {
  const sampleReport = settings.sampleReportUrl ? `<a class="portfolio-glass-button portfolio-glass-button-secondary services-sample-report-link" href="${e(settings.sampleReportUrl)}" target="_blank" rel="noopener noreferrer" aria-label="View sample report (PDF, internal network and web assessment)">View sample report <span class="services-sample-report-format" aria-hidden="true">PDF</span></a>` : '';
  return `<section class="services-section services-deliverables" id="deliverables"><div>${label('03 / What you receive')}<h2>A report your team<br>can put to work.</h2><p>Leadership needs the risk. Engineers need the evidence. Your report connects the two.</p><ul class="services-checklist"><li>Executive summary of risk and business impact</li><li>Validated findings with evidence and reproduction steps</li><li>Prioritized, actionable remediation guidance</li><li>Coverage, limitations, and a findings walkthrough</li></ul>${sampleReport}</div><aside class="services-report" aria-label="Illustrative report structure"><div class="services-report-heading">${icon('web-api')}<span class="services-label">Your assessment report</span><span class="services-report-file">.PDF</span></div><div class="services-report-body"><span class="services-label">From finding to action</span><h3>Evidence. Context.<br>A clear next step.</h3>${[['01', 'What was found', 'Affected assets & technical evidence'], ['02', 'Why it matters', 'Attack path & business impact'], ['03', 'How to address it', 'Remediation & validation guidance']].map(([n, title, text]) => `<div class="services-report-row"><span>${n}</span><div><strong>${title}</strong><small>${text}</small></div><span aria-hidden="true">↗</span></div>`).join('')}<span class="services-label services-report-note">Illustrative structure / no client data</span></div></aside></section>`;
}

function faq(service) {
  const questions = [
    ...(service?.faq || [
      ['Which assessment should I start with?', 'Start with the systems that support your most important workflows or hold sensitive data. If the boundary is unclear, share your environment and main concern. We can define a focused assessment or combine complementary services in one proposal.'],
      ['How much does an assessment cost, and how long does it take?', 'The quote and schedule depend on asset count, complexity, access, and validation depth. After scoping, the proposal sets out coverage, deliverables, fees, and timing before you commit. There is no one-size-fits-all testing window.'],
      ['Can different services be combined?', 'Yes. For example, a web application and its cloud identity permissions may need to be assessed together. We define each boundary and avoid duplicate coverage so the engagement follows the risk across systems.']
    ]),
    ['How do you handle confidentiality and sensitive data?', 'Confidentiality, evidence handling, secure report delivery, and retention requirements are agreed before testing. An NDA can be arranged. Please use the initial enquiry to describe your environment without sending credentials or sensitive records.'],
    ['Is retesting included?', 'Retesting scope, timing, and any associated fee are agreed in the proposal. When included, the retest checks the remediated findings and records their status; it is not a fresh assessment of newly added functionality.']
  ];
  return `<section class="services-section services-faq" id="faq"><div>${label('04 / Before we start')}<h2>A few good<br>questions.</h2><p>Clear expectations make for a better engagement.</p></div><div class="services-questions">${questions.map(([q, a]) => `<details><summary>${e(q)}<span aria-hidden="true">+</span></summary><p>${e(a)}</p></details>`).join('')}</div></section>`;
}

function contact(settings, service) {
  const booking = serviceBooking(settings, service);
  if (booking) return `<section class="services-contact" id="enquire">${label('Let’s talk about your security')}<h2>Start with a conversation.</h2><p>Choose a time to discuss ${service ? e(service.name.toLowerCase()) : 'your environment'}, your priorities, and the scope of an assessment.</p><div class="services-booking-meta"><span>${booking.duration} minutes</span><span>One-to-one discovery call</span></div><div class="services-booking-actions"><a class="services-button portfolio-glass-button" href="${e(booking.url)}" data-booking-open target="_blank" rel="noopener noreferrer">Choose a time ${arrow}</a><a class="services-text-link" href="${e(enquiryUrl(settings, service))}">Prefer email? Discuss your scope ${arrow}</a></div><span class="services-contact-note">Choose from my available times through Calendly.</span></section>
    <dialog class="services-booking-dialog" aria-labelledby="services-booking-title"><header class="services-booking-header"><div>${label('Book a meeting')}<h2 id="services-booking-title">${e(booking.name)}</h2></div><button type="button" class="services-booking-close" data-booking-close aria-label="Close booking calendar"><span aria-hidden="true">×</span></button></header><div class="services-booking-toolbar"><span>${booking.duration}-minute discovery call</span><a href="${e(booking.url)}" target="_blank" rel="noopener noreferrer">Open in Calendly ${arrow}</a></div><p class="services-booking-status" role="status" aria-live="polite">Loading available times…</p><div class="services-booking-calendar" data-booking-calendar></div></dialog>`;
  return `<section class="services-contact" id="enquire">${label('Let’s define the right assessment')}<h2>${service ? 'Start with your environment.' : 'What do you need to protect?'}</h2><p>Share the systems you want tested, your main concern, and your timeframe. I’ll help turn that into a clear scope.</p><a class="services-button portfolio-glass-button" href="${e(enquiryUrl(settings, service))}">Discuss your scope ${arrow}</a><span class="services-contact-note">Opens your email app · <a href="mailto:${e(settings.contactEmail)}">${e(settings.contactEmail)}</a></span></section>`;
}

export function renderServicesPage(page, settings) {
  const service = page.serviceId ? services.find(item => item.id === page.serviceId) : null;
  if (page.serviceId && !service) throw new Error(`Unknown service: ${page.serviceId}`);
  const primaryAction = serviceBooking(settings, service) ? 'Book a discovery call' : 'Discuss your scope';
  const hero = `<header class="services-hero" id="hero-section"><div class="services-hero-copy">${service ? label(service.category) : label('Independent offensive security / Services')}<h1>${service ? e(service.headline).replace(e(service.accent), `<span>${e(service.accent)}</span>`) : 'Know what an<br>attacker can <span>reach.</span>'}</h1><p class="services-lead">${e(service?.summary || 'Security testing that follows the attack path. I help you uncover exploitable weaknesses, understand the business risk, and give your team a clear way forward.')}</p><div class="services-hero-actions"><a class="services-button portfolio-glass-button" href="#enquire">${primaryAction} ${arrow}</a><a class="services-text-link portfolio-glass-button portfolio-glass-button-secondary" href="${service ? '#coverage' : '#assessments'}">${service ? 'See what’s covered' : 'Explore the services'} <span aria-hidden="true">↓</span></a></div></div>${diagram(service)}</header>
  <div class="services-trust"><span><span class="services-status-dot"></span> Work directly with your tester</span><a href="/about/#certifications">OSCP &amp; CPTS certified ${arrow}</a><span>Manual testing. Actionable findings.</span></div>`;
  const content = service ? `<nav class="services-section-nav" aria-label="Service page sections"><a href="#coverage">Assessment coverage</a><a href="#process">The process</a><a href="#deliverables">Deliverables</a><a href="#faq">Common questions</a></nav>
    <section class="services-section services-coverage" id="coverage"><div class="services-coverage-main">${label('01 / Assessment coverage')}<h2>${e(service.question)}</h2><p>${e(service.answer)}</p><div class="services-scope-grid">${service.scope.map(([title, text]) => `<div><h3>${e(title)}</h3><p>${e(text)}</p></div>`).join('')}</div><div class="services-methodology"><p>${e(service.methodology)}</p>${service.resource ? `<a href="${e(service.resource.href)}">${e(service.resource.label)} ${arrow}</a>` : ''}</div></div><aside class="services-brief">${label('Your engagement, defined')}<h3>Start with the right scope.</h3><p>${e(service.bestFor)}</p><h4>Helpful for our first conversation</h4><ul>${service.inputs.map(input => `<li>${e(input)}</li>`).join('')}</ul><p class="services-brief-note">${e(service.scoping)}</p><a class="services-text-link" href="#enquire">Let’s discuss your environment ${arrow}</a></aside></section>` : `<section class="services-section" id="assessments">${sectionHead('01', 'Choose your assessment', 'Four services. One objective.', 'Find the weaknesses that put your business at risk, and understand what to fix first.')}<div class="services-card-grid">${services.map((item, i) => serviceCard(item, i)).join('')}</div><p class="services-unsure">Not sure where to start? <a href="#enquire">Tell me about your environment ${arrow}</a></p></section>`;
  const related = service ? `<section class="services-section services-related">${sectionHead('05', 'Connected attack surfaces', 'Look beyond a single boundary.')}<div class="services-related-grid">${services.filter(item => item.id !== service.id).map(item => serviceCard(item, services.indexOf(item), true)).join('')}</div></section>` : `<div class="services-proof"><div>${label('The person behind the assessment')}<h2>Independent testing.<br>Direct collaboration.</h2></div><div><p>I’m Muhammad Zubair, also known as Beri Contraster. My work brings together penetration testing, security research, and building practical offensive security labs.</p><div class="services-proof-links"><a href="/about/">Meet your tester ${arrow}</a><a href="/work/">Explore my labs ${arrow}</a><a href="/blog/">Read the research ${arrow}</a></div></div></div>`;
  return hero + content + process() + deliverables(settings) + (service ? faq(service) + related : related + faq(service)) + contact(settings, service);
}
