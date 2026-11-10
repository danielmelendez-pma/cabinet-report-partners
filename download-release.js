"use strict";
// Portal estático: consulta Releases oficiales en cada apertura, sin claves ni versión fijada.
(() => {
  const byId = id => document.getElementById(id);
  const latestButton = byId("open-download"), latestDialog = byId("download-dialog");
  const versionsButton = byId("open-versions"), versionsDialog = byId("versions-dialog");
  const imageDialog = byId("image-dialog");
  if (![latestButton, latestDialog, versionsButton, versionsDialog, imageDialog].every(Boolean) ||
      typeof latestDialog.showModal !== "function") return;

  const releasesBase = "https://api.github.com/repos/danielmelendez-pma/CabinetReport-Updates/releases";
  const downloadBase = "https://github.com/danielmelendez-pma/CabinetReport-Updates/releases/download/";
  const imagePattern = /^https:\/\/github\.com\/user-attachments\/assets\/[0-9a-f-]{36}$/i;
  const windowsSvg = '<svg class="windows-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M2 5.2 10.5 4v7.3H2V5.2Zm9.6-1.4L22 2v9.3H11.6V3.8ZM2 12.5h8.5v7.3L2 18.4v-5.9Zm9.6 0H22V22l-10.4-1.8v-7.7Z"/></svg>';
  let latestController = null, historyController = null;
  let latestSequence = 0, historySequence = 0;
  let imageOrigin = null, zoom = 1;

  const extractImage = body => {
    const match = body.match(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/i);
    return match && imagePattern.test(match[1]) ? match[1] : null;
  };
  const extractDate = (body, published) => {
    const found = body.match(/^Fecha\s*=\s*(\d{2}-\d{2}-\d{4})\s*$/im);
    if (found) return found[1];
    const date = new Date(published);
    return Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat("es-PA", {
      day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC"
    }).format(date) : "";
  };
  const extractChanges = body => {
    const section = body.match(/CARACTER[IÍ]STICAS DE LA VERSI[OÓ]N:[\s\S]*?(?=\[General\]|<img\b|$)/i);
    return (section ? section[0] : body).split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => /^\+\s*VERSI[OÓ]N\b/i.test(line))
      .map(line => line.replace(/^\+\s*/, "").replace(/\s+/g, " ").slice(0, 1600))
      .slice(0, 16);
  };
  function parseRelease(release) {
    if (!release || release.draft || release.prerelease || !Array.isArray(release.assets)) return null;
    if (typeof release.tag_name !== "string" || !/^v\d+(?:\.\d+){3}$/.test(release.tag_name)) return null;
    const version = release.tag_name.slice(1);
    const name = "CabinetReport-Setup-" + version + ".exe";
    const url = downloadBase + encodeURIComponent(release.tag_name) + "/" + encodeURIComponent(name);
    const asset = release.assets.find(a => a && a.name === name &&
      a.state === "uploaded" && a.browser_download_url === url);
    const body = typeof release.body === "string" ? release.body : "";
    return {
      version, date: extractDate(body, release.published_at),
      image: extractImage(body), changes: extractChanges(body),
      installer: asset ? url : null
    };
  }
  async function requestReleases(url, signal) {
    const response = await fetch(url, {
      headers: {Accept: "application/vnd.github+json"},
      cache: "no-store", signal
    });
    if (!response.ok) throw new Error("GitHub HTTP " + response.status);
    return response.json();
  }
  function clearLatest() {
    byId("download-title").textContent = "Cabinet Report";
    byId("download-date").textContent = "";
    byId("download-status").textContent = "Consultando la última versión estable…";
    byId("download-summary").textContent = "";
    byId("download-changes-title").hidden = true;
    byId("download-changes").replaceChildren();
    const img = byId("download-image"), zoomButton = byId("open-download-image");
    img.hidden = true; img.removeAttribute("src"); zoomButton.hidden = true;
    const install = byId("download-installer");
    install.hidden = true; install.removeAttribute("href");
  }
  async function showLatest() {
    const sequence = ++latestSequence;
    latestController?.abort();
    const controller = new AbortController();
    latestController = controller;
    clearLatest();
    try {
      const parsed = parseRelease(await requestReleases(releasesBase + "/latest", controller.signal));
      if (!parsed || !parsed.installer) throw new Error("Sin instalador oficial verificable");
      if (controller.signal.aborted || sequence !== latestSequence || !latestDialog.open) return;
      byId("download-title").textContent = "Cabinet Report · v" + parsed.version;
      byId("download-date").textContent = parsed.date ? "Publicación: " + parsed.date : "";
      byId("download-summary").textContent = parsed.changes.length ?
        "Versión estable más reciente publicada oficialmente." :
        "La publicación no incluye novedades con el formato habitual.";
      byId("download-changes-title").hidden = parsed.changes.length === 0;
      const list = byId("download-changes");
      parsed.changes.forEach(change => {
        const li = document.createElement("li");
        li.textContent = change; list.append(li);
      });
      if (parsed.image) {
        const img = byId("download-image");
        img.src = parsed.image;
        img.alt = "Imagen oficial de las novedades de Cabinet Report, versión " + parsed.version;
        img.hidden = false;
        byId("open-download-image").hidden = false;
      }
      const installer = byId("download-installer");
      installer.href = parsed.installer;
      installer.hidden = false;
      byId("download-status").textContent = "Última versión verificada en GitHub.";
    } catch (error) {
      if (controller.signal.aborted || sequence !== latestSequence || !latestDialog.open) return;
      byId("download-status").textContent =
        "No fue posible verificar la última versión. Cierra la ventana e inténtalo de nuevo.";
    }
  }

  function makeImageButton(release) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "release-image-trigger history-image-button";
    button.setAttribute("aria-label", "Ampliar imagen oficial de la versión " + release.version);
    const img = document.createElement("img");
    img.src = release.image;
    img.alt = "Novedades de Cabinet Report, versión " + release.version;
    img.loading = "lazy";
    img.addEventListener("error", () => {
      button.replaceChildren();
      const unavailable = document.createElement("span");
      unavailable.className = "history-image-unavailable";
      unavailable.textContent = "Imagen no disponible";
      button.replaceWith(unavailable);
    }, { once: true });
    const hint = document.createElement("span");
    hint.className = "image-zoom-hint";
    hint.textContent = "Ampliar imagen ↗";
    button.append(img, hint);
    button.addEventListener("click", () => openImage(release.image, img.alt, button));
    return button;
  }
  function releaseCard(release, index) {
    const article = document.createElement("article");
    article.className = "version-card";
    const media = document.createElement("div");
    media.className = "version-card-media";
    if (release.image) media.append(makeImageButton(release));
    else {
      const unavailable = document.createElement("span");
      unavailable.className = "history-image-unavailable";
      unavailable.textContent = "Imagen no disponible";
      media.append(unavailable);
    }
    const details = document.createElement("div");
    details.className = "version-card-content";
    const title = document.createElement("h3");
    title.textContent = "Cabinet Report · v" + release.version;
    if (index === 0) {
      const badge = document.createElement("span");
      badge.className = "version-newest";
      badge.textContent = "Más reciente";
      title.append(" ", badge);
    }
    const date = document.createElement("p");
    date.className = "version-date";
    date.textContent = release.date ? "Publicación: " + release.date : "Fecha no disponible";
    details.append(title, date);
    const heading = document.createElement("h4");
    heading.textContent = "Novedades";
    details.append(heading);
    if (release.changes.length) {
      const list = document.createElement("ul");
      release.changes.forEach(change => {
        const li = document.createElement("li");
        li.textContent = change;
        list.append(li);
      });
      details.append(list);
    } else {
      const empty = document.createElement("p");
      empty.textContent = "Esta publicación no contiene novedades en el formato habitual.";
      details.append(empty);
    }
    if (release.installer) {
      const anchor = document.createElement("a");
      anchor.className = "plans-link version-install";
      anchor.href = release.installer;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.innerHTML = windowsSvg;
      anchor.append(" Descargar para Windows ↓");
      details.append(anchor);
    } else {
      const notice = document.createElement("p");
      notice.className = "version-no-installer";
      notice.textContent = "Instalador no disponible o no verificable.";
      details.append(notice);
    }
    article.append(media, details);
    return article;
  }
  async function showHistory() {
    const sequence = ++historySequence;
    historyController?.abort();
    const controller = new AbortController();
    historyController = controller;
    const list = byId("versions-list");
    list.replaceChildren();
    const status = byId("versions-status");
    status.textContent = "Consultando las últimas diez versiones estables…";
    try {
      const entries = await requestReleases(releasesBase + "?per_page=30", controller.signal);
      if (!Array.isArray(entries)) throw new Error("Respuesta inesperada");
      const releases = entries.map(parseRelease).filter(Boolean).slice(0, 10);
      if (!releases.length) throw new Error("No hay versiones verificables");
      if (sequence !== historySequence || controller.signal.aborted || !versionsDialog.open) return;
      const fragment = document.createDocumentFragment();
      releases.forEach((release, index) => fragment.append(releaseCard(release, index)));
      list.replaceChildren(fragment);
      status.textContent = releases.length === 10 ?
        "Mostrando las 10 versiones estables más recientes." :
        "Mostrando " + releases.length + " versiones estables disponibles.";
    } catch (error) {
      if (sequence !== historySequence || controller.signal.aborted || !versionsDialog.open) return;
      status.textContent = "No fue posible cargar el historial desde GitHub. Cierra la ventana y vuelve a intentarlo.";
    }
  }

  // Zoom con scroll real para poder leer imágenes verticales a tamaño completo.
  function setZoom(value) {
    zoom = Math.max(0.5, Math.min(3, value));
    const img = byId("zoomed-image");
    img.style.width = (zoom * 100) + "%";
    byId("zoom-level").textContent = Math.round(zoom * 100) + "%";
    byId("zoom-out").disabled = zoom <= 0.5;
    byId("zoom-in").disabled = zoom >= 3;
  }
  function openImage(src, alt, origin) {
    if (!imagePattern.test(src) || imageDialog.open) return;
    imageOrigin = origin;
    const img = byId("zoomed-image");
    img.src = src;
    img.alt = alt;
    byId("image-dialog-title").textContent = alt;
    setZoom(1);
    imageDialog.showModal();
    byId("close-image").focus({preventScroll: true});
  }
  byId("open-download-image").addEventListener("click", () => {
    const img = byId("download-image");
    if (!img.hidden && img.src) openImage(img.src, img.alt, byId("open-download-image"));
  });
  byId("download-image").addEventListener("error", () => {
    byId("download-image").hidden = true;
    byId("open-download-image").hidden = true;
  });
  byId("zoomed-image").addEventListener("error", () => {
    byId("image-dialog-title").textContent = "No fue posible cargar la imagen.";
  });
  byId("zoom-in").addEventListener("click", () => setZoom(Math.round((zoom + 0.25) * 100) / 100));
  byId("zoom-out").addEventListener("click", () => setZoom(Math.round((zoom - 0.25) * 100) / 100));
  byId("close-image").addEventListener("click", () => imageDialog.close());
  imageDialog.addEventListener("click", event => {
    if (event.target === imageDialog) imageDialog.close();
  });
  imageDialog.addEventListener("close", () => {
    byId("zoomed-image").removeAttribute("src");
    const origin = imageOrigin;
    imageOrigin = null;
    if (origin && origin.isConnected && !origin.hidden) origin.focus({preventScroll: true});
  });
  latestButton.hidden = false;
  versionsButton.hidden = false;
  latestButton.addEventListener("click", () => {
    latestDialog.showModal();
    byId("close-download").focus({preventScroll: true});
    showLatest();
  });
  versionsButton.addEventListener("click", () => {
    versionsDialog.showModal();
    byId("close-versions").focus({preventScroll: true});
    showHistory();
  });
  byId("close-download").addEventListener("click", () => latestDialog.close());
  byId("close-versions").addEventListener("click", () => versionsDialog.close());
  latestDialog.addEventListener("click", event => {
    if (event.target === latestDialog) latestDialog.close();
  });
  versionsDialog.addEventListener("click", event => {
    if (event.target === versionsDialog) versionsDialog.close();
  });
  latestDialog.addEventListener("close", () => {
    latestSequence++;
    latestController?.abort();
    latestController = null;
    latestButton.focus({preventScroll: true});
  });
  versionsDialog.addEventListener("close", () => {
    historySequence++;
    historyController?.abort();
    historyController = null;
    versionsButton.focus({preventScroll: true});
  });
})();