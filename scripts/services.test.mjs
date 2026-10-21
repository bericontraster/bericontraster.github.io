import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import { renderServicesPage, serviceBooking } from './services.mjs';

const settings = {
  siteUrl: 'https://bericontraster.com',
  contactEmail: 'contact@bericontraster.com',
  booking: { calendlyUrl: 'https://calendly.com/example/security-discovery', eventName: 'Security Discovery Call', durationMinutes: 30 }
};
const pages = JSON.parse(fs.readFileSync(new URL('../src/pages.json', import.meta.url))).filter(page => page.template === 'services');

test('booking stays unavailable until a real event URL is configured', () => {
  for (const booking of [undefined, {}, { calendlyUrl: '' }, { calendlyUrl: '   ' }]) {
    const config = { ...settings, booking };
    assert.equal(serviceBooking(config), null);
    const html = renderServicesPage(pages[0], config);
    assert.doesNotMatch(html, /data-booking-open|<dialog|Book a discovery call/);
    assert.match(html, /mailto:contact@bericontraster.com\?subject=/);
  }
});

test('configured bookings appear on every service page and preserve email enquiries', () => {
  for (const page of pages) {
    const html = renderServicesPage(page, settings);
    assert.match(html, /Book a discovery call/);
    assert.match(html, /data-booking-open/);
    assert.match(html, /30 minutes/);
    assert.match(html, /aria-labelledby="services-booking-title"/);
    assert.match(html, /mailto:contact@bericontraster.com\?subject=/);
    const match = html.match(/href="([^"]+)" data-booking-open/);
    const url = new URL(match[1].replaceAll('&amp;', '&'));
    assert.equal(url.origin, 'https://calendly.com');
    assert.equal(url.searchParams.get('utm_content'), page.serviceId || 'services');
    assert.equal(url.searchParams.get('utm_source'), 'bericontraster.com');
  }
});

test('booking links reject other hosts, insecure schemes, credentials, and account-only URLs', () => {
  for (const calendlyUrl of ['javascript:alert(1)', 'http://calendly.com/person/event', 'https://calendly.com.attacker.test/person/event', 'https://calendly.com@attacker.test/person/event', 'https://user:password@calendly.com/person/event', 'https://calendly.com:444/person/event', 'https://calendly.com/person', 'not a URL']) {
    assert.throws(() => serviceBooking({ ...settings, booking: { ...settings.booking, calendlyUrl } }), /Calendly|calendly/);
  }
});

test('booking labels are escaped and invalid meeting durations fail clearly', () => {
  const html = renderServicesPage(pages[0], { ...settings, booking: { ...settings.booking, eventName: '</h2><script>alert(1)</script>' } });
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>alert/);
  for (const durationMinutes of [0, -15, 30.5, 500, '30']) {
    assert.throws(() => serviceBooking({ ...settings, booking: { ...settings.booking, durationMinutes } }), /booking.durationMinutes/);
  }
});
