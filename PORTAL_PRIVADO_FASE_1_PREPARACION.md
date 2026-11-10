# CABINET REPORT — Portal privado / Fase 1: paquete listo para pruebas

**Fecha de preparación:** 09-11-2026 (Panamá).  
**Base:** `0be3dc518af92079f9905e514e5437853ec25750`.  
**Estado:** implementación local preparada, **no desplegada** en Hostinger, **sin conexión a MySQL real**.

## Paquete de instalación preparado en la conversación

Archivo: `CABINET_REPORT_PORTAL_PRIVADO_FASE_1.zip`  
SHA-256: `d2b9a2d8d398eef92ea058cf4c9f86884d13761c440badcd39720cb67d88563c`

**Importante:** este repositorio documenta la intervención; el ZIP es un artefacto descargable entregado en la conversación de ChatGPT. **No se ha incorporado el ZIP al repositorio ni se ha desplegado el backend**. Conservar el paquete para la intervención de instalación manual. Si se cambia el código, regenerar hash y revisar todos los archivos antes de instalar.

### Contenido del ZIP

- `README.md`: guía detallada de instalación, seguridad y pruebas.
- `private/CrPortal.php`: autenticación, sesiones, permisos y lectura de producciones.
- `private/config.example.php`: ejemplo sin credenciales.
- `private/schema.sql`: dos tablas web nuevas y dos vistas SQL de metadatos/identidades.
- `private/cli/hash_password.php`: alta manual de contraseña web desde terminal segura.
- `public/index.php`: único punto de entrada web.
- `public/.htaccess`: reglas para HTTPS, rutas y negación de listados.
- `public/assets/portal.css`: panel Cabinet Report responsive.
- `tests/smoke.php`: comprobaciones básicas de escape, filtros, hash y permisos.

## Diseño de identidad adoptado

Se solicitan **Cliente + Usuario + Contraseña del portal web**. No se publica una lista de usuarios por empresa para evitar enumeración. Se conservan los IDs canónicos de Cabinet Report y se crean credenciales web independientes y hasheadas. **No se utiliza el campo de contraseña histórico de TblUsuarios**, ni se modifica la aplicación Windows.

## Producciones y aislamiento

La cuenta SQL del portal no recibirá acceso directo a `TblUsuarios` ni a los BLOB de `TblTrackingRP`. Las vistas `CRPortalIdentidadesVista` y `CRPortalProduccionesVista` exponen solo campos necesarios. Los RP se filtran **en servidor** por el cliente de la sesión y, por defecto, por usuario (`Scope=own`). `Scope=tenant` requiere autorización administrativa. Búsqueda y paginación limitadas. Sin escrituras ni descargas de archivos en la primera fase.

## Pruebas ya realizadas (locales)

- PHP 8.4: sintaxis de los cinco PHP validada, sin errores.
- `tests/smoke.php`: 11 comprobaciones positivas.
- Renderizado GET `/login` sin MySQL: formulario, CSRF, campos Cliente/Usuario/Contraseña y CSS presentes.
- ZIP creado exclusivamente con nueve archivos **sin credenciales reales**.

## Bloqueantes obligatorios antes de habilitar usuarios

1. Revisar nombres y tipos del esquema MySQL real, sin leer ni compartir contraseñas.
2. Crear vistas y tablas nuevas con respaldo y privilegios mínimos, revisando SQL SECURITY DEFINER en Hostinger.
3. Instalar todos los scripts `private/` **fuera** de `/home/prolosys/cabinetreportportal.duckdns.org`.
4. Instalar solo `public/` en el document root, fusionando las reglas `.htaccess` de cPanel.
5. Comprobar PHP 8.4 real y extensión `mbstring`, además de PDO MySQL.
6. Confirmar regeneración del token DuckDNS expuesto anteriormente.
7. Provisionar la primera cuenta web piloto sin contraseñas de Windows.
8. Probar denegación anónima, CSRF, límites de login, revocación de sesiones, tenant A/B, usuarios homónimos, cuenta deshabilitada, XSS, paginación y cabeceras.
9. Diseñar MFA para roles privilegiados antes de ampliar permisos.
10. Conservar intactos la portada pública, Partners, suscripciones, precios, licencias y la aplicación Windows.

**No fusionar automáticamente.** Esta PR **no publica** el login ni afirma que las pruebas con MySQL estén completadas.