# CABINET REPORT — Auditoría de Etapa 58

Fecha: 09-11-2026. Repositorio: `danielmelendez-pma/cabinet-report-partners`.

## Estado inicial verificado

- HEAD inicial: `48d7780d017264623098764d175ec07e803bbd91`.
- Pull requests abiertas antes de la intervención: **0**.
- GitHub Pages: workflow `42725597883`, completado correctamente en el HEAD esperado.

## Hallazgos y correcciones

1. **Navegación desde Partners/Suscripciones.** El usuario reportó que el enlace Inicio cargaba una portada anterior. Se observó que los enlaces volvían a `index.html` mientras que un lector público todavía mostraba contenido obsoleto, pese al despliegue exitoso. Se unifica Inicio y el logo a la ruta canónica `./` y se añade `portal-home.js` para solicitar una visita fresca mediante un parámetro único en el clic normal. Sin JavaScript, el enlace sigue apuntando a la raíz. No se elimina la ruta antigua `index.html`.
2. **Fechas de versiones.** En algunas Releases el campo `Fecha=` de la versión difiere de `published_at`. Anteriormente se etiquetaba esa fecha interna como «Publicación». Ahora se distinguen «Fecha de versión» y «Publicada en GitHub» y se emplea el formato DD-MM-AAAA en ambos casos.
3. **Imágenes.** La Release `v8.15.4.4` carece de imagen oficial HTML; se mantiene «Imagen no disponible», sin imagen inventada.

## Diez Releases estables contrastadas con la API oficial

| Release | Instalador con nombre/version correcto, estado uploaded | Imagen oficial |
| --- | --- | --- |
| 8.22.2.34 | Sí | Sí |
| 8.21.2.10 | Sí | Sí |
| 8.20.4.5 | Sí | Sí |
| 8.19.3.21 | Sí | Sí |
| 8.18.3.33 | Sí | Sí |
| 8.17.3.9 | Sí | Sí |
| 8.16.3.94 | Sí | Sí |
| 8.15.5.27 | Sí | Sí |
| 8.15.4.4 | Sí | No publicada |
| 8.14.2.5 | Sí | Sí |

Las diez fichas disponen de un asset `CabinetReport-Setup-X.X.X.X.exe` que coincide con su etiqueta, en estado `uploaded`. No se descargaron ejecutables completos (aproximadamente 548 MB cada uno). La consulta de `/releases/latest` devolvió `v8.22.2.34` al realizar la auditoría.

## Pruebas manuales posteriores a publicación

- Desde Partners y Suscripciones, pulsar **Inicio** y el logo y confirmar portada nueva (botón Versiones y descarga dinámica); probar con caché antigua, navegación atrás y navegador móvil.
- Abrir los diálogos mediante ratón y teclado; probar Escape, clic sobre fondo, botón de cierre y retorno del foco al disparador. Probar también la apertura del visor desde otro modal.
- Verificar zoom, scroll vertical de las capturas largas, diseño responsive y ausencia de scroll innecesario en laptops.
- Contrastar las diez tarjetas con Releases, imagen o mensaje de ausencia, descripción, fechas y botón particular. Abrir dos veces la ventana de descarga para confirmar consulta dinámica.
- Comprobar Partners, suscripciones y los enlaces antiguos con fragmentos como `/#simulador`.

**Limitación:** La inspección de código, la comprobación de GitHub y una lectura pública no equivalen a una batería completa de interacciones en un navegador real, especialmente en móviles. No se tocaron precios, licencias, la aplicación Windows ni destinos históricos.
