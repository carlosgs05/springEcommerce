# Contrato Día 2 — Autenticación (fijado por el líder; nadie lo cambia por su cuenta)

> **Decisión final del dueño (reemplaza la anterior de 2 factores):** autenticación de **un solo paso,
> correo + contraseña**, para admin y cliente por igual. **No hay segundo factor de ningún tipo** (ni
> Google Authenticator/TOTP, ni códigos de respaldo, ni WebAuthn, ni SMS). Todo el código, columnas,
> tablas y pantallas que existían para eso se quitan (no quedan apagados).
> Como consecuencia, también se quita el flujo "Recuperar acceso" (y su variante de aprobación por otro
> admin): solo existía para quien perdía el celular. Quien olvida la clave usa "Olvidé mi contraseña",
> igual para admin y cliente.

Si al implementar descubres que algo de aquí no funciona, NO lo cambies en silencio:
déjalo como está escrito y dilo en tu informe (el líder lo relaya al otro lado).

Formato de respuesta de TODOS los endpoints de /api/auth: el JSON de siempre (`UsuarioDTO` con
`@JsonInclude(NON_NULL)`): `statusCode` (número, igual al status HTTP), `message` (texto en español,
genérico, apto para mostrar al usuario), `errors` / `fieldErrors` (solo en validaciones 400) y los
campos propios de cada endpoint. El status HTTP real coincide con `statusCode`.
Nunca `"Error: " + e.getMessage()` hacia el cliente: el detalle va al log del servidor (SLF4J).
Límite agotado => **429** con `ContadorAcotado.MSG_LIMITE`.

## Objeto `usuario` seguro (único formato que sale del backend en CUALQUIER respuesta)
```json
{ "iduser": 5, "nombre": "Ana", "apellido": "Pérez", "correo": "ana@x.com", "celular": "987654321",
  "dni": "12345678", "rol": { "idrol": 2, "nombre": "CLIENTE" } }
```
Jamás aparecen: password, resetCode, resetCodeExpiresAt, verificationToken, tokenExpiration,
correoPendiente*, sesionVersion. (Ya no existe `mfaEnabled`.) Roles reales en BD: idrol 1 = "ADMINISTRADOR",
idrol 2 = "CLIENTE". La respuesta de login trae además `rol` y `permisos` (forma que Login.tsx lee: `rol.idrol`, `rol.nombre`).

## Tokens
- Un solo tipo: **JWT de sesión**, claim `typ = "access"`, 24 h. Lleva `pwv` (huella de la clave) y `sv`
  (= `usuario.sesion_version`). `JWTAuthFilter` solo autentica si `typ=access`, `pwv` coincide con la clave
  actual y `sv` coincide con la columna. Cualquier otro token (incluidos los viejos `mfa_totp`/`mfa_setup`)
  => la petición sigue como anónima (401 en rutas protegidas), nunca 500.
- `sesion_version` sube (+1, en el mismo UPDATE) al cambiar rol (cambio real) y al confirmar cambio de correo:
  las sesiones viejas mueren.
- El frontend guarda el JWT en localStorage `authToken` (como hoy).

## Endpoints públicos (sin sesión)
### POST /api/auth/register
Body (nombre, apellido, dni, correo, password, celular). `idrol` del body se IGNORA: toda cuenta registrada
por aquí es CLIENTE (idrol 2). 200 / 400 con `errors`.
### GET /api/auth/verify-email?token=...  — mensajes genéricos.
### POST /api/auth/login  `{correo, password}`  — UN SOLO PASO
- OK (admin o cliente, sin diferencia): **200** `{statusCode:200, token, usuario, rol, permisos, message:"Inicio de sesión exitoso"}`.
- Credenciales malas o correo inexistente: **401** `{statusCode:401, message:"Correo o contraseña incorrectos"}` (mismo texto en ambos casos).
- Cuenta sin verificar: **403** `"Debes verificar tu correo antes de iniciar sesión"`.
- Límite de intentos por correo y por IP (los contadores `loginCorreo`/`loginIp` que ya existen): **429**.
- **Ya no existen** `POST /api/auth/login/mfa`, `/api/auth/mfa/**`, ni los campos `mfaRequired`, `mfaSetupRequired`, `mfaStep`, `mfaToken`, `restart`.
### POST /api/auth/forgot-password `{correo}`
- Siempre **200** `{statusCode:200, message:"Si el correo está registrado, te enviamos un código de 6 dígitos"}` exista o no (400 solo por formato). Igual para admin y cliente (ya no hay caso especial de admin).
### POST /api/auth/verify-reset-code `{correo, resetCode}`
- OK **200**; mal/expirado **400** fieldErrors `resetCode` "Código inválido o expirado". Máx 5 fallos por código => se invalida.
### POST /api/auth/reset-password `{correo, resetCode, newPassword, confirmPassword}`
- Revalida el código (vigencia 10 min, mismo límite de fallos). Sin código válido NO cambia nada: **400** "Código inválido o expirado".
- Reglas de la clave: **400** con `errors`/`fieldErrors`. OK: **200**, código anulado, pedido de cambio de correo pendiente anulado.
- Tope por IP (30 / 15 min) en forgot-password, verify-reset-code y reset-password (forgot sigue con el 200 genérico sin enviar nada).
- **Ya no existen** `recover-access`, `verify-recover-code`, `recover-access/reset`.

