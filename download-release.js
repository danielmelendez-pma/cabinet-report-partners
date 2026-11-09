"use strict";
// Cada apertura consulta la última Release estable directamente en GitHub.
// No se conserva una versión manual ni se reutiliza un instalador obsoleto.
(() => {
  const byId = id => document.getElementById(id);
  const trigger = byId("open-download");
  const dialog = byId("download-dialog");
  const close = byId("close-download");
  if (!trigger || !dialog || !close || typeof dialog.showModal !== "function") return;

  const api = "https://api.github.com/repos/danielmelendez-pma/CabinetReport-Updates/releases/latest";
  const downloadsRoot = "https://github.com/danielmelendez-pma/CabinetReport-Updates/releases/download/";
  const imageRoot = "https://github.com/user-attachments/assets/";
  const title = byId("download-title");
  const date = byId("download-date");
  const status = byId("download-status");
  const summary = byId("download-summary");
  const heading = byId("download-changes-title");
  const list = byId("download-changes");
  const image = byId("download-image");
  const installer = byId("download-installer");
  let controller = null;
  let requestNumber = 0;

  function clearDetails() {
    title.textContent = "Cabinet Report";
    date.textContent = "";
    status.textContent = "Consultando la última versión estable…";
    summary.textContent = "";
    heading.hidden = true;
    list.replaceChildren();
    image.hidden = true;
    image.removeAttribute("src");
    installer.hidden = true;
    installer.removeAttribute("href");
  }

  function readRelease(data) {
    if (!data || data.draft || data.prerelease || !Array.isArray(data.assets)) {
      throw new Error("La publicación no es una Release estable válida.");
    }
    const tag = data.tag_name;
    if (typeof tag !== "string" || !/^v\d+(?:\.\d+){3}$/.test(tag)) {
      throw new Error("La versión oficial tiene un formato inesperado.");
    }
    const version = tag.slice(1);
    const filename = "CabinetReport-Setup-" + version + ".exe";
    const expectedUrl = downloadsRoot + encodeURIComponent(tag) + "/" + encodeURIComponent(filename);
    const asset = data.assets.find(item =>
      item && item.name === filename && item.state === "uploaded" &&
      item.browser_download_url === expectedUrl
    );
    if (!asset) throw new Error("La última versión no incluye un instalador oficial verificable.");

    const body = typeof data.body === "string" ? data.body : "";
    const matchDate = body.match(/^Fecha\s*=\s*(\d{2}-\d{2}-\d{4})\s*$/im);
    const published = new Date(data.published_at);
    const fallbackDate = Number.isNaN(published.getTime()) ? "" :
      new Intl.DateTimeFormat("es-PA", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(published);
    const changesMatch = body.match(/CARACTER[IÍ]STICAS DE LA VERSI[OÓ]N:[\s\S]*?(?=\[General\]|<img\b|$)/i);
    const changes = (changesMatch ? changesMatch[0] : body)
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => /^\+\s*VERSI[OÓ]N\s/i.test(line))
      .map(line => line.replace(/^\+\s*/, "").replace(/\s+/g, " ").slice(0, 1200))
      .slice(0, 12);
    const imageMatch = body.match(/<img\b[^>]*\bsrc=["'](https:\/\/github\.com\/user-attachments\/assets\/[a-f0-9-]+)["'][^>]*>/i);
    const officialImage = imageMatch && imageMatch[1].startsWith(imageRoot) ? imageMatch[1] : null;
    return { version, date: matchDate ? matchDate[1] : fallbackDate, changes, officialImage, installerUrl: expectedUrl };
  }

  async function loadLatest() {
    const currentRequest = ++requestNumber;
    if (controller) controller.abort();
    controller = new AbortController();
    clearDetails();

    try {
      const response = await fetch(api, {
        method: "GET",
        headers: { Accept: "application/vnd.github+json" },
        cache: "no-store",
        signal: controller.signal
      });
      if (!response.ok) throw new Error("GitHub respondió HTTP " + response.status);
      const data = readRelease(await response.json());
      if (controller.signal.aborted || currentRequest !== requestNumber || !dialog.open) return;

      title.textContent = "Cabinet Report · v" + data.version;
      date.textContent = data.date ? "Publicación: " + data.date : "";
      summary.textContent = "Versión estable más reciente publicada oficialmente.";
      heading.hidden = data.changes.length === 0;
      data.changes.forEach(change => {
        const li = document.createElement("li");
        li.textContent = change;
        list.appendChild(li);
      });
      if (data.changes.length === 0) {
        summary.textContent = "Versión estable más reciente. La publicación no incluye novedades en el formato habitual.";
      }
      if (data.officialImage) {
        image.src = data.officialImage;
        image.alt = "Imagen oficial de novedades de Cabinet Report, versión " + data.version;
        image.hidden = false;
      }
      installer.href = data.installerUrl;
      installer.hidden = false;
      status.textContent = "Última versión verificada en GitHub.";
    } catch (error) {
      if (currentRequest !== requestNumber || !dialog.open || error.name === "AbortError") return;
      status.textContent = "No fue posible verificar la última versión en GitHub. Cierra esta ventana e inténtalo de nuevo.";
      summary.textContent = "";
      // Sin enlace de respaldo: nunca ofrecer una versión anterior como si fuera la última.
      installer.hidden = true;
      installer.removeAttribute("href");
    }
  }

  image.addEventListener("error", () => { image.hidden = true; });
  trigger.hidden = false;
  trigger.addEventListener("click", () => {
    dialog.showModal();
    close.focus({ preventScroll: true });
    loadLatest();
  });
  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    requestNumber++;
    if (controller) controller.abort();
    controller = null;
    trigger.focus({ preventScroll: true });
  });
  // <dialog> gestiona Escape y confinamiento del foco de forma nativa.
})();
