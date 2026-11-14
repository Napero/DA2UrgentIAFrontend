// Generado desde OpenAPI. No editar a mano.
export interface paths {
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Health
         * @description Indica que el servicio está levantado.
         */
        get: operations["health_health_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/eventos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Recibir Evento
         * @description Recibe un evento de ticket-service (solo red interna). Es idempotente por eventId:
         *     responde PROCESADO, DUPLICADO o IGNORADO.
         */
        post: operations["recibir_evento_api_eventos_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/notificaciones": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar Notificaciones
         * @description Lista notificaciones, de la más nueva a la más vieja, filtrando por ticket y/o destinatario.
         */
        get: operations["listar_notificaciones_api_notificaciones_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/notificaciones/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Obtener Notificacion
         * @description Devuelve una notificación por id.
         */
        get: operations["obtener_notificacion_api_notificaciones__id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /**
         * CanalNotificacion
         * @enum {string}
         */
        CanalNotificacion: "EMAIL_SIMULADO" | "INTERNA";
        /**
         * Categoria
         * @enum {string}
         */
        Categoria: "INCIDENTE" | "SOLICITUD" | "CONSULTA" | "BUG";
        /**
         * EstadoNotificacion
         * @enum {string}
         */
        EstadoNotificacion: "ENVIADA" | "FALLIDA";
        /**
         * EstadoTicket
         * @enum {string}
         */
        EstadoTicket: "NUEVO" | "PENDIENTE_CLASIFICACION" | "CLASIFICADO" | "ASIGNADO" | "EN_CURSO" | "ESCALADO" | "RESUELTO" | "CERRADO";
        /**
         * InputEvento
         * @description Sobre del evento. Un eventType fuera del enum responde 400, como pide el contrato.
         * @example {
         *       "correlationId": "a8e1b2c3-0000-4000-8000-000000000001",
         *       "eventId": "3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
         *       "eventType": "TicketEscalado",
         *       "occurredAt": "2026-10-05T14:03:12Z",
         *       "payload": {
         *         "estadoAnterior": "CLASIFICADO",
         *         "motivo": "Prioridad P1",
         *         "ticket": {
         *           "categoria": "INCIDENTE",
         *           "estado": "ESCALADO",
         *           "fechaCreacion": "2026-10-05T14:03:10Z",
         *           "fechaLimiteSla": "2026-10-05T15:03:11Z",
         *           "moduloAfectado": "AUTENTICACION",
         *           "prioridad": "P1",
         *           "solicitanteId": "b1c2d3e4-0000-4000-8000-000000000004",
         *           "ticketId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
         *           "titulo": "No puede ingresar nadie"
         *         }
         *       },
         *       "source": "ticket-service",
         *       "version": 1
         *     }
         */
        InputEvento: {
            /**
             * Eventid
             * Format: uuid
             */
            eventId: string;
            eventType: components["schemas"]["TipoEvento"];
            /** Version */
            version: number;
            /**
             * Occurredat
             * Format: date-time
             */
            occurredAt: string;
            /** Correlationid */
            correlationId: string;
            /** Source */
            source: string;
            payload: components["schemas"]["InputPayload"];
        };
        /** InputPayload */
        InputPayload: {
            ticket: components["schemas"]["InputTicket"];
            estadoAnterior?: components["schemas"]["EstadoTicket"] | null;
            /** Motivo */
            motivo?: string | null;
        };
        /**
         * InputTicket
         * @description Foto del ticket despues del cambio. No trae la descripcion.
         */
        InputTicket: {
            /**
             * Ticketid
             * Format: uuid
             */
            ticketId: string;
            /** Titulo */
            titulo: string;
            estado: components["schemas"]["EstadoTicket"];
            prioridad?: components["schemas"]["Prioridad"] | null;
            categoria?: components["schemas"]["Categoria"] | null;
            moduloAfectado?: components["schemas"]["ModuloAfectado"] | null;
            /**
             * Solicitanteid
             * Format: uuid
             */
            solicitanteId: string;
            /** Agenteasignadoid */
            agenteAsignadoId?: string | null;
            /**
             * Fechacreacion
             * Format: date-time
             */
            fechaCreacion: string;
            /** Fechalimitesla */
            fechaLimiteSla?: string | null;
        };
        /**
         * ModuloAfectado
         * @enum {string}
         */
        ModuloAfectado: "AUTENTICACION" | "FACTURACION" | "PAGOS" | "REPORTES" | "INFRAESTRUCTURA" | "BASE_DE_DATOS" | "INTEGRACIONES" | "OTRO";
        /** OutputDetalleError */
        OutputDetalleError: {
            /**
             * Campo
             * @example payload.ticket.titulo
             */
            campo: string;
            /**
             * Mensaje
             * @example Field required
             */
            mensaje: string;
        };
        /** OutputError */
        OutputError: {
            /**
             * Codigo
             * @example VALIDACION
             */
            codigo: string;
            /**
             * Mensaje
             * @example La solicitud no es válida
             */
            mensaje: string;
            /** Detalles */
            detalles?: components["schemas"]["OutputDetalleError"][] | null;
            /**
             * Timestamp
             * @example 2026-10-05T14:03:11Z
             */
            timestamp: string;
            /**
             * Path
             * @example /api/eventos
             */
            path: string;
            /**
             * Correlationid
             * @example a8e1b2c3-0000-4000-8000-000000000001
             */
            correlationId?: string | null;
        };
        /** OutputEventoRecibido */
        OutputEventoRecibido: {
            /**
             * Eventid
             * Format: uuid
             * @example 3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d
             */
            eventId: string;
            resultado: components["schemas"]["ResultadoEvento"];
        };
        /** OutputHealth */
        OutputHealth: {
            /**
             * Status
             * @example UP
             */
            status: string;
            /**
             * Service
             * @example notification-service
             */
            service: string;
            /**
             * Version
             * @example 0.1.0
             */
            version: string;
        };
        /** OutputNotificacion */
        OutputNotificacion: {
            /**
             * Id
             * @example 66f7c3b2e4b0a1b2c3d4e5f7
             */
            id: string;
            /**
             * Eventid
             * @example 3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d
             */
            eventId: string;
            /**
             * Ticketid
             * @example 7c9e6679-7425-40de-944b-e07fc1f90ae7
             */
            ticketId: string;
            tipoEvento: components["schemas"]["TipoEvento"];
            /**
             * Destinatario
             * @example GRUPO:GUARDIA
             */
            destinatario: string;
            canal: components["schemas"]["CanalNotificacion"];
            /**
             * Asunto
             * @example [P1] Ticket escalado: No puede ingresar nadie
             */
            asunto: string;
            /**
             * Mensaje
             * @example El ticket fue escalado. Motivo: Prioridad P1. SLA: 2026-10-05T15:03:11Z
             */
            mensaje: string;
            estado: components["schemas"]["EstadoNotificacion"];
            /**
             * Fecha
             * @example 2026-10-05T14:03:12Z
             */
            fecha: string;
        };
        /** OutputPagination[OutputNotificacion] */
        OutputPagination_OutputNotificacion_: {
            /** Content */
            content: components["schemas"]["OutputNotificacion"][];
            /**
             * Page
             * @example 0
             */
            page: number;
            /**
             * Size
             * @example 20
             */
            size: number;
            /**
             * Totalelements
             * @example 1
             */
            totalElements: number;
            /**
             * Totalpages
             * @example 1
             */
            totalPages: number;
        };
        /**
         * Prioridad
         * @enum {string}
         */
        Prioridad: "P1" | "P2" | "P3" | "P4";
        /**
         * ResultadoEvento
         * @enum {string}
         */
        ResultadoEvento: "PROCESADO" | "DUPLICADO" | "IGNORADO";
        /**
         * TipoEvento
         * @enum {string}
         */
        TipoEvento: "TicketCreado" | "TicketClasificado" | "TicketEscalado" | "TicketAsignado" | "TicketEstadoCambiado" | "TicketResuelto";
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    health_health_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OutputHealth"];
                };
            };
        };
    };
    recibir_evento_api_eventos_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["InputEvento"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OutputEventoRecibido"];
                };
            };
            /** @description El sobre no cumple el esquema */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OutputError"];
                };
            };
        };
    };
    listar_notificaciones_api_notificaciones_get: {
        parameters: {
            query?: {
                /** @description Página, desde 0 */
                page?: number;
                /** @description Tamaño de página (máximo 100) */
                size?: number;
                /** @description Filtra por ticket */
                ticketId?: string | null;
                /** @description GRUPO:GUARDIA o USUARIO:{uuid} */
                destinatario?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OutputPagination_OutputNotificacion_"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OutputError"];
                };
            };
        };
    };
    obtener_notificacion_api_notificaciones__id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OutputNotificacion"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OutputError"];
                };
            };
        };
    };
}
