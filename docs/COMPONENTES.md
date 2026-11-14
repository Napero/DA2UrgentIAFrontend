# Componentes e integración

El navegador usa exclusivamente el gateway. Los reportes se leen desde su
proyección, sin consultar bases de tickets ni conectarse a RabbitMQ.

```mermaid
flowchart LR
  U[Solicitante o soporte] --> F[React y Vite<br/>P3 y P6]
  F -->|REST y JWT<br/>VITE_API_URL| G[API Gateway<br/>CORS y roles]
  G --> US[user-service<br/>Login y usuarios]
  G --> TS[ticket-service<br/>Tickets y reglas]
  G --> RS[reporting-service<br/>Reportes y SLA]
  G --> NS[notification-service<br/>Consulta de avisos]
  TS -->|REST actual| CS[classification-service<br/>IA]
  TS -->|Eventos HTTP actuales| RS
  TS -->|Eventos HTTP actuales| NS
  R[(RabbitMQ<br/>Infraestructura disponible)]
  TS -. Migración pendiente .-> R
  CS -. Migración pendiente .-> R
  R -. Consumidor pendiente .-> RS
  R -. Consumidor pendiente .-> NS
  US --> PGU[(users_db)]
  TS --> PGT[(tickets_db)]
  RS --> MGR[(reporting_db)]
  NS --> MGN[(notifications_db)]
  CS --> MGC[(classification_db)]
```

Las líneas discontinuas son trabajo pendiente de integración de la entrega 2,
no funciones confirmadas por este frontend. El backend revisado está en
`dev/entrega-2`, commit `bbc94d7`: contiene RabbitMQ y sus dependencias de
arranque, mientras los contratos REST copiados siguen siendo los de
`31bf44a` y no cambiaron con ese pull.

RabbitMQ y sus credenciales permanecen en la red del backend. El frontend nunca
recibe RABBITMQ_URL, RABBITMQ_PASSWORD ni el secreto de firma JWT.
