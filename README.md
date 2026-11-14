# UrgentIA Frontend

Frontend de la mesa de ayuda con React, Vite y TypeScript. P6 implementa la base,
bandeja, detalle, reportes y notificaciones. P3 conecta login y sesión y completa
crear ticket, mis tickets y usuarios. La interfaz consume únicamente el gateway.

El alcance implementado, las pruebas y el reparto pendiente están en
[Implementación de P6](docs/P6_FRONTEND.md). El
[diagrama de componentes](docs/COMPONENTES.md) incluye el frontend y RabbitMQ.

## Ejecutar en desarrollo

Usar Node **22.20.0** y npm, desde la raíz de este repositorio:

```sh
npm ci
```

Crear la configuración local una sola vez:

```powershell
Copy-Item .env.example .env.local
```

En Bash, usar `cp .env.example .env.local`. Luego:

```sh
npm run dev
```

Abrir **http://localhost:5173**. El puerto es estricto para evitar cambiar de
origen sin aviso. El inicio funciona sin backend. Las pantallas privadas piden
sesión y solo consultan la API cuando P3 proporciona una sesión real.
El login todavía es un placeholder; no hay una sesión ficticia en producción.

Si PowerShell bloquea npm.ps1, usar `npm.cmd` con los mismos argumentos.

## Gateway y CORS

```dotenv
VITE_API_URL=http://localhost:8080
```

VITE_API_URL apunta al gateway, no a los microservicios. Reiniciar Vite después
de cambiar .env.local. Las variables VITE_* son públicas: no incluir contraseñas,
API keys, secretos JWT ni configuración de RabbitMQ.

El gateway permite por defecto **http://localhost:5173**, los métodos GET, POST
y PATCH, y los headers Authorization, Content-Type y X-Correlation-Id.
Expone X-Correlation-Id y responde al preflight OPTIONS sin pedir token.

Para usar otro puerto:

```sh
npm run dev -- --port 3000
```

Agregar el origen en el **.env del backend**, separado por coma, y recrear el gateway:

```dotenv
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

La URL de API sigue siendo http://localhost:8080 aunque cambie el puerto del front.
127.0.0.1 es otro origen: agregarlo si se usa en el navegador.
El preview en http://localhost:4173 también requiere autorización si consulta la API.

## Pantallas

Estas son rutas del navegador, no endpoints nuevos.

| Ruta               | Pantalla                                      | Responsable | Estado       |
| ------------------ | --------------------------------------------- | ----------- | ------------ |
| /                  | Inicio y navegación                           | P6          | Implementado |
| /login             | Login y sesión                                | P3          | Pendiente    |
| /tickets           | Bandeja con filtros y paginación              | P6          | Implementado |
| /tickets/:ticketId | Detalle, asignación, estado y reclasificación | P6          | Implementado |
| /reportes          | Resumen, SLA y listado                        | P6          | Implementado |
| /notificaciones    | Consulta y filtros                            | P6          | Implementado |
| /tickets/nuevo     | Crear ticket                                  | P3          | Pendiente    |
| /mis-tickets       | Tickets del solicitante                       | P3          | Pendiente    |
| /usuarios          | Alta y listado                                | P3          | Pendiente    |

Bandeja, detalle, reportes y notificaciones requieren AGENTE o ADMIN. Usuarios
requiere ADMIN. Mis tickets está reservado al SOLICITANTE; crear ticket admite
los tres roles. Los guards y el menú ya están preparados. El gateway conserva
la autorización real.

Los filtros se guardan en la URL. El detalle consulta cada cinco segundos
mientras el ticket siga pendiente de clasificación y la pestaña esté visible.
Los reportes muestran su fecha de generación y pueden demorar respecto de
la bandeja por el procesamiento de eventos.

## Integración para P3

App recibe la sesión controlada por el proveedor de autenticación de P3:

```tsx
<App
  sesion={sesion}
  onUnauthorized={cerrarSesion}
  onCerrarSesion={cerrarSesion}
