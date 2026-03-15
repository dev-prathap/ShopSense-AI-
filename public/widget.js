(function () {
  var cfg = window.__AI_SALES_AGENT__ || {};
  if (!cfg.storeId || !cfg.host) {
    console.error("AI Sales Agent: missing storeId or host in window.__AI_SALES_AGENT__");
    return;
  }

  var host = String(cfg.host).replace(/\/$/, "");
  var position = cfg.position === "left" ? "left" : "right";
  var primaryColor = cfg.primaryColor || "#000000";
  
  var iframe = null;
  var open = false;
  var zIndex = 2147483000;

  var button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", "Open AI Sales Assistant");
  
  // Floating Bubble Styles
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

  button.onmouseenter = function() { button.style.transform = "scale(1.08) rotate(5deg)"; };
  button.onmouseleave = function() { button.style.transform = "scale(1) rotate(0)"; };

  function mountIframe() {
    if (iframe) return;
    iframe = document.createElement("iframe");
    iframe.src = host + "/widget/embed?storeId=" + encodeURIComponent(cfg.storeId);
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

  function setOpen(next) {
    mountIframe();
    open = next;
    
    if (open) {
      iframe.style.display = "block";
      iframe.style.visibility = "visible";
      setTimeout(function() {
        iframe.style.opacity = "1";
        iframe.style.transform = "translateY(0) scale(1)";
        iframe.style.pointerEvents = "auto";
      }, 10);
      button.innerHTML = closeIcon;
    } else {
      iframe.style.opacity = "0";
      iframe.style.transform = "translateY(20px) scale(0.98)";
      iframe.style.pointerEvents = "none";
      setTimeout(function() {
        iframe.style.display = "none";
        iframe.style.visibility = "hidden";
      }, 400);
      button.innerHTML = chatIcon;
    }
  }

  button.addEventListener("click", function () {
    setOpen(!open);
  });

  window.addEventListener("message", function (event) {
    if (event.origin !== host && !event.origin.includes('localhost')) return;
    var data = event && event.data ? event.data : {};
    if (data.type === "ASA_WIDGET_CLOSE") {
      setOpen(false);
    }
    if (data.type === "ASA_WIDGET_RESIZE" && iframe && typeof data.height === "number") {
      // Logic for dynamic resize if needed
    }

    if (data.type === "ASA_CART_ADD" && data.variantId) {
      console.log("AI Sales Agent: adding to cart", data.variantId);
      // Traditional Shopify Ajax API
      fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ id: data.variantId, quantity: 1 }]
        })
      })
      .then(function(res) {
        if (res.ok) {
           window.location.href = "/cart";
        } else {
           console.error("AI Sales Agent: cart add failed");
        }
      })
      .catch(function(err) {
        console.error("AI Sales Agent: cart add error", err);
      });
    }
  });

  document.body.appendChild(button);
})();
