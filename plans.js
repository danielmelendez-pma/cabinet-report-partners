"use strict";
/**
 * Fichas comerciales de CabinetReport-Docs, sin backend ni tokens.
 * GitHub RAW es la fuente pública principal: los precios nunca se atribuyen
 * a la documentación si la consulta falló o el importe no pudo validarse.
 */
(() => {
  const DOCS_ROOT = "https://raw.githubusercontent.com/danielmelendez-pma/CabinetReport-Docs/main/planes-de-suscripcion/";
  const GITBOOK_ROOT = "https://cabinet-report.gitbook.io/cabinet-report-docs/planes-de-suscripcion/";
  const PLAN_KEYS = ["optimizador", "basico", "intermedio", "profesional", "empresarial", "socio"];
  const planData = new Map(PLAN_KEYS.map(key => [key, { key, markdown: "", price: null, error: null, loading: null }]));
  const modal = document.getElementById("plan-dialog");
  const docArea = document.getElementById("plan-document");
  const status = document.getElementById("plan-dialog-status");
  const heading = document.getElementById("plan-dialog-title");
  const subtitle = document.getElementById("plan-dialog-price");
  const sourceStatus = document.getElementById("pricing-source-status");
  const calcStatus = document.getElementById("calc-pricing-status");
  const official = document.getElementById("plan-official-link");
  const select = document.getElementById("plan-select");
  const labels = Object.fromEntries([...document.querySelectorAll(".plan-card")].map(card => [card.dataset.plan, card.querySelector("h3").textContent]));
  const initialPrices = Object.fromEntries([...select.options].map(option => [option.dataset.plan, Number(option.value)]));
  let currentKey = "", lastTrigger = null, restoreFocus = true;
  const asMoney = value => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
  const safeKey = key => PLAN_KEYS.includes(key) ? key : null;
  const docsUrl = key => GITBOOK_ROOT + "plan-" + key;
  const displayName = key => labels[key] || key;
  const priceFromDocument = markdown => {
    // Only accept an explicit monthly plan headline, never an annual promotion.
    const line = markdown.split(/\r?\n/).find(item => /^#{2,4}\s.*?\bPLAN\s+.+?\$\s*[\d,.]+\s*\/\s*mes\b/i.test(item));
    const found = line && line.match(/\$\s*([\d,.]+)\s*\/\s*mes\b/i);
    if (!found) return null;
    const numeric = Number(found[1].replace(/,/g, ""));
    return Number.isFinite(numeric) && numeric > 0 && numeric <= 100000 ? numeric : null;
  };
  function refreshStatus() {
    const plans = [...planData.values()];
    const verified = plans.filter(p => p.price !== null).length;
    const done = plans.filter(p => !p.loading).length;
    if (done < plans.length) {
      sourceStatus.textContent = "Consultando precios en CabinetReport-Docs (" + verified + " de 6 verificados)...";
    } else if (verified === plans.length) {
      sourceStatus.textContent = "Tarifas mensuales verificadas en la documentación oficial. Haz clic en un plan para consultar características y descuentos.";
    } else {
      sourceStatus.textContent = "Atención: " + verified + " de 6 tarifas verificadas. Los importes marcados «sin verificar» son referencias anteriores; confirma en GitBook antes de ofrecerlos.";
    }
    const active = select.selectedOptions[0];
    const activeData = active && planData.get(active.dataset.plan);
    calcStatus.textContent = activeData && activeData.price !== null
      ? "Precio mensual del plan seleccionado verificado con la documentación oficial."
      : "Precio orientativo sin verificar para el plan seleccionado. Revisa la ficha oficial antes de ofertar.";
  }
  function updateCardsAndSimulator(key) {
    const data = planData.get(key);
    const card = document.querySelector('.plan-card[data-plan="' + key + '"]');
    const option = [...select.options].find(item => item.dataset.plan === key);
    if (!card || !option) return;
    if (data.price !== null) {
      card.querySelector(".plan-price").textContent = asMoney(data.price);
      option.value = String(data.price);
      option.textContent = card.querySelector("span").textContent.trim() + " " + displayName(key) + " · " + asMoney(data.price) + "/mes";
    } else {
      card.querySelector(".plan-price").textContent = asMoney(initialPrices[key]);
      option.value = String(initialPrices[key]);
      option.textContent = card.querySelector("span").textContent.trim() + " " + displayName(key) + " · " + asMoney(initialPrices[key]) + "/mes (sin verificar)";
    }
    const oldNotice = card.querySelector(".plan-unverified");
    if (oldNotice) oldNotice.remove();
    if (data.price === null) {
      const warning = document.createElement("span");
      warning.className = "plan-unverified";
      warning.textContent = "Tarifa sin verificar";
      warning.style.cssText = "font-size:11px;color:#ffccad;margin-top:4px";
      card.querySelector("strong").after(warning);
    }
    if (typeof render === "function") render();
    refreshStatus();
  }
  async function loadPlan(key) {
    const data = planData.get(key);
    if (!data) return null;
    if (data.loading) return data.loading;
    if (data.markdown) return data;
    data.loading = (async () => {
      try {
        const response = await fetch(DOCS_ROOT + "plan-" + key + ".md", { cache: "no-store" });
        if (!response.ok) throw new Error("HTTP " + response.status);
        const markdown = await response.text();
        if (!/^#\s+Plan\s+/im.test(markdown)) throw new Error("El documento no es una ficha de plan válida");
        data.markdown = markdown;
        data.price = priceFromDocument(markdown);
        data.error = data.price === null ? "El precio mensual no pudo verificarse en el documento." : null;
      } catch (error) {
        data.error = "No fue posible consultar el repositorio (" + error.message + ").";
        data.price = null;
      } finally {
        data.loading = null;
        updateCardsAndSimulator(key);
      }
      return data;
    })();
    return data.loading;
  }
  const clean = text => text.replace(/&#x20;|&nbsp;/gi, " ")
    .replace(/<mark\b[^>]*>/gi, "").replace(/<\/mark>/gi, "")
    .replace(/<[^>]+>/g, "").trim();
  function renderInline(el, raw) {
    const value = clean(raw).replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
    // Parse inline emphasis using text nodes only: no untrusted HTML insertion.
    const parts = value.split(/(\*\*[^*]+\*\*|__[^_]+__)/g);
    for (const part of parts) {
      if (/^(\*\*[^*]+\*\*|__[^_]+__)$/.test(part)) {
        const strong = document.createElement("strong");
        strong.textContent = part.slice(2, -2);
        el.append(strong);
      } else if (part) {
        el.append(document.createTextNode(part.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "$1")));
      }
    }
  }
  function renderMarkdown(markdown) {
    const container = document.createDocumentFragment();
    let list = null;
    const appendPara = (tag, text, className) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      renderInline(node, text);
      container.append(node);
    };
    for (let line of markdown.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed === "---") break; // Omite el enlace de navegación a README.
      if (!trimmed || /^<\/?(?:figure|figcaption|img)\b/i.test(trimmed)) { list = null; continue; }
      const h = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (h) {
        list = null;
        if (h[1].length === 1) continue; // Título ya está en la cabecera del modal.
        appendPara(h[1].length <= 3 ? "h3" : "h4", h[2]);
        continue;
      }
      const item = line.match(/^(\s*)[-*]\s+(.*)$/);
      if (item) {
        if (!list) { list = document.createElement("ul"); container.append(list); }
        const li = document.createElement("li");
        if (item[1].length) li.className = "plan-list-subitem";
        renderInline(li, item[2]);
        list.append(li);
      } else {
        list = null;
        // The source sometimes uses links in plain paragraphs: retain their
        // human-readable labels but not arbitrary external URLs or raw HTML.
        appendPara("p", trimmed);
      }
    }
    docArea.replaceChildren(container);
  }
  async function showPlan(event) {
    const card = event.currentTarget;
    const key = safeKey(card.dataset.plan);
    if (!key) return;
    lastTrigger = card;
    restoreFocus = true;
    currentKey = key;
    heading.textContent = "Plan " + displayName(key);
    subtitle.textContent = "Consultando tarifa oficial...";
    official.href = docsUrl(key);
    status.hidden = false;
    status.textContent = "Cargando ficha desde CabinetReport-Docs...";
    docArea.replaceChildren();
    if (document.getElementById("calcbox").classList.contains("is-maximized")) maximize(false);
    modal.showModal();
    document.getElementById("close-plan-dialog").focus({ preventScroll: true });
    document.getElementById("plan-dialog-content").scrollTop = 0;
    const data = await loadPlan(key);
    if (currentKey !== key || !modal.open || !data) return;
    if (data.markdown) {
      subtitle.textContent = data.price === null
        ? "Tarifa mensual sin verificar · consultar GitBook"
        : asMoney(data.price) + " / mes · documentación oficial";
      renderMarkdown(data.markdown);
      if (data.error) {
        status.textContent = data.error + " Consulta la documentación oficial antes de cotizar.";
      } else {
        status.textContent = "Información obtenida directamente del repositorio oficial de documentación.";
      }
    } else {
      subtitle.textContent = "No fue posible verificar la tarifa";
      status.textContent = (data.error || "Ficha no disponible.") + " Utiliza el enlace a GitBook para consultar el plan.";
    }
  }
  document.querySelectorAll(".plan-card").forEach(button => button.addEventListener("click", showPlan));
  document.getElementById("close-plan-dialog").addEventListener("click", () => modal.close());
  modal.addEventListener("click", event => { if (event.target === modal) modal.close(); });
  modal.addEventListener("close", () => {
    currentKey = "";
    if (restoreFocus && lastTrigger) lastTrigger.focus({ preventScroll: true });
  });
  document.getElementById("plan-to-calculator").addEventListener("click", () => {
    const key = currentKey;
    const option = [...select.options].find(item => item.dataset.plan === key);
    if (!option) return;
    select.value = option.value;
    if (typeof render === "function") render();
    refreshStatus();
    restoreFocus = false;
    modal.close();
    document.getElementById("simulador").scrollIntoView({ behavior: "smooth", block: "start" });
    select.focus({ preventScroll: true });
  });
  // Independent requests: partial GitHub failures do not block usable plans.
  PLAN_KEYS.forEach(key => { loadPlan(key); });
  refreshStatus();
})();