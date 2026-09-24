/* Aggregate-only analytics. No visitor ID, tracking cookie or full referrer URL. */
(() => {
  if (!['hammythecat.com', 'www.hammythecat.com'].includes(location.hostname)) return;
  const preference = new URLSearchParams(location.search).get('analytics');
  let disabled = preference === 'off';
  try {
    if (preference === 'off') localStorage.setItem('hammy-analytics-opt-out', '1');
    if (preference === 'on') localStorage.removeItem('hammy-analytics-opt-out');
    disabled = localStorage.getItem('hammy-analytics-opt-out') === '1';
  } catch { /* Privacy preferences may block browser storage. */ }
  if (disabled || navigator.doNotTrack === '1' || navigator.globalPrivacyControl || new URLSearchParams(location.search).has('workdesk_preview')) return;
  const path = location.pathname === '/monokit' || location.pathname === '/monokit/' || location.pathname === '/monokit/index.html' ? '/monokit/' : location.pathname === '/' || location.pathname === '/index.html' ? '/' : null;
  if (!path) return;
  const endpoint = 'https://hammy-workdesk.excitedcherry0909.workers.dev/collect';
  let referrer = '';
  try { if (document.referrer) referrer = new URL(document.referrer).origin; } catch {}
  function send(kind, target = '') {
    const body = JSON.stringify({kind, path, target, referrer});
    try {
      if (navigator.sendBeacon?.(endpoint, new Blob([body], {type: 'text/plain'}))) return;
      fetch(endpoint, {method: 'POST', body, mode: 'cors', credentials: 'omit', keepalive: true, headers: {'Content-Type': 'text/plain'}}).catch(() => {});
    } catch { /* Analytics must never interrupt the portfolio. */ }
  }
  send('page_view');
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    let url; try { url = new URL(link.href); } catch { return; }
    if (url.hostname === 'apps.apple.com') {
      const id = /\/id(\d+)/.exec(url.pathname)?.[1];
      if (['6800731074', '6799425026', '6802944632', '6808957187'].includes(id)) send('store_click', id);
    } else if (url.origin === location.origin && /^\/monokit\/?$/.test(url.pathname) && path === '/') {
      send('monokit_click', url.hash.slice(1) || 'monokit');
    }
  }, {passive: true});
})();
