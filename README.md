# UrgentIA Frontend

Frontend de la mesa de ayuda UrgentIA, desarrollado con React, Vite y TypeScript.
Esta base incluye navegación, layout adaptable, estados visuales compartidos y
un cliente HTTP para integrar los servicios a través del API Gateway.

## Ejecutar localmente

Usar Node.js **22.20.0** (indicado en `.nvmrc`) y npm. Desde la raíz de este repo:

```sh
npm ci
```

Copiar la configuración de ejemplo. En PowerShell:

```powershell
Copy-Item .env.example .env.local
```

En Bash:

```sh
cp .env.example .env.local
```

Luego iniciar Vite:

```sh
npm run dev
```

Abrir **http://localhost:5173**. Este es el origen habilitado por defecto en el
gateway. Vite usa puerto estricto para evitar cambiar de origen sin aviso.
Si está ocupado, detener la otra instancia o usar otro puerto como se explica abajo.

La base visual funciona con el backend apagado. Las pantallas de negocio todavía
son placeholders explícitos; no se simulan sesiones, tickets ni métricas.

## Configuración del gateway

```dotenv
VITE_API_URL=http://localhost:8080
```

La URL debe apuntar al **gateway**, nunca a un microservicio individual. Reiniciar
Vite después de cambiar `.env.local`. Las variables `VITE_*` son públicas y se
incorporan al bundle: no incluir contraseñas, secretos JWT ni API keys.

P1 integró CORS en `dev/entrega-2` del backend, commit `31bf44a`. El gateway
habilita `http://localhost:5173` por defecto, los métodos `GET`, `POST` y `PATCH`,
y los headers `Authorization`, `Content-Type` y `X-Correlation-Id`. Expone
`X-Correlation-Id` y atiende el preflight `OPTIONS` sin pedir token.

Para usar otro puerto no hace falta cambiar código. Por ejemplo:

```sh
npm run dev -- --port 3000
```

Agregar el origen en el **`.env` del backend**, separado por coma:

```dotenv
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

Recrear el gateway para que tome el cambio de entorno. `CORS_ALLOWED_ORIGINS`
pertenece al gateway; no va en el `.env.local` del frontend. `VITE_API_URL` sigue
siendo `http://localhost:8080` aunque el front cambie de puerto.

Usar `http://localhost:5173` para el desarrollo habitual. `127.0.0.1` es otro
origen: si se usa en el navegador, hay que agregarlo a la lista. Para probar
peticiones desde `npm run preview`, agregar también `http://localhost:4173`.

## Comandos

| Comando                                      | Función                                             |
| -------------------------------------------- | --------------------------------------------------- |
| `npm run dev`                                | Iniciar el servidor de desarrollo en el puerto 5173 |
| `npm run build`                              | Verificar tipos y producir `dist/`                  |
| `npm run preview`                            | Revisar el build en http://localhost:4173           |
| `npm run typecheck`                          | Verificar TypeScript                                |
| `npm run lint`                               | Revisar el código con ESLint                        |
| `npm run format`                             | Aplicar formato con Prettier                        |
| `npm run format:check`                       | Comprobar el formato sin modificar archivos         |
| `npm test`                                   | Probar el cliente HTTP con el runner de Node        |
| `npm run check`                              | Ejecutar formato, lint, tests y build               |
| `npm run api:generate -- <archivo> <nombre>` | Generar tipos desde un contrato aprobado            |

Si PowerShell bloquea `npm.ps1`, usar `npm.cmd` con los mismos argumentos.
`vite preview` sirve para verificar el build, no para desplegar en producción.

## Estructura

```text
.github/workflows/ci.yml     Validaciones en push y PR
docs/BASE_FRONTEND.md        Decisiones y explicación de los cuatro bloques
scripts/                    Generación de tipos
src/
  app/
    App.tsx                 Rutas y composición de la aplicación
    navigation.ts           Secciones y menú
    layout/                 Layout y estilos compartidos
  features/                 Funcionalidades a implementar por P3 y P6
  pages/                    Inicio, placeholders, login pendiente y 404
  shared/
    api/                    Cliente, errores y tests
      generated/            Tipos generados de OpenAPI
    ui/                     Iconos y estados de carga, vacío y error
```

## Pantallas y reparto

Las rutas de esta tabla son **rutas del navegador**, no nuevos endpoints del backend.

