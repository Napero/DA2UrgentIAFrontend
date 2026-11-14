// Generado desde OpenAPI. No editar a mano.
export interface paths {
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
         * Proyectar un evento de ticket (solo red interna)
         * @description Idempotencia por eventId. Los eventos antiguos se registran pero no sobrescriben ticket_view. Un fallo devuelve 500 y permite reintentar. No publicar esta ruta en el gateway.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["EventoDto"];
                };
            };
            responses: {
                /** @description Procesado o duplicado */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ResultadoEventoDto"];
                    };
                };
                /** @description Sobre invalido */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorDto"];
                    };
                };
                /** @description Error interno; reintentar */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorDto"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/reportes/resumen": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Totales y distribuciones de tickets */
        get: {
            parameters: {
                query?: never;
                header?: {
                    "X-Correlation-Id"?: string;
                };
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Consulta exitosa */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ResumenDto"];
                    };
                };
                /** @description Parametros invalidos */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorDto"];
                    };
                };
                /** @description Error interno */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/reportes/sla": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Tickets vencidos y cumplimiento por prioridad */
        get: {
            parameters: {
                query?: never;
                header?: {
                    "X-Correlation-Id"?: string;
                };
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Consulta exitosa */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SlaDto"];
                    };
                };
                /** @description Parametros invalidos */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorDto"];
                    };
                };
                /** @description Error interno */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/reportes/tickets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Vista de tickets filtrada y paginada */
        get: {
            parameters: {
                query?: {
                    prioridad?: "P1" | "P2" | "P3" | "P4";
                    estado?: "NUEVO" | "PENDIENTE_CLASIFICACION" | "CLASIFICADO" | "ASIGNADO" | "EN_CURSO" | "ESCALADO" | "RESUELTO" | "CERRADO";
                    page?: number;
                    size?: number;
                };
                header?: {
                    "X-Correlation-Id"?: string;
                };
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Consulta exitosa */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["PaginaTicketsDto"];
                    };
                };
                /** @description Parametros invalidos */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorDto"];
                    };
                };
                /** @description Error interno */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorDto"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Disponibilidad del servicio y de MongoDB */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Disponible */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["HealthDto"];
                    };
                };
                /** @description MongoDB no disponible */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorDto"];
                    };
                };
            };
        };
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
        TicketSnapshotDto: {
            /**
             * Format: uuid
             * @example 7c9e6679-7425-40de-944b-e07fc1f90ae7
             */
            ticketId: string;
            titulo: string;
            /** @enum {string} */
            estado: "NUEVO" | "PENDIENTE_CLASIFICACION" | "CLASIFICADO" | "ASIGNADO" | "EN_CURSO" | "ESCALADO" | "RESUELTO" | "CERRADO";
            /** @enum {string|null} */
            prioridad: "P1" | "P2" | "P3" | "P4" | null;
            /** @enum {string|null} */
            categoria: "INCIDENTE" | "SOLICITUD" | "CONSULTA" | "BUG" | null;
            /** @enum {string|null} */
            moduloAfectado: "AUTENTICACION" | "FACTURACION" | "PAGOS" | "REPORTES" | "INFRAESTRUCTURA" | "BASE_DE_DATOS" | "INTEGRACIONES" | "OTRO" | null;
            /**
             * Format: uuid
             * @example 7c9e6679-7425-40de-944b-e07fc1f90ae7
             */
            solicitanteId: string;
            /**
             * Format: uuid
             * @example 7c9e6679-7425-40de-944b-e07fc1f90ae7
             */
            agenteAsignadoId: string | null;
            /**
             * Format: date-time
             * @example 2026-10-05T14:03:11Z
             */
            fechaCreacion: string;
            /**
             * Format: date-time
             * @example 2026-10-05T14:03:11Z
             */
            fechaLimiteSla: string | null;
        };
        /** @description estadoAnterior obligatorio en TicketEstadoCambiado, TicketEscalado y TicketResuelto; motivo obligatorio en TicketEscalado. */
        PayloadEventoDto: {
            ticket: components["schemas"]["TicketSnapshotDto"];
            /** @enum {string} */
            estadoAnterior?: "NUEVO" | "PENDIENTE_CLASIFICACION" | "CLASIFICADO" | "ASIGNADO" | "EN_CURSO" | "ESCALADO" | "RESUELTO" | "CERRADO";
            motivo?: string;
        };
        EventoDto: {
            /**
             * Format: uuid
             * @example 7c9e6679-7425-40de-944b-e07fc1f90ae7
             */
            eventId: string;
            /** @enum {string} */
            eventType: "TicketCreado" | "TicketClasificado" | "TicketEscalado" | "TicketAsignado" | "TicketEstadoCambiado" | "TicketResuelto";
            /** @enum {integer} */
            version: 1;
            /**
             * Format: date-time
             * @example 2026-10-05T14:03:11Z
             */
            occurredAt: string;
            /** @example cid-eventos */
            correlationId: string;
            /** @enum {string} */
            source: "ticket-service";
            payload: components["schemas"]["PayloadEventoDto"];
        };
        TicketViewDto: {
            /**
             * Format: uuid
             * @example 7c9e6679-7425-40de-944b-e07fc1f90ae7
             */
            ticketId: string;
            titulo: string;
            /** @enum {string} */
            estado: "NUEVO" | "PENDIENTE_CLASIFICACION" | "CLASIFICADO" | "ASIGNADO" | "EN_CURSO" | "ESCALADO" | "RESUELTO" | "CERRADO";
            /** @enum {string|null} */
            prioridad: "P1" | "P2" | "P3" | "P4" | null;
            /** @enum {string|null} */
            categoria: "INCIDENTE" | "SOLICITUD" | "CONSULTA" | "BUG" | null;
            /** @enum {string|null} */
            moduloAfectado: "AUTENTICACION" | "FACTURACION" | "PAGOS" | "REPORTES" | "INFRAESTRUCTURA" | "BASE_DE_DATOS" | "INTEGRACIONES" | "OTRO" | null;
            /**
             * Format: uuid
             * @example 7c9e6679-7425-40de-944b-e07fc1f90ae7
             */
            solicitanteId: string;
            /**
             * Format: uuid
             * @example 7c9e6679-7425-40de-944b-e07fc1f90ae7
             */
            agenteAsignadoId: string | null;
            /**
             * Format: date-time
             * @example 2026-10-05T14:03:11Z
             */
            fechaCreacion: string;
            /**
             * Format: date-time
             * @example 2026-10-05T14:03:11Z
             */
            fechaLimiteSla: string | null;
            escalado: boolean;
            /**
             * Format: date-time
             * @example 2026-10-05T14:03:11Z
             */
            fechaResolucion: string | null;
            /**
             * Format: date-time
             * @example 2026-10-05T14:03:11Z
             */
            ultimoEventoEn: string;
        };
        ResultadoEventoDto: {
            /**
             * Format: uuid
             * @example 7c9e6679-7425-40de-944b-e07fc1f90ae7
             */
            eventId: string;
            /** @enum {string} */
            resultado: "PROCESADO" | "DUPLICADO";
        };
        ErrorDto: {
            codigo: string;
            mensaje: string;
            detalles?: {
                campo: string;
                mensaje: string;
            }[];
            /**
             * Format: date-time
             * @example 2026-10-05T14:03:11Z
             */
            timestamp: string;
            path: string;
            correlationId: string;
        };
        ResumenDto: {
            total: number;
            abiertos: number;
            escalados: number;
            slaVencidos: number;
            porPrioridad: {
                P1: number;
                P2: number;
                P3: number;
                P4: number;
                SIN_PRIORIDAD: number;
            };
            porCategoria: {
                INCIDENTE: number;
                SOLICITUD: number;
                CONSULTA: number;
                BUG: number;
                SIN_CATEGORIA: number;
            };
            porEstado: {
                NUEVO: number;
                PENDIENTE_CLASIFICACION: number;
                CLASIFICADO: number;
                ASIGNADO: number;
                EN_CURSO: number;
                ESCALADO: number;
                RESUELTO: number;
                CERRADO: number;
            };
            /**
             * Format: date-time
             * @example 2026-10-05T14:03:11Z
             */
            generadoEn: string;
        };
        SlaDto: {
            vencidos: {
                /**
                 * Format: uuid
                 * @example 7c9e6679-7425-40de-944b-e07fc1f90ae7
                 */
                ticketId: string;
                titulo: string;
                /** @enum {string|null} */
                prioridad: "P1" | "P2" | "P3" | "P4" | null;
                /** @enum {string} */
                estado: "NUEVO" | "PENDIENTE_CLASIFICACION" | "CLASIFICADO" | "ASIGNADO" | "EN_CURSO" | "ESCALADO" | "RESUELTO" | "CERRADO";
                /**
                 * Format: date-time
                 * @example 2026-10-05T14:03:11Z
                 */
                fechaLimiteSla: string;
                horasVencido: number;
            }[];
            cumplimientoPorPrioridad: {
                P1: {
                    resueltos: number;
                    enTermino: number;
                    porcentaje: number | null;
                };
                P2: {
                    resueltos: number;
                    enTermino: number;
                    porcentaje: number | null;
                };
                P3: {
                    resueltos: number;
                    enTermino: number;
                    porcentaje: number | null;
                };
                P4: {
                    resueltos: number;
                    enTermino: number;
                    porcentaje: number | null;
                };
            };
            /**
             * Format: date-time
             * @example 2026-10-05T14:03:11Z
             */
            generadoEn: string;
        };
        PaginaTicketsDto: {
            content: components["schemas"]["TicketViewDto"][];
            page: number;
            size: number;
            totalElements: number;
            totalPages: number;
        };
        HealthDto: {
            /** @enum {string} */
            status: "UP";
            /** @enum {string} */
            service: "reporting-service";
            /** @enum {string} */
            version: "0.1.0";
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
