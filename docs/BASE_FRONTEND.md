# Base del frontend

Esta rama prepara el trabajo de P6 y P3 sin requerir cambios de P1.
Se puede instalar, navegar y compilar con el backend apagado.

## Primer bloque

Se configuraron React, Vite y TypeScript con comprobaciones estrictas.
ESLint detecta errores de código; Prettier mantiene un formato común.
El lockfile permite repetir la instalación con `npm ci`.
La aplicación usa Node 22.20.0, que ya está instalado en el entorno de desarrollo.

## Segundo bloque

Se agregó React Router, el layout y una página de inicio adaptable.
El menú se pliega en pantallas pequeñas. Las rutas tienen placeholders explícitos
y hay una página 404 para direcciones desconocidas.
Se prepararon los componentes EstadoCarga, EstadoVacio y EstadoError.

Esta base todavía no tiene autenticación ni autorización. La navegación visible
no representa permisos. P3 debe conectar la sesión, proteger las rutas y filtrar
el menú según el rol antes de integrar operaciones reales.

## Tercer bloque

El cliente HTTP centraliza JSON, query parameters, Authorization y correlationId.
Lee el token mediante un callback en cada petición para no conservar una sesión
obsoleta. Un 401 avisa al callback de P3; un 403 conserva la sesión.
Los errores del backend preservan codigo, mensaje, detalles y correlationId.

La UI inicial no instancia el cliente ni hace peticiones.
No hay endpoints ni datos de tickets inventados.
Se probaron éxito, errores comunes, 401, 403, respuestas vacías, JSON inválido,
red, timeout, cancelación y rechazo de rutas con otra URL.
No se reintentan escrituras automáticamente.

## Cuarto bloque

Se agregó CI para ejecutar las mismas validaciones de desarrollo.
El generador de tipos recibe un contrato OpenAPI explícito; no accede
automáticamente a otro repositorio. Los tipos de endpoints se generan cuando se
disponga de los contratos aprobados.

El README incluye instalación, comandos, estructura y puntos de integración
para P3. El CI se ejecutará en GitHub cuando se publique la rama; la validación
local no equivale a una ejecución remota del workflow.

## Ajuste de dependencias

La instalación inicial detectó la alerta
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)
en minimatch, una dependencia de las herramientas de lint.
Se agregó un override acotado a `@typescript-eslint/typescript-estree` para usar
minimatch 11.0.8. El ajuste queda en un commit separado de la funcionalidad.
Al actualizar typescript-eslint, revisar si ya incluye una versión corregida y
se puede retirar el override. La corrección se verifica con lint, tests, build
y `npm audit`.

## Configuración acordada con P1

CORS ya está integrado en `dev/entrega-2` del backend, commit `31bf44a`.
El frontend usa `http://localhost:5173` y `VITE_API_URL=http://localhost:8080`.
El gateway permite los headers del cliente HTTP y atiende el preflight sin token.

Otros orígenes se agregan a `CORS_ALLOWED_ORIGINS` en el `.env` del backend,
separados por coma, sin modificar código. Usar `127.0.0.1` o el puerto de preview
requiere agregarlos explícitamente. La URL del gateway no cambia con el puerto
del frontend.

## Siguiente integración

1. Se incorporan los contratos aprobados y se generan sus tipos.
2. P3 conecta login, sesión y protección de rutas con el cliente HTTP.
3. P6 reemplaza los placeholders por bandeja, detalle y reportes.
4. Se verifica el recorrido real contra el gateway, incluido el ticket pendiente
   de clasificación.

Se trabaja con PR hacia `dev/entrega-2`, merge commit y sin squash.
Esta entrega de base queda en commits locales; no se publica ni integra sola.
