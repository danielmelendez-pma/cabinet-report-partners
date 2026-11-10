# CABINET REPORT — Portal privado de clientes · Fase 0

**Estado:** propuesta de arquitectura y criterios de aceptación; **no implementa ni publica autenticación**.
**Repositorio del portal público:** `danielmelendez-pma/cabinet-report-partners`.
**Base de referencia:** `99fd4d37051e36617703c2e73d88a5eebdf88af5`.

## 1. Objetivo

Crear un portal privado con acceso mediante la identidad oficial de Cabinet Report, navegación lateral al estilo de la aplicación Windows y panel principal a la derecha. Primer módulo: **Mis producciones** (consulta de solo lectura). Incorporar otras funciones mediante fases independientes, tras validar autorización y seguridad.

El portal público actual de GitHub Pages permanece operativo y no almacena credenciales ni datos privados.

## 2. Arquitectura recomendada

1. **Sitio público:** GitHub Pages, con enlace de acceso al portal cuando el servicio privado esté disponible y haya superado pruebas.
2. **Sitio privado:** aplicación alojada en Hostinger bajo un dominio/subdominio propio con HTTPS. En hosting web/cloud utilizar PHP mantenido y PDO para MariaDB; otras tecnologías requieren verificar el plan.
3. **Servidor:** renderiza o sirve el panel, autentica todas las solicitudes sensibles y consulta la base de datos. El navegador no tiene conexión directa a MySQL/MariaDB.
4. **Base de datos:** credenciales exclusivas de servicio, permisos mínimos, preferentemente conexión local a la BD desde el alojamiento. No habilitar MySQL remoto desde cualquier IP.
5. **Aplicación Windows:** sin modificaciones en esta fase. Antes de habilitar acceso web con las mismas credenciales, auditar y modernizar su verificación de contraseñas mediante un plan de migración compatible y probado por separado.

**No desplegar ningún inicio de sesión real ni una API de datos hasta completar la puerta de seguridad del punto 4.**

## 3. Autenticación, sesión y autorización obligatorias

- Usar un verificador de contraseña moderno con sal (preferencia Argon2id, con algoritmo soportado por el servidor). No mantener contraseñas en claro ni introducir un verificador incompatible con Windows.
- Denegar el acceso si el usuario, el cliente o su identificador canónico no pueden resolverse inequívocamente.
- La sesión se identifica mediante cookie del servidor con `Secure`, `HttpOnly`, `SameSite`, rotación del identificador al autenticar, cierre efectivo y expiración por inactividad.
- Proteger formularios de cambio con tokens CSRF, consultas con parámetros, salida HTML escapada y cabeceras seguras (CSP, HSTS, protección contra framing, política de referrer).
- Aplicar limitación de intentos de autenticación, registros de auditoría sin secretos, bloqueo temporal proporcionado y autenticación adicional para cuentas privilegiadas.
- Todas las rutas privadas (HTML, JSON, archivos) deben verificar autenticación **y** autorización en servidor; nunca confiar en ocultar opciones por JavaScript.
- Evitar cacheo público de contenido privado (`Cache-Control: no-store`), acceso CORS innecesario y secretos en frontend, URLs, logs o GitHub.
- Credenciales de servicio y configuración fuera del repositorio público; copias de seguridad, TLS y recuperación de incidentes verificadas.

## 4. Identidad y aislamiento entre clientes

- Fuente de identidad prevista: usuarios y roles existentes de Cabinet Report (por verificar integralmente con el esquema y flujo de login actual).
- `IdCliente` y `IdUsuario` deben salir de la sesión validada en el servidor. No aceptar esos identificadores del navegador como autoridad.
- `TblTrackingRP` usa, entre otros, los metadatos `NumeroRp`, `Cliente`, `Proyecto`, `Ambiente`, `Referencia`, `Usuario` y `FechaCreacion`; el esquema definitivo e índices se revisarán antes de emitir consultas de producción.
- Cuando la pertenencia de una RP esté expresada mediante nombre `Cliente`, resolver la identidad canónica inequívocamente, denegando en caso de ambigüedad. Preferir migración a clave `IdCliente` y relaciones verificables en una fase separada, previa evaluación de impacto.
- Perfiles de consulta: usuario solo ve lo autorizado; administradores del cliente pueden tener alcance diferente únicamente según los permisos explícitos de Cabinet Report.
- Pruebas cruzadas obligatorias: clientes A y B, usuarios distintos, roles, homónimos y cambio/cierre de sesión.

