import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import { submitWebsiteForm, formErrorMessage } from '../src/form-submit.js';

const endpoint = 'https://formsubmit.co/ajax/contact@bericontraster.com';
const values = { Name: ' Test Visitor ', Email: ' visitor@example.com ', Project: ' A security enquiry ', _honey: '' };

test('contact submissions supply email, message, reply-to and page context without sending real email', async () => {
  let request;
  await submitWebsiteForm(endpoint, values, { pageUrl: 'https://bericontraster.com/#contact', fetchImpl: async (url, options) => {
    request = { url, ...options };
    return { ok: true, json: async () => ({ success: 'true' }) };
  } });
  const data = JSON.parse(request.body);
  assert.equal(request.url, endpoint);
  assert.equal(request.method, 'POST');
  assert.equal(request.headers.Accept, 'application/json');
  assert.equal(data.name, 'Test Visitor');
  assert.equal(data.email, 'visitor@example.com');
  assert.equal(data._replyto, data.email);
  assert.equal(data.message, 'A security enquiry');
  assert.equal(data._url, 'https://bericontraster.com/#contact');
  assert.equal(data._honey, '');
  assert.equal(data._template, 'table');
  assert(request.signal instanceof AbortSignal);
});

test('provider errors, activation requirements and malformed replies never report success', async () => {
  for (const response of [
    { ok: false },
    { ok: true, json: async () => ({ success: false, message: 'Activation required' }) },
    { ok: true, json: async () => ({ success: 'false' }) },
    { ok: true, json: async () => ({}) },
    { ok: true, json: async () => { throw new Error('Invalid JSON'); } },
  ]) await assert.rejects(submitWebsiteForm(endpoint, values, { fetchImpl: async () => response }));
  await assert.rejects(submitWebsiteForm(endpoint, values, { fetchImpl: async () => { throw new Error('Network unavailable'); } }), /Network unavailable/);
});

test('generic JSON endpoints preserve newsletter payloads and unsafe endpoint URLs are rejected', async () => {
  const data = { email: 'visitor@example.com' };
  await submitWebsiteForm('https://example.com/newsletter', data, { fetchImpl: async (url, options) => {
    assert.deepEqual(JSON.parse(options.body), data);
    return { ok: true };
  } });
  for (const url of ['http://example.com/contact', 'https://formsubmit.co/contact@example.com']) {
    await assert.rejects(submitWebsiteForm(url, values, { fetchImpl: async () => { assert.fail('Should not send'); } }));
  }
});

test('pending activation and timeouts give actionable feedback rather than generic success', async () => {
  await assert.rejects(submitWebsiteForm(endpoint, values, { fetchImpl: async () => ({ ok: true, json: async () => ({ success: 'false', message: "This form needs Activation. We've sent you an email containing an Activate Form link." }) }) }), error => {
    assert.equal(error.code, 'activation-required');
    assert.match(formErrorMessage(error, 'contact@bericontraster.com'), /awaiting email confirmation/);
    return true;
  });
  assert.match(formErrorMessage({name: 'TimeoutError'}, 'contact@example.com'), /took too long/);
});

test('contact feedback stays inside the form and failed submissions preserve text and unlock the button', async () => {
  const children = [];
  const button = { disabled: false };
  const events = {};
  const classes = new Set();
  let resets = 0;
  let attempts = 0;
  let rejectRequest;
  const form = {
    querySelectorAll: selector => selector === 'input:not([type="hidden"])' ? [{}, {}] : selector === '[type="submit"]' ? [button] : [],
    removeAttribute() {}, setAttribute() {},
    append: element => children.push(element),
    after: () => assert.fail('Feedback must not become a separate layout column'),
    addEventListener: (name, callback) => events[name] = callback,
    reportValidity: () => true,
    classList: { add: name => classes.add(name), remove: name => classes.delete(name) },
    reset: () => resets++,
  };
  const source = fs.readFileSync('src/interactions.js', 'utf8');
  const setup = source.slice(source.indexOf('function setupForms(settings)'), source.indexOf('async function setup()'));
  const document = {
    querySelectorAll: () => [form],
    createElement: () => ({ dataset: {}, setAttribute() {} }),
  };
  vm.runInNewContext(setup + '\nsetupForms(settings);', {
    document, settings: { contactEndpoint: endpoint, contactEmail: 'contact@bericontraster.com' },
    window: { location: { href: 'https://bericontraster.com/' } },
    FormData: class { *[Symbol.iterator]() { yield* Object.entries(values); } },
    submitWebsiteForm: () => { attempts++; return new Promise((resolve, reject) => { rejectRequest = reject; }); },
    formErrorMessage,
  });
  const feedback = children.find(child => child.className === 'form-feedback');
  assert(feedback.hidden);
  const request = events.submit({ preventDefault() {} });
  assert.equal(button.disabled, true);
  assert.equal(feedback.hidden, false);
  await events.submit({ preventDefault() {} });
  assert.equal(attempts, 1);
  rejectRequest({ code: 'activation-required' });
  await request;
  assert.equal(feedback.dataset.state, 'error');
  assert.match(feedback.textContent, /awaiting email confirmation/);
  assert.equal(resets, 0);
  assert.equal(button.disabled, false);
  assert.equal(classes.has('portfolio-form-busy'), false);
});