/>
```

El tipo Sesion está en src/shared/api/types.ts y se deriva de LoginResponse.
Incluye accessToken y usuario. App ya contiene BrowserRouter.

P3 implementa la política de persistencia, el login y cerrarSesion. El callback
debe borrar su estado y almacenamiento y volver a /login. Un 403 se muestra como
error sin cerrar sesión. Para el login usar un cliente público sin callback
de sesión: las credenciales incorrectas se presentan en el formulario.

Las pantallas usan useServicios(), que obtiene automáticamente el cliente con
el token actual. No repartir tokens por las páginas ni crear un cliente separado
para cada pantalla. Reemplazar únicamente los placeholders de P3 en App.tsx.

Ver el detalle del contrato de integración en [P6_FRONTEND.md](docs/P6_FRONTEND.md).

## Contratos y tipos

Se copiaron sin modificar los contratos de tickets, usuarios, reportes y
notificaciones del backend en el commit 31bf44a. Los pulls de infraestructura
posteriores no cambiaron esos contratos. La procedencia completa y los hashes
están en contracts/source.json.

```sh
npm run api:generate:all
npm run api:check
```

Los tipos se versionan en src/shared/api/generated/. No editarlos a mano.
La verificación funciona sin tener clonado el backend ni usar internet.
Para incorporar un cambio, acordarlo en origen, actualizar la copia y su
procedencia y regenerar. No inventar campos ni endpoints para completar una UI.

El contrato actual de tickets sigue describiendo creación sincrónica. La
interfaz admite clasificación y prioridad nulas; no presupone que la migración
de productores y consumidores a RabbitMQ esté terminada.

## Comandos y pruebas

| Comando              | Función                                            |
| -------------------- | -------------------------------------------------- |
| npm run dev          | Servidor de desarrollo en 5173                     |
| npm run build        | Tipos de aplicación y pruebas, y build en dist     |
| npm run preview      | Revisar el build en 4173                           |
| npm run typecheck    | Comprobar TypeScript                               |
| npm run lint         | Revisar código                                     |
| npm run format       | Aplicar formato                                    |
| npm run format:check | Comprobar formato                                  |
| npm test             | 11 tests unitarios de cliente HTTP, acciones y SLA |
| npm run check        | Formato, lint, tests unitarios y build             |
| npm run api:check    | Verificar contratos y tipos generados              |
| npm run test:e2e     | 10 flujos de navegador de P6                       |

Para las pruebas de navegador:

```sh
npx playwright install chromium
npm run test:e2e
```

En Windows se puede usar Edge instalado:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'msedge'
npm run test:e2e
```

Playwright usa el puerto **5175 solo para sus pruebas** y respuestas interceptadas
basadas en los contratos; no necesita CORS para ese origen ni se conecta al
backend real. El harness y sus datos están en tests y no se incluyen en dist.
Las pruebas con fixtures no sustituyen la integración final con login y datos reales.

## Despliegue local con Docker

Con Docker Desktop iniciado, desde este repo:

```sh
docker compose up -d --build --wait
```

Abrir **http://localhost:5173**. Detener Vite si ya ocupa ese puerto.
El contenedor sirve el build con Nginx, incluye healthcheck en /health y
devuelve index.html al abrir directamente rutas como /reportes.

Compose usa VITE_API_URL del entorno o de un archivo **.env de este repo**,
con http://localhost:8080 como valor por defecto. Vite en desarrollo usa
.env.local. Si cambia la URL pública del gateway, reconstruir la imagen:
la variable se incorpora al compilar.

Se puede cambiar FRONTEND_PORT en el entorno de Compose y autorizar el nuevo
origen en CORS_ALLOWED_ORIGINS del backend. El servidor de preview de Vite no se
usa para producción.

El backend se levanta desde su propio repo. Su .env debe incluir RABBITMQ_USER y
RABBITMQ_PASSWORD según la sección 14 de su contexto; después se ejecuta
`docker compose up -d --build --wait` allí. Esas variables no van en este front.

## Estructura y CI

```text
contracts/                 Contratos aprobados y procedencia
scripts/                   Generación y comprobación de tipos
src/app/                   Rutas, navegación y layout
src/features/tickets/      Bandeja, detalle y acciones
src/features/reportes/     Resumen, SLA y listado
src/features/notificaciones/ Consulta de avisos
src/shared/api/            Cliente HTTP, servicios y tipos
src/shared/session/        Entrada de sesión de P3 y guards
src/shared/hooks/          Consultas cancelables y filtros
src/shared/ui/             Estados visuales y componentes comunes
tests/e2e/                 Pruebas de flujos con fixtures
docs/                      Arquitectura, implementación y entrega
```

El CI verifica formato, lint, contratos, tests, build, navegador y construcción
de la imagen con apertura directa de una ruta SPA. No necesita el backend ni
secretos. Su ejecución remota se confirma cuando se publique la rama.

La primera integración reúne chore/frontend-base y feat/frontend-p6 en
dev/entrega-2, por indicación del responsable del repositorio. Las próximas tareas
vuelven por PR con merge commit, sin squash. Los commits son chicos y usan
Conventional Commits en español. main conserva la versión estable.

## Referencias técnicas

- [Vite](https://vite.dev/guide/)
- [React Router](https://reactrouter.com/start/declarative/installation)
- [OpenAPI TypeScript](https://openapi-ts.dev/node)
- [Playwright](https://playwright.dev/docs/test-webserver)
- [Docker y React](https://docs.docker.com/guides/reactjs/)
