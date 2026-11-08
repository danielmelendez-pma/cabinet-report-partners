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