## Endpoints con sesión (`Authorization: Bearer <JWT>`); sin él => 401
### GET /api/auth/me  => **200** `{statusCode:200, usuario}` del dueño del token.
### POST /api/auth/correo — exige sesión y devuelve SOLO el `usuario` seguro del dueño del token (ignora el body).
### PUT /api/auth/update-user `{nombre, apellido, celular}`
- Edita SOLO la cuenta del token (cualquier `correo` del body se ignora). **200** `{statusCode:200, usuario, message}`; 400 si celular no son 9 dígitos o nombre/apellido vacíos.
### PUT /api/auth/change-password `{currentPassword, newPassword, confirmPassword}`
- Contraseña actual incorrecta: **400** fieldErrors `currentPassword` "La contraseña actual no es correcta"; cada fallo cuenta en un límite por usuario/IP => 429.
- Reglas de la clave nueva como reset (400). OK **200** `{statusCode:200, token, message}` (token nuevo; los viejos mueren por `pwv`).
### POST /api/auth/change-email `{currentPassword, newCorreo}`
- Orden: contraseña actual → `newCorreo`. Clave mal: **400** fieldErrors `currentPassword` (mismo límite que change-password).
- `newCorreo` vacío/formato malo/>100: **400** `newCorreo` "Ingresa un correo electrónico válido"; igual al actual: "Ese ya es tu correo actual"; usado: "Ese correo no está disponible".
- Máx 3 pedidos por usuario cada 15 min (4.º => 429).
- OK: guarda `correo_pendiente` + código (10 min), manda el código AL CORREO NUEVO y un aviso al ACTUAL ("Se pidió cambiar el correo de tu cuenta. Si no fuiste tú, cambia tu contraseña."). **200** "Te enviamos un código de 6 dígitos al correo nuevo".
### POST /api/auth/change-email/confirm `{emailCode}`
- Mal/expirado/sin pedido: **400** `emailCode` "Código inválido o expirado"; 5.º fallo anula el pedido ("Demasiados intentos. Pide un código nuevo"). Correo ocupado entretanto: "Ese correo ya no está disponible".
- OK: UPDATE condicionado que pone `correo = correo_pendiente`, limpia las 3 columnas y sube `sesion_version`. Aviso al correo VIEJO ("El correo de tu cuenta se cambió. Si no fuiste tú, contacta a soporte de inmediato." — no se sugiere «Olvidé mi contraseña»: el código iría al correo nuevo, que ya no es del dueño). **200** `{statusCode:200, token, usuario, message:"Correo actualizado"}`; el frontend reemplaza `authToken` y el usuario del contexto.

## Panel admin (sesión + autoridad ADMINISTRADOR, en `SecurityConfig` para `/api/admin/**`)
### PUT /api/admin/usuarios/{iduser}/rol `{idrol}`
- Sin sesión 401; no admin 403 "No tienes permiso para esta acción".
- `idrol` debe ser entero JSON 1 o 2 (`1.5`, `"1"`, `true`, ausente => **400** `idrol` "Rol no válido"). No existe => 404. Rol propio => 409 "No puedes cambiar tu propio rol".
- Mismo rol: **200** sin cambios.
- Degradar 1→2 dejando 0 administradores habilitados (`idrol=1` e `is_enabled=true`, filas bloqueadas en la transacción): **409** "No se puede quitar el último administrador".
- UPDATE condicionado al rol leído; 0 filas => 409 "El rol cambió mientras tanto, vuelve a intentarlo".
- Cambio real (en cualquier sentido): rol + `sesion_version+1` (sus sesiones mueren). Correo al afectado avisando el cambio de rol. Auditoría `rol_cambiado`. **200** `{statusCode:200, usuario, message:"Rol actualizado"}`.
- **Ya no existen** `GET /api/admin/recuperaciones` ni `/api/admin/recuperaciones/{id}/aprobar|rechazar`.

## Esquema
- V2–V6 ya se aplicaron a la base local de desarrollo: NO se editan ni se borran (regla del proyecto).
- **`V7__quitar_mfa_y_recuperacion.sql`** (la escribe base-de-datos) quita lo que ya no se usa:
  `DROP TABLE mfa_codigo_respaldo`, `DROP TABLE recuperacion_admin`, columnas `usuario.mfa_secret`, `usuario.mfa_enabled`,
  `usuario.reset_code_proposito` (con su CHECK). Se quedan: `sesion_version`, `correo_pendiente`, `correo_pendiente_codigo`,
  `correo_pendiente_expira`, índice único `uq_usuario_correo_lower`.
- Configuración: se quita `MFA_ENCRYPTION_KEY` / `app.mfa.encryption-key`.

## Frontend
- `Login.tsx`: un solo paso (correo + contraseña) → guarda `token` y entra. Sin pasos, sin `StepIndicator` de MFA, sin enlace "Recuperar acceso".
- Se borran `ActivarMFA.tsx` (`/activar-mfa`) y `SolicitudesRecuperacion.tsx` (`/admin/solicitudes-recuperacion`) con sus rutas y entrada del menú.
- `ForgotPassword`/`VerifyResetCode`/`ResetPassword`: sin modo `flujo="recuperar"`, sin rutas `/recuperar-acceso*`.
- Perfiles: "Cambiar contraseña" pide `currentPassword`, `newPassword`, `confirmPassword`; "Cambiar correo" paso 1 `newCorreo` + `currentPassword`, paso 2 `emailCode`. Ningún campo de código de Google Authenticator.

## Riesgos aceptados
Sin segundo factor: una contraseña robada da acceso a la cuenta (decisión del dueño). Avisos por correo best-effort; contadores en memoria (una sola instancia, se reinician con el servidor).
