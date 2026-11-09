# Cabinet Report — portal oficial y Partners

Este repositorio publica en GitHub Pages el **portal principal de Cabinet Report**, la información del programa Partners y el catálogo interactivo de suscripciones.

## Páginas públicas

| Página | Archivo | Dirección |
| --- | --- | --- |
| Portal principal | `index.html` | https://danielmelendez-pma.github.io/cabinet-report-partners/ |
| Programa Partners | `partners.html` | https://danielmelendez-pma.github.io/cabinet-report-partners/partners.html |
| Planes de suscripción | `suscripciones.html` | https://danielmelendez-pma.github.io/cabinet-report-partners/suscripciones.html |

El logo superior de **Partners** y **Suscripciones** vuelve al portal. Los enlaces antiguos de Partners que usaban `/#planes`, `/#simulador` y otras anclas se redirigen a `partners.html` conservando el fragmento y los parámetros de consulta.

## Recursos externos enlazados desde el portal

- [Documentación oficial](https://cabinet-report.gitbook.io/cabinet-report-docs/)
- [Curso de Cabinet Report](https://cabinet-report.gitbook.io/curso-de-cabinet-report/)
- [Manual de usuario](https://cabinet-report.gitbook.io/cabinet-report-docs/manual-de-usuario)
- [YouTube](https://www.youtube.com/@CabinetReport)
- [Instagram](https://www.instagram.com/cabinet.report/)
- [Canal de WhatsApp](https://www.whatsapp.com/channel/0029VbBCP1Z3gvWW4PTFQg1a)
- [LinkedIn del desarrollador](https://www.linkedin.com/in/daniel-mel%C3%A9ndez-07ba0b29/)

## Identidad visual y compatibilidad

- Logotipos existentes `logo-ovalado.png` (cabecera) y `logo-redondo.png` (centro y favicon).
- Paleta Cabinet Report: negro, blanco, gris #242424, gris #3c3c3c, LightCoral #f08080 y MistyRose #ffe4e1; fondo de marca #111216.
- El portal usa `portal.css` independiente para no modificar la hoja `styles.css` ni el comportamiento del simulador de Partners.
- Se preservan `script.js`, `plans.js`, el modal de suscripciones y los seis planes, incluido Profesional.
- Diseño responsive y enlaces de navegación accesibles con teclado.

## Validación posterior a publicar

1. Abrir la raíz de GitHub Pages y verificar logo, eslogan, cuatro enlaces y redes.
2. Abrir `partners.html` y verificar que el simulador, modales y formularios siguen funcionando.
3. Abrir `suscripciones.html` y comprobar que los seis planes y sus ventanas emergentes se conservan.
4. Pulsar el logo superior en Partners y Suscripciones y confirmar que vuelve al portal.
5. Probar un enlace antiguo con `/#simulador` y comprobar que conserva el acceso directo.
6. Revisar móvil y escritorio, incluyendo el enlace al curso y al manual.

## Etapa 54 — Descarga de la última versión publicada

El botón **Descargar última versión** de la portada abre un diálogo nativo accesible con imagen oficial, descripción y enlace directo al instalador para Windows. La ficha está definida únicamente en `download-release.js`; **no es una conexión automática** con GitHub Releases. El código `script.js` del simulador Partners no se modifica.

**Fuente verificada (09-11-2026):**
- Repositorio oficial de instaladores: https://github.com/danielmelendez-pma/CabinetReport-Updates
- Release sin etiqueta prerelease: https://github.com/danielmelendez-pma/CabinetReport-Updates/releases/tag/v8.22.2.34
- `version.ini`: `Version=8.22.2.34`, `Fecha=05-11-2026`.
- Instalador (asset publicado): `CabinetReport-Setup-8.22.2.34.exe` — 547827272 bytes (aprox. 548 MB), SHA-256 `0252e95e9e81b6771cef368a134bad78c7cdd2f397ca2fa1e7e0b6c194965ff8`.
- Imagen oficial: https://github.com/user-attachments/assets/334de7cf-bf0d-4bd0-866e-305f41113199
- Novedades y fecha tomadas del cuerpo de la Release.

**Actualizar una publicación:** verificar la última Release pública estable y sus assets; editar los campos `version`, `date`, `summary`, `changes`, `image`, `installer` y `releasePage` en `download-release.js`; cambiar el parámetro de caché del script en `index.html` si corresponde; revisar que todas las URLs pertenezcan a la publicación real. No asumir que la versión cambia automáticamente.

**Pruebas manuales:** abrir portada en escritorio, laptop estrecha y móvil; comprobar ambos botones en la misma fila cuando quepan; abrir el modal con teclado; tabular dentro del diálogo; cerrar con Escape, botón × y backdrop; restaurar foco al disparador; verificar imagen y enlace de descarga en GitHub; probar zoom 200%; verificar navegación de Partners, suscripciones y redirecciones antiguas. GitHub API confirma el asset publicado, pero una transferencia real de ~548 MB no se ha ejecutado durante esta etapa.
