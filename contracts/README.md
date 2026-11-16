# Contratos usados por el frontend

Son copias sin modificaciones de los contratos aprobados de
[DA2UrgentIABackend](https://github.com/AVFare/DA2UrgentIABackend), rama
`dev/entrega-2`, commit `31bf44a`. El commit completo y los hashes SHA-256
normalizados a LF están en `source.json`.

No editar estos contratos para adaptar la interfaz. Los cambios se acuerdan
en el repositorio de origen y después se actualiza la copia, la procedencia y
los tipos con `npm run api:generate:all`.

`npm run api:check` verifica las copias y que los tipos estén actualizados sin
necesitar acceso al backend ni a internet.

El contrato actual de tickets es sincrónico. La interfaz admite prioridad y
clasificación nulas y actualiza los tickets pendientes; no presupone que el
cambio a RabbitMQ ya esté implementado.
