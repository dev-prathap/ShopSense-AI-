/*
 * Neryn storefront chat widget.
 *
 * Shipped as a theme app extension asset and served from Shopify's CDN. The app
 * no longer injects this anywhere — the merchant enables the "Neryn AI Sales
 * Agent" app embed in their theme, which is what loads this file.
 *
 * Two bootstrap paths, because the same file also runs on Neryn's own site:
 *   - theme app extension: the block sets window.__NERYN__ with the shop
 *     domain, and the store id is resolved from it at runtime
 *   - direct embed: window.__AI_SALES_AGENT__ (or a ?storeId= on this script's
 *     own src) carries the store id already
 *
 * Keep this byte-identical to public/widget.js — tests/widget-parity.test.ts
 * enforces it. The two copies exist because Shopify serves extension assets
 * from its own CDN and cannot reach into the app's public directory.
 */
(function () {
  var cfg = window.__NERYN__ || window.__AI_SALES_AGENT__ || {};

  // Fall back to this script's own URL for the direct-embed case, where the
  // store id and host arrive as query params rather than a config object.
  if (!cfg.storeId || !cfg.host) {
    var script = document.currentScript;
    if (!script) {
      var scripts = document.getElementsByTagName("script");
      for (var i = 0; i < scripts.length; i++) {
        var src = scripts[i].src || "";
        if (src.indexOf("widget.js") !== -1 || src.indexOf("neryn-widget.js") !== -1) {
          script = scripts[i];
          break;
        }
      }
    }
    if (script && script.src) {
      if (!cfg.storeId) {
        var sidMatch = script.src.match(/[?&]storeId=([^&]+)/);
        if (sidMatch) cfg.storeId = decodeURIComponent(sidMatch[1]);
      }
      if (!cfg.host) {
        var urlParts = script.src.split("/");
        cfg.host = urlParts[0] + "//" + urlParts[2];
      }
    }
  }

  if (!cfg.host) {
    console.error("Neryn: no host configured");
    return;
  }

  var host = String(cfg.host).replace(/\/$/, "");

  /**
   * The extension asset is served from Shopify's CDN, so its URL carries no
   * store id. Resolve it from the shop domain the app embed block passed in.
   */
  function resolveStoreId() {
    if (cfg.storeId) return Promise.resolve(cfg.storeId);
    if (!cfg.shop) return Promise.resolve(null);

    return fetch(host + "/api/widget/store-info?shop=" + encodeURIComponent(cfg.shop), {
      credentials: "omit"
    })
      .then(function (res) {
        return res.ok ? res.json() : null;
      })
      .then(function (data) {
        return data && data.storeId ? data.storeId : null;
      })
      .catch(function () {
        return null;
      });
  }

  function mount(storeId) {
    if (!storeId) {
      // Nothing to show: the shop has no active Neryn store behind it. Staying
      // silent is deliberate — a broken launcher on a live storefront is worse
      // than no launcher.
      return;
    }

    var position = cfg.position === "left" ? "left" : "right";
    var primaryColor = cfg.primaryColor || "#000000";
    var prewarmed = false;

    var iframe = null;
    var open = false;
    var zIndex = 2147483000;
    var allowedOrigins = {};
    allowedOrigins[host] = true;
    if (window.location && window.location.origin) {
      allowedOrigins[window.location.origin] = true;
    }

    try {
      var preconnect = document.createElement("link");
      preconnect.rel = "preconnect";
      preconnect.href = host;
      document.head.appendChild(preconnect);
    } catch (_) {}

    var button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", "Open AI Sales Assistant");

    button.style.position = "fixed";
    button.style.bottom = "20px";
    button.style[position] = "20px";
    button.style.width = "56px";
    button.style.height = "56px";
    button.style.border = "none";
    button.style.borderRadius = "28px";
    button.style.background = primaryColor;
    button.style.color = "#fff";
    button.style.cursor = "pointer";
    button.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
    button.style.zIndex = String(zIndex);
    button.style.display = "flex";
    button.style.alignItems = "center";
    button.style.justifyContent = "center";
    button.style.transition = "all 0.4s cubic-bezier(0.19, 1, 0.22, 1)";

    var chatIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>';
    var closeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

    button.innerHTML = chatIcon;

    button.onmouseenter = function () { button.style.transform = "scale(1.08) rotate(5deg)"; };
    button.onmouseleave = function () { button.style.transform = "scale(1) rotate(0)"; };

    function mountIframe() {
      if (iframe) return;
      iframe = document.createElement("iframe");
      iframe.src = host + "/widget/embed?storeId=" + encodeURIComponent(storeId);
      iframe.title = "AI Sales Assistant";
      iframe.allow = "clipboard-write";
      iframe.style.position = "fixed";
      iframe.style.bottom = "88px";
      iframe.style[position] = "20px";
      iframe.style.width = "380px";
      iframe.style.height = "600px";
      iframe.style.maxWidth = "calc(100vw - 40px)";
      iframe.style.maxHeight = "calc(100vh - 120px)";
      iframe.style.border = "none";
      iframe.style.borderRadius = "24px";
      iframe.style.boxShadow = "0 20px 40px rgba(0,0,0,0.2)";
      iframe.style.zIndex = String(zIndex);
      iframe.style.display = "none";
      iframe.style.opacity = "0";
      iframe.style.transform = "translateY(20px) scale(0.98)";
      iframe.style.transition = "all 0.4s cubic-bezier(0.19, 1, 0.22, 1)";
      iframe.style.pointerEvents = "none";
      iframe.style.visibility = "hidden";
      document.body.appendChild(iframe);
    }

    function prewarmIframe() {
      if (prewarmed) return;
      prewarmed = true;
      mountIframe();
    }

    function setOpen(next) {
      mountIframe();
      open = next;

      if (open) {
        iframe.style.display = "block";
        iframe.style.visibility = "visible";
        setTimeout(function () {
          iframe.style.opacity = "1";
          iframe.style.transform = "translateY(0) scale(1)";
          iframe.style.pointerEvents = "auto";
        }, 10);
        button.innerHTML = closeIcon;
      } else {
        iframe.style.opacity = "0";
        iframe.style.transform = "translateY(20px) scale(0.98)";
        iframe.style.pointerEvents = "none";
        setTimeout(function () {
          iframe.style.display = "none";
          iframe.style.visibility = "hidden";
        }, 400);
        button.innerHTML = chatIcon;
      }
    }

    button.addEventListener("click", function () {
      setOpen(!open);
    });
    button.addEventListener("mouseenter", prewarmIframe, { passive: true });
    button.addEventListener("touchstart", prewarmIframe, { passive: true });

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(prewarmIframe, { timeout: 2000 });
    } else {
      setTimeout(prewarmIframe, 1800);
    }

    window.addEventListener("message", function (event) {
      if (!allowedOrigins[event.origin]) return;
      var data = event && event.data ? event.data : {};

      if (data.type === "ASA_WIDGET_CLOSE") {
        setOpen(false);
      }

      if (data.type === "ASA_CART_ADD" && data.variantId) {
        fetch("/cart/add.js", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: [{ id: data.variantId, quantity: 1 }] })
        })
          .then(function (res) {
            if (res.ok) {
              window.location.href = "/cart";
            } else {
              console.error("Neryn: cart add failed");
            }
          })
          .catch(function (err) {
            console.error("Neryn: cart add error", err);
          });
      }
    });

    document.body.appendChild(button);
  }

  function start() {
    resolveStoreId().then(mount);
  }

  if (document.body) {
    start();
  } else {
    document.addEventListener("DOMContentLoaded", start);
  }
})();
