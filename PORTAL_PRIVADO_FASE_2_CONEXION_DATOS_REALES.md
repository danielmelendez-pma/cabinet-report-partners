# CABINET REPORT — Portal privado · Fase 2: preparación de conexión con datos reales

**Fecha:** 09-11-2026 (Panamá).  
**Punto de partida:** `e70892579bc1ec3d2eeb19ea4a2f7f0cb4964262`.  
**Estado:** paquete de integración preparado **sin despliegue ni acceso a MySQL real**. No se han visto ni extraído producciones de clientes.

## Objetivo

Priorizar el funcionamiento del panel lateral **Mis producciones** y su interfaz Cabinet Report utilizando metadatos reales de Hostinger cuando el servidor quede instalado, **sin abrir acceso anónimo a la base de datos**.

Se mantiene la solución preparada en la fase anterior: PHP 8.4, PDO MySQL/MariaDB, sesiones web independientes de Windows, vistas SQL que excluyen BLOB, consultas parametrizadas, búsqueda y paginación. El cliente y usuario autorizados proceden exclusivamente de la sesión validada. No cambiar precios, licencias, credenciales Windows, esquema heredado ni contenido del portal público.

## Entregable

Archivo de instalación entregado en la conversación de ChatGPT:

- **Nombre:** `CABINET_REPORT_PORTAL_PRIVADO_FASE_2_DATOS_REALES.zip`
- **SHA-256:** `5ec0c69c82b0979c0b66613ceaf5ac402830378b2d860bea3eafb2222c694085`
- Contiene el paquete funcional de la fase 1 y dos nuevas herramientas:
  - `private/preflight_schema.sql`: consulta de solo lectura para phpMyAdmin que comprueba las columnas necesarias en `TblCliente`, `TblUsuarios` y `TblTrackingRP`, detecta duplicidad de identidades y cuenta RP sin revelar valores.
  - `private/cli/verify_live.php`: script **solo CLI** para comprobar conexión PDO con configuración privada, las dos vistas y las tablas web, los permisos mínimos y el conteo agregado de producciones. No transfiere archivos RP.

El código PHP operativo del ZIP es para instalar en Hostinger; el paquete **no se incorpora al árbol público de GitHub Pages** ni contiene secretos, datos de clientes ni conexiones preconfiguradas.

## Validación local

- PHP 8.4: sin errores sintácticos en todos los scripts PHP del ZIP.
- Pruebas estáticas `tests/smoke.php`: **11 comprobaciones correctas**.
- `verify_live.php` sin configuración privada: detiene la ejecución con código 2, sin abrir ninguna conexión ni divulgar credenciales.
- No ha sido posible ejecutar comprobaciones contra el servidor real desde esta conversación.

## Ruta de despliegue y validación

1. En Hostinger, identificar la base correcta desde hPanel/cPanel, obtener respaldo y ejecutar **únicamente** `private/preflight_schema.sql` en phpMyAdmin. Validar todas las columnas. No compartir contraseñas, tokens, BLOB ni registros de cliente.
2. Si el esquema coincide, revisar y aprobar `private/schema.sql` antes de crear vistas y tablas web; no altera las tablas Windows. Crear usuario SQL exclusivo de mínimo privilegio, sin SELECT directo en `TblUsuarios` o `TblTrackingRP`.
3. Instalar **solo `public/`** en el document root `/home/prolosys/cabinetreportportal.duckdns.org/`. Instalar `private/`, configuración y sesiones fuera de esa carpeta, por ejemplo `/home/prolosys/cr-portal-private/`.
4. Configurar `config.php` de manera privada con las credenciales del usuario SQL del portal; nunca subirla a GitHub ni a la carpeta pública. Verificar HTTPS y requisitos de PHP/PDO/mbstring.
5. Ejecutar por CLI privada `php /home/prolosys/cr-portal-private/cli/verify_live.php`. Debe confirmar conexión, columnas, lecturas autorizadas y no permiso SQL directo sobre tablas heredadas.
6. Crear una cuenta web piloto con contraseña independiente y hash seguro, vinculada por `IdCliente` e `IdUsuario`; configurar `Scope=own` y consulta read-only.
7. Abrir el panel privado bajo HTTPS. Contrastar dos o tres RP reales con Windows y demostrar denegación de acceso a los de otros usuarios/clientes y a los endpoints anónimos. Validar responsive y navegación.
8. Solo después de validar los pasos anteriores, considerar añadir `Iniciar sesión` al portal público mediante otra PR.

## Criterios de aceptación (pendientes, no afirmar éxito anticipadamente)

- [ ] Preflight de schema contra Hostinger revisado, sin campos faltantes.
- [ ] Vistas y privilegios mínimos comprobados.
- [ ] Script CLI devuelve conteo real agregado y no expone datos.
- [ ] Cuenta piloto inicia sesión y ve sus RP reales mediante filtros/paginación.
- [ ] Acceso anónimo, cross-tenant y cross-user rechazados en el servidor.
- [ ] Contraste entre 2–3 números RP del portal y Cabinet Report Windows.
- [ ] Rediseño responsive validado en escritorio y móvil.
- [ ] Sin accesos a BLOB ni escrituras en BD de Windows.
- [ ] No hay secretos en GitHub, document root ni logs.

**Decisión:** fase de preparación lista para prueba operativa, pero **no implica conexión efectiva con MySQL ni despliegue completado**. Mantener PR para revisión manual; no fusionar automáticamente.
