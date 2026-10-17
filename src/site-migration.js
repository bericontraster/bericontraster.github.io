// Retire Chirpy's old offline cache during the change of site generator.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistration('/').then(registration => {
    const worker = registration?.active || registration?.waiting || registration?.installing;
    if (worker && new URL(worker.scriptURL).pathname === '/sw.min.js') {
      return registration.update();
    }
  }).catch(() => { /* A failed update must not stop the website. */ });
}
