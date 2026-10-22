// FormSubmit needs lowercase email/message fields and an explicit success check.
// Other configured JSON form endpoints retain their existing payload format.
export async function submitWebsiteForm(endpoint, values, { pageUrl = '', fetchImpl = fetch } = {}) {
  const url = new URL(endpoint);
  if (url.protocol !== 'https:') throw new Error('Form endpoints must use HTTPS.');
  const formSubmit = url.hostname === 'formsubmit.co';
  if (formSubmit && !url.pathname.startsWith('/ajax/')) throw new Error('Use the FormSubmit AJAX endpoint.');
  const data = formSubmit ? {
    name: String(values.Name || '').trim(),
    email: String(values.Email || '').trim(),
    message: String(values.Project || '').trim(),
    _replyto: String(values.Email || '').trim(),
    _subject: 'New website enquiry - Beri Contraster',
    _template: 'table',
    _url: pageUrl,
    _honey: String(values._honey || ''),
  } : values;
  const response = await fetchImpl(url.href, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error('The form service did not accept the submission.');
  if (formSubmit) {
    const result = await response.json();
    if (result.success !== true && result.success !== 'true') {
      const error = new Error('The form service did not confirm the submission.');
      if (typeof result.message === 'string' && /activat|confirm.*email/i.test(result.message)) error.code = 'activation-required';
      throw error;
    }
  }
}

export function formErrorMessage(error, email) {
  if (error?.code === 'activation-required') return `This form is awaiting email confirmation. Please email ${email} directly for now.`;
  if (error?.name === 'TimeoutError' || error?.name === 'AbortError') return `Sending took too long. Please try again or email ${email}.`;
  return `Could not send. Please try again or email ${email}.`;
}
