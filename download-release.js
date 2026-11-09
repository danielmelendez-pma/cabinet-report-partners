"use strict";
// Publicación manual. Para una nueva versión, editar esta ficha tras verificar
// la Release oficial y su instalador; no hay detección automática de actualizaciones.
(() => {
  const release = Object.freeze({
    version: "8.22.2.34",
    date: "05-11-2026",
    summary: "Actualización del Revisor IA para consultar precios de materiales y mejorar el reconocimiento de revisiones al generar producción.",
    changes: [
      "Revisor IA: permite encontrar y consultar los precios de tableros y cantos de la producción durante la revisión de errores.",
      "Generar producción: mejora el reconocimiento de revisiones IA completadas, incluso cuando todavía hay hallazgos pendientes de resolver o pasar por alto. Se mantienen las confirmaciones de seguridad."
    ],
    image: "https://github.com/user-attachments/assets/334de7cf-bf0d-4bd0-866e-305f41113199",
    installer: "https://github.com/danielmelendez-pma/CabinetReport-Updates/releases/download/v8.22.2.34/CabinetReport-Setup-8.22.2.34.exe",
    releasePage: "https://github.com/danielmelendez-pma/CabinetReport-Updates/releases/tag/v8.22.2.34"
  });
  const byId = id => document.getElementById(id);
  const trigger = byId("open-download");
  const dialog = byId("download-dialog");
  const close = byId("close-download");
  if (!trigger || !dialog || !close || typeof dialog.showModal !== "function") return;
  const official = "https://github.com/danielmelendez-pma/CabinetReport-Updates/";
  if (!release.installer.startsWith(official + "releases/download/") ||
      !release.releasePage.startsWith(official + "releases/tag/") ||
      !release.image.startsWith("https://github.com/user-attachments/assets/")) return;
  byId("download-title").textContent = "Cabinet Report · v" + release.version;
  byId("download-date").textContent = "Publicación: " + release.date;
  byId("download-summary").textContent = release.summary;
  const list = byId("download-changes");
  release.changes.forEach(change => { const li = document.createElement("li"); li.textContent = change; list.appendChild(li); });
  byId("download-image").src = release.image;
  byId("download-image").alt = "Imagen oficial de novedades de Cabinet Report, versión " + release.version;
  byId("download-installer").href = release.installer;
  byId("download-release-link").href = release.releasePage;
  trigger.hidden = false;
  trigger.addEventListener("click", () => { dialog.showModal(); close.focus({preventScroll: true}); });
  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => {
    // Cerrar solo al pulsar el backdrop, no sobre el panel.
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => trigger.focus({preventScroll: true}));
  // <dialog> gestiona Escape, modalidad y confinamiento del foco de forma nativa.
})();
