(() => {
  const script = document.currentScript;
  const measurementId = script?.dataset.measurementId;
  // Previews and localhost must not contribute to production analytics.
  if (!measurementId || window.location.origin !== script.dataset.siteOrigin) return;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', measurementId);
  const loader = document.createElement('script');
  loader.async = true;
  loader.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
  document.head.append(loader);
})();