| Ruta                 | Pantalla                   | Responsable | Estado      |
| -------------------- | -------------------------- | ----------- | ----------- |
| `/`                  | Inicio                     | P6          | Base visual |
| `/login`             | Login y sesión             | P3          | Placeholder |
| `/tickets`           | Bandeja                    | P6          | Placeholder |
| `/tickets/nuevo`     | Crear ticket               | P3          | Placeholder |
| `/mis-tickets`       | Tickets del solicitante    | P3          | Placeholder |
| `/tickets/:ticketId` | Detalle y acciones         | P6          | Placeholder |
| `/reportes`          | Resumen, SLA y listado     | P6          | Placeholder |
| `/notificaciones`    | Notificaciones             | P6          | Placeholder |
| `/usuarios`          | Alta y listado de usuarios | P3          | Placeholder |

P3 debe agregar las protecciones por rol y filtrar el menú al conectar la sesión.
Por ahora todas las rutas muestran contenido estático público. No hay operaciones
ni datos reales expuestos por estas páginas.

## Integración de sesión para P3

Crear una instancia compartida del cliente desde el proveedor de sesión:

```ts
import { createApiClient } from './shared/api'

// leerTokenActual y cerrarSesion pertenecen a la implementación de sesión de P3.
const api = createApiClient({
  getAccessToken: leerTokenActual,
  onUnauthorized: cerrarSesion,
})
```

`getAccessToken` se consulta en cada petición. El cliente no decide dónde guardar
el token. `onUnauthorized` se invoca ante un 401; P3 debe limpiar la sesión y
redirigir al login. Un 403 conserva la sesión y se presenta como falta de permiso.

`api.request<T>(ruta, opciones)` acepta método HTTP, body JSON, headers, query y
AbortSignal. El tipo `T` debe provenir del contrato generado. No se reintentan
peticiones automáticamente, para evitar duplicar escrituras.

Los errores se exponen como `ApiError`: tipo de falla, status HTTP y, cuando el
backend los devuelve, `codigo`, `detalles` y `correlationId`. El mensaje está en
`error.message`. El timeout del cliente es de 15 segundos y se puede configurar
al crearlo. Los componentes visuales no muestran stacktraces.

## Contratos y tipos

Todavía no hay contratos OpenAPI incorporados en este repo ni modelos manuales
de tickets o usuarios. Cuando se acuerde una versión de los contratos, copiar
los originales aprobados y sus referencias a este repo, preservando la estructura,
y registrar su repositorio y commit de origen.

Ejemplo, **una vez disponible** el contrato indicado:

```sh
npm run api:generate -- ./contracts/reporting-service.yaml reporting
```

Se crea `src/shared/api/generated/reporting.d.ts`. El generador solo lee el archivo
que se le pasa; no busca ni modifica el repo del backend. Versionar los tipos y
el contrato correspondiente juntos. No editar los tipos generados a mano ni
inventar endpoints para completar pantallas.

## Componentes compartidos

- `EstadoCarga`: mensaje de carga y anuncio accesible con `role="status"`.
- `EstadoVacio`: título, descripción, icono y acción opcional.
- `EstadoError`: mensaje de falla y callback opcional para reintentar.
- `Icono`: iconos vectoriales decorativos con nombres compartidos.

El layout tiene navegación por teclado, enlace para saltar al contenido y menú
plegable en móvil. Los estilos respetan la preferencia de movimiento reducido.

## CI y flujo de ramas

El workflow ejecuta `npm ci`, formato, lint, tests y build sin depender del backend
ni de secretos. Se activa en push y en PR hacia `main` o `dev/entrega-2`.
La ejecución remota se verifica después de publicar; mientras tanto se usa
`npm run check` localmente.

Las tareas salen de `dev/entrega-2` y vuelven por PR con merge commit, sin squash.
Usar commits chicos, en una línea, con Conventional Commits en español.
La configuración inicial está en `chore/frontend-base`.

## Pendientes de integración y despliegue

- Incorporar los contratos aprobados y generar sus tipos.
- Login, sesión y rutas por rol de P3.
- Implementación de las pantallas de negocio y consulta periódica de tickets pendientes.
- Dockerfile y configuración SPA del servidor con P1. El servidor debe devolver
  `index.html` al abrir directamente rutas como `/reportes` o `/tickets/:ticketId`.
- `VITE_API_URL` se configura al compilar; el despliegue debe proporcionar la URL
  pública del gateway, accesible desde el navegador.

## Referencias técnicas

- [Vite: instalación y configuración](https://vite.dev/guide/)
- [React Router: modo declarativo](https://reactrouter.com/start/declarative/installation)
- [OpenAPI TypeScript: generación con Node](https://openapi-ts.dev/node)
- [GitHub Actions: proyectos Node](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs)