## 5. Primera interfaz tras iniciar sesión

Estructura:
```
┌──────────────────────────────────────────────────────────┐
│ Cabinet Report            Cliente / Usuario   Cerrar sesión │
├────────────────┬─────────────────────────────────────────┤
│ MENÚ LATERAL   │ MIS PRODUCCIONES                         │
│                │ Buscar / filtros / paginación             │
│ Mis producciones*│ RP | Proyecto | Ambiente | Referencia   │
│                │ Fecha | Usuario | Acción permitida        │
│ [Otros módulos │ Estado sin datos / estado de error        │
│  en el futuro] │                                         │
└────────────────┴─────────────────────────────────────────┘
```

- Paleta oficial: Black `#000000`, gris `#242424`, White `#FFFFFF`, LightCoral `#F08080`, MistyRose `#FFE4E1`.
- Menú lateral a la izquierda y panel a la derecha, versión responsive con navegación accesible.
- Solo `Mis producciones` operativo en fase inicial; otros módulos no se presentarán como disponibles.
- Listado de solo lectura y paginado, por defecto sin transferir archivos BLOB. Acceso a detalles/descargas en fases posteriores y siempre bajo permisos del servidor.
- Tablas con etiquetas accesibles, estados de carga/vacío/error, mensajes neutros ante fallas, cierre de sesión y recuperación del foco.

## 6. Contrato inicial orientativo (no desplegado)

- `GET /login`: formulario protegido.
- `POST /login`: autenticación y rotación de sesión, con CSRF y limitación de intentos.
- `POST /logout`: invalida la sesión.
- `GET /app`: panel privado (respuesta denegada sin sesión).
- `GET /api/producciones?page=1&search=...`: solo metadatos filtrados **por sesión**, paginados y acotados. Devuelve 401/403 según corresponda.
- No exponer endpoints de escritura ni archivos privados en la primera fase.

## 7. Plan de implementación en PR separadas

1. **Fase 0 — actual:** diseño, revisión de compatibilidad y requisitos de seguridad, sin rutas públicas nuevas.
2. **Fase 1 — servidor privado:** entorno Hostinger de pruebas, HTTPS, configuración no pública, migración/compatibilidad de autenticación, sesiones y controles automatizados.
3. **Fase 2 — Mis producciones:** consulta read-only, filtros, paginación y pruebas reales de aislamiento tenant.
4. **Fase 3 — integración pública:** enlace `Iniciar sesión` desde la portada cuando el portal privado supere aceptación.
5. **Fases posteriores:** detalles, descargas y otros módulos, uno por PR.

## 8. Puerta de seguridad previa al despliegue

No habilitar a usuarios reales hasta que se demuestre:

- [ ] Contraseñas verificadas y almacenadas con protección moderna, con compatibilidad Windows validada.
- [ ] HTTPS obligatorio, cookies seguras y expiración/revocación de sesión.
- [ ] Peticiones anónimas a `/app`, `/api/producciones` y archivos privadas denegadas en servidor.
- [ ] Lectura de producciones de otros clientes imposible con pruebas A/B y homónimos.
- [ ] Consultas parametrizadas y usuario de BD con permisos mínimos.
- [ ] Tasa de intentos, auditoría, CSRF, XSS, cabeceras y caché privada verificados.
- [ ] Plan de backup y recuperación probado.
- [ ] No hay credenciales ni información real de clientes en el repositorio público.
- [ ] Validación en móvil y escritorio, teclado y accesibilidad básica.
- [ ] Pruebas de regresión de portada, Partners, Suscripciones, documentación y enlaces históricos.
- [ ] Revisión manual antes de merge y despliegue.

## 9. Exclusiones

Esta propuesta no modifica la aplicación Windows, esquema de BD, contraseñas, licencias, tarifas ni el portal público existente. No contiene credenciales ni datos de producción reales. **No es una implementación de login** y no debe presentarse como tal.
