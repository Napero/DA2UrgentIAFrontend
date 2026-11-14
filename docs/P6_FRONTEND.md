# Implementación y entrega del frontend de P6

La rama `feat/frontend-p6` contiene las pantallas de P6 y se apoya en
`chore/frontend-base`. El destino de integración es `dev/entrega-2`.
La primera integración reúne ambas ramas con merge commits por indicación de
Francisco. Publicar código no equivale a desplegarlo ni a confirmar el CI remoto.

## Qué está implementado

| Parte                 | Archivos                                         | Comportamiento                                                                                       |
| --------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Contratos             | `contracts/`, `scripts/api-contracts.mjs`        | Copia aprobada, procedencia con commit y hashes, generación y verificación de tipos                  |
| Integración de sesión | `src/shared/session/`                            | Recibe sesión de P3, conecta token y callback de 401, protege rutas y filtra el menú por rol         |
| Bandeja               | `src/features/tickets/BandejaPage.tsx`           | Filtros por estado, prioridad y categoría en la URL; paginación, tamaño de página y actualización    |
| Detalle               | `src/features/tickets/DetallePage.tsx`           | Consulta, clasificación, SLA, asignación a agentes activos, transiciones de estado y reclasificación |
| Tickets pendientes    | `DetallePage.tsx`                                | Consulta cada cinco segundos solo mientras el ticket está pendiente y la pestaña visible             |
| Reportes              | `src/features/reportes/`                         | Resumen y distribuciones, vencidos y cumplimiento por prioridad, listado filtrado y paginado         |
| Notificaciones        | `src/features/notificaciones/`                   | Consulta, filtros por ticket y destinatario, paginación, estado de envío y enlace al ticket          |
| Despliegue            | `Dockerfile`, `nginx.conf`, `docker-compose.yml` | Build configurable, servidor estático y fallback de rutas SPA                                        |
| Validación            | `tests/e2e/`, `*.test.ts`, CI                    | 11 pruebas unitarias y 10 de navegador contra fixtures de contrato                                   |

La interfaz no calcula una prioridad ni modifica el SLA. Ofrece únicamente las
acciones de la sección 8.4 del contexto; el backend sigue validando las reglas.
No hay reintentos automáticos de escrituras. Un error no se presenta como éxito.

Las consultas cancelan la petición al cambiar de pantalla o filtros y descartan
resultados anteriores. Al cambiar la sesión tampoco se conserva una respuesta
del cliente previo como si perteneciera al usuario nuevo.

## Conexión para P3

El punto de entrada ya acepta:

```tsx
<App
  sesion={sesion}
  onUnauthorized={cerrarSesion}
  onCerrarSesion={cerrarSesion}
/>
```

`sesion` es `Sesion | null`, exportado desde `src/shared/api/types.ts`.
Contiene `accessToken` y `usuario` del LoginResponse generado. También puede
pasarse el LoginResponse completo. `App` ya contiene BrowserRouter; no agregar
un segundo router alrededor.

P3 debe:

1. Implementar login y la política de almacenamiento y recuperación de sesión
   en un proveedor propio que envuelva a App.
2. Pasar la sesión actual a App. No modificar las pantallas de P6 para repartir
   tokens ni crear un segundo cliente para ellas.
3. En cerrarSesion, limpiar el almacenamiento elegido, limpiar la sesión y
   navegar al login. Ese mismo callback atiende los 401.
4. Reemplazar LoginPage y los placeholders de crear ticket, mis tickets y usuarios.
   El enlace del guard conserva `location.state.volverA` para el retorno tras login.
5. Usar un cliente público sin callback de sesión para el POST de login:
   un 401 de credenciales incorrectas debe mostrarse en el formulario, sin entrar
   en un ciclo de redirecciones.
6. Mantener estable la referencia a sesión y callbacks cuando no cambian, para
   no reiniciar consultas por renders ajenos a la sesión.

El menú y los guards ya distinguen SOLICITANTE, AGENTE y ADMIN. Son controles de
interfaz; el gateway continúa aplicando la autorización real.
Sin sesión no se hacen consultas privadas y se ofrece iniciar sesión.
El login todavía es un placeholder: abrir la aplicación normal no inventa una
cuenta ni permite entrar con el token ficticio de las pruebas.

## Pruebas y alcance de la evidencia

`npm run check` comprueba formato, lint, tests unitarios, TypeScript y build.
`npm run api:check` verifica los contratos y los archivos generados.
`npm run test:e2e` verifica los flujos en Chromium; en Windows se puede usar
Edge con `$env:PLAYWRIGHT_CHANNEL='msedge'`.

Las pruebas de navegador interceptan las llamadas al gateway y verifican
consultas, filtros, cuerpos de las escrituras, 401/403, 409, IA caída, resultados
vacíos y el seguimiento de tickets pendientes. El harness y sus tokens ficticios
viven solo en tests y no se incluyen en dist. No reemplazan la prueba final con
login real, bases y eventos reales.

También se construyó y levantó la imagen local del frontend con Nginx. Su
healthcheck y la apertura directa de /reportes y /tickets/ejemplo respondieron
200; nginx -t validó la configuración. La imagen final contiene solo archivos
estáticos, sin el harness ni los fixtures.

El backend bbc94d7 se levantó desde Compose con sus nueve servicios sanos,
incluido RabbitMQ. Se verificó el cliente HTTP contra el gateway real: login
ADMIN, consulta de tickets, dos agentes activos, resumen, SLA y notificaciones,
y preflight PATCH desde http://localhost:5173. La base local estaba vacía de
tickets y notificaciones; la prueba fue de lectura y no creó datos de negocio.
Esta evidencia confirma la conexión real, pero aún falta el recorrido completo
desde las pantallas con el login de P3.

Se revisaron las cuatro pantallas en escritorio y móvil, con anchos de 320,
390, 768, 1024 y 1440 píxeles, sin errores JavaScript ni desborde horizontal.

## Quién queda destrabado

| Persona            | Qué puede hacer con esta rama                                                                          | Qué necesita antes                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| P3, Florencia      | Login, sesión, crear ticket, mis tickets y usuarios sobre el layout, contratos y servicios compartidos | Actualizar su copia desde dev/entrega-2               |
| P1, Ana            | Integrar el despliegue del frontend y revisar CORS con el origen definitivo                            | URL pública del gateway para el build                 |
| P4, Gustavo        | Incorporar el diagrama de componentes y las pantallas al informe                                       | Capturas definitivas del flujo real                   |
| P5, Juan Sebastián | Verificar que sus notificaciones aparecen en la pantalla y confirmar el proveedor real                 | Datos reales, login conectado y backend operativo     |
| P2, Santiago       | Validar las acciones del detalle y la transición al flujo asincrónico                                  | Datos reales y contrato actualizado si cambia el POST |

## Qué falta para cerrar la entrega

- Revisar el CI remoto y mantener las próximas tareas en ramas con PR hacia
  dev/entrega-2, conservando merge commits sin squash.
- Completar las pantallas y la sesión de P3.
- Probar desde el navegador el recorrido real: login, crear, clasificar, asignar,
  resolver, notificar y consultar reportes.
- Repetir ese recorrido con mensajería real cuando P2/P4/P5 terminen productores,
  consumidores y topología. Que RabbitMQ arranque no demuestra que ese flujo ya
  esté migrado.
- El consumidor RabbitMQ de reporting sigue siendo una tarea del roadmap de P6
  en el backend. No se implementó porque el alcance acordado es el frontend y
  se pidió no modificar código del backend. Además requiere los nombres de
  exchange, cola, routing keys y política de reintentos de contracts/messaging/.
- Grabar la parte de P6 del video y acordar con P4 las capturas del informe.

No hay una dependencia pendiente de CORS para desarrollar las pantallas.
La dependencia funcional inmediata para el uso normal es la sesión de P3.
