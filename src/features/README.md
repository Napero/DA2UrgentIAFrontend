# Funcionalidades

Crear cada funcionalidad en su propia carpeta al implementarla:

- `auth/`: login y sesión (P3).
- `tickets/`: bandeja y detalle (P6); crear ticket y mis tickets (P3).
- `reportes/`: resumen, SLA y listado (P6).
- `notificaciones/`: consulta de notificaciones (P6).
- `usuarios/`: alta y listado (P3).

Las páginas específicas pueden vivir dentro de cada carpeta. Reemplazar su
placeholder en `src/app/App.tsx`; no mantener dos implementaciones de una pantalla.

El layout y la navegación están en `src/app/`. El cliente HTTP, los tipos
generados y los estados visuales reutilizables están en `src/shared/`.
No crear modelos de endpoints manualmente: usar los contratos aprobados.
