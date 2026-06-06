const HB_ANALYTICS_RUNTIME_ROOT_URL = new URL(".", new URL(document.currentScript.src, window.location.href));
const HB_ANALYTICS_CONTENT_URL = new URL("content/site-content.json", HB_ANALYTICS_RUNTIME_ROOT_URL).href;

fetch(HB_ANALYTICS_CONTENT_URL)
  .then((response) => response.ok ? response.json() : null)
  .then((content) => {
    const endpoint = content?.site?.analytics?.endpoint || "";
    if (!endpoint) {
      return;
    }

    const payload = {
      name: "page_view",
      detail: {
        title: document.title
      },
      path: window.location.pathname + window.location.search,
      timestamp: new Date().toISOString()
    };
    const body = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, body);
      return;
    }

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true
    }).catch(() => {});
  })
  .catch(() => {});
