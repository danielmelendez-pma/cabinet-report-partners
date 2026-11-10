"use strict";
// Solicita una portada fresca al volver desde Partners o Suscripciones.
// El href="./" original es un fallback accesible incluso sin JavaScript.
document.addEventListener("click", event => {
  const link = event.target instanceof Element ? event.target.closest("a[data-portal-home]") : null;
  if (!link || event.defaultPrevented || event.button !== 0 ||
      event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  if (link.target && link.target !== "_self") return;
  const destination = new URL(link.href);
  if (destination.origin !== location.origin) return;
  destination.searchParams.set("_cr_fresh", String(Date.now()));
  event.preventDefault();
  location.assign(destination.href);
});
