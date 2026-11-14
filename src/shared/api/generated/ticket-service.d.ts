// Generado desde OpenAPI. No editar a mano.
export interface paths {
    "/api/tickets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar tickets
         * @description Orden: prioridad ascendente (P1 primero; los que no tienen prioridad, al final) y fecha
         *     de creacion descendente. Un SOLICITANTE solo ve sus propios tickets.
         */
        get: operations["listarTickets"];
        put?: never;
        /**
         * Crear un ticket
         * @description Crea el ticket, lo clasifica con la IA, calcula prioridad y SLA y, si es critico, lo escala.
         *     Todo ocurre en esta llamada. Si la IA falla o tarda mas de 7 s, el ticket queda
         *     PENDIENTE_CLASIFICACION y se responde 201 igual. El solicitante sale de X-User-Id.
         */
        post: operations["crearTicket"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/tickets/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Ver un ticket
         * @description Un SOLICITANTE solo puede ver sus propios tickets; si pide uno ajeno recibe 404.
         */
        get: operations["obtenerTicket"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/tickets/{id}/asignacion": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Asignar un agente
         * @description En CLASIFICADO el ticket pasa a ASIGNADO. En ESCALADO se asigna (o reasigna) sin cambiar
         *     el estado, para que la guardia lo tome. En cualquier otro estado: 409 TRANSICION_INVALIDA.
         */
        patch: operations["asignarTicket"];
        trace?: never;
    };
    "/api/tickets/{id}/estado": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Cambiar el estado
         * @description Transiciones permitidas (seccion 8.4):
         *     ASIGNADO -> EN_CURSO o ESCALADO; EN_CURSO -> RESUELTO o ESCALADO;
         *     ESCALADO -> EN_CURSO (requiere agente asignado); RESUELTO -> CERRADO o EN_CURSO (reabrir).
         *     Pasar a EN_CURSO o RESUELTO sin agente: 409 REGLA_DE_NEGOCIO.
         *     El motivo es obligatorio solo para ESCALADO (si falta: 400 VALIDACION).
         */
        patch: operations["cambiarEstadoTicket"];
        trace?: never;
    };
    "/api/tickets/{id}/reclasificacion": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Reclasificar con la IA
         * @description Sin body. Solo para tickets PENDIENTE_CLASIFICACION o CLASIFICADO. Vuelve a pedir la
         *     clasificacion, recalcula prioridad y SLA y puede escalar. Si la IA no responde: 503 y el
         *     ticket no cambia.
         */
        post: operations["reclasificarTicket"];
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
        /** Estado del servicio */
        get: operations["health"];
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
        /** @enum {string} */
        Categoria: "INCIDENTE" | "SOLICITUD" | "CONSULTA" | "BUG";
        /** @enum {string} */
        Urgencia: "ALTA" | "MEDIA" | "BAJA";
        /** @enum {string} */
        Impacto: "ALTO" | "MEDIO" | "BAJO";
        /** @enum {string} */
        Prioridad: "P1" | "P2" | "P3" | "P4";
        /** @enum {string} */
        EstadoTicket: "NUEVO" | "PENDIENTE_CLASIFICACION" | "CLASIFICADO" | "ASIGNADO" | "EN_CURSO" | "ESCALADO" | "RESUELTO" | "CERRADO";
        /** @enum {string} */
        ModuloAfectado: "AUTENTICACION" | "FACTURACION" | "PAGOS" | "REPORTES" | "INFRAESTRUCTURA" | "BASE_DE_DATOS" | "INTEGRACIONES" | "OTRO";
        CrearTicketRequest: {
            titulo: string;
            descripcion: string;
        };
        AsignarTicketRequest: {
            /** Format: uuid */
            agenteId: string;
        };
        CambiarEstadoRequest: {
            estado: components["schemas"]["EstadoTicket"];
            /** @description Obligatorio solo si estado es ESCALADO. Largo maximo propuesto por P2 (pendiente de acordar). */
            motivo?: string;
        };
        /** @description Lo que sugirio la IA. No incluye la prioridad. */
        Clasificacion: {
            categoria: components["schemas"]["Categoria"];
            urgencia: components["schemas"]["Urgencia"];
            impacto: components["schemas"]["Impacto"];
            moduloAfectado: components["schemas"]["ModuloAfectado"];
            requiereEscalamiento: boolean;
            confianza: number;
            justificacion?: string;
            /** @example mock */
            proveedor?: string;
            /** Format: date-time */
            fecha: string;
        };
        Ticket: {
            /** Format: uuid */
            id: string;
            titulo: string;
            descripcion: string;
            /** Format: uuid */
            solicitanteId: string;
            /** Format: uuid */
            agenteAsignadoId?: string | null;
            estado: components["schemas"]["EstadoTicket"];
            /** @description La calcula el dominio. null si el ticket no esta clasificado. */
            prioridad?: components["schemas"]["Prioridad"] | null;
            /**
             * Format: date-time
             * @description Fecha de clasificacion + 1/4/8/24 h segun la prioridad. null si no esta clasificado.
             */
            fechaLimiteSla?: string | null;
            /** @description true si la confianza de la IA fue menor a 0.6 */
            requiereRevisionManual: boolean;
            /** @example Prioridad P1 */
            motivoEscalamiento?: string | null;
            clasificacion?: components["schemas"]["Clasificacion"] | null;
            /** Format: date-time */
            fechaCreacion: string;
            /** Format: date-time */
            fechaActualizacion: string;
        };
        PaginaTicket: {
            content: components["schemas"]["Ticket"][];
            /** @example 0 */
            page: number;
            /** @example 20 */
            size: number;
            /**
             * Format: int64
             * @example 57
             */
            totalElements: number;
            /** @example 3 */
            totalPages: number;
        };
        /** @description Formato comun de error (seccion 5.3) */
        Error: {
            /** @enum {string} */
            codigo: "VALIDACION" | "NO_ENCONTRADO" | "TRANSICION_INVALIDA" | "REGLA_DE_NEGOCIO" | "IA_NO_DISPONIBLE" | "ERROR_INTERNO";
            mensaje: string;
            /** @description Solo en errores de validacion y de transicion */
            detalles?: {
                campo?: string;
                mensaje?: string;
            }[];
            /** Format: date-time */
            timestamp: string;
            path: string;
            correlationId: string;
        };
    };
    responses: {
        /** @description VALIDACION - body, parametros o headers invalidos */
        Validacion: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                /**
                 * @example {
                 *       "codigo": "VALIDACION",
                 *       "mensaje": "El pedido tiene datos invalidos",
                 *       "detalles": [
                 *         {
                 *           "campo": "titulo",
                 *           "mensaje": "debe tener entre 5 y 120 caracteres"
                 *         }
                 *       ],
                 *       "timestamp": "2026-10-05T14:03:11Z",
                 *       "path": "/api/tickets",
                 *       "correlationId": "a8e1b2c3-0000-4000-8000-000000000000"
                 *     }
                 */
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description NO_ENCONTRADO - el ticket no existe (o el solicitante no puede verlo) */
        NoEncontrado: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                /**
                 * @example {
                 *       "codigo": "NO_ENCONTRADO",
                 *       "mensaje": "No existe el ticket 7c9e6679-7425-40de-944b-e07fc1f90ae7",
                 *       "timestamp": "2026-10-05T14:03:11Z",
                 *       "path": "/api/tickets/7c9e6679-7425-40de-944b-e07fc1f90ae7",
                 *       "correlationId": "a8e1b2c3-0000-4000-8000-000000000000"
                 *     }
                 */
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description TRANSICION_INVALIDA - el estado actual no permite la operacion */
        TransicionInvalida: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                /**
                 * @example {
                 *       "codigo": "TRANSICION_INVALIDA",
                 *       "mensaje": "No se puede asignar un ticket en estado CERRADO: solo en CLASIFICADO o ESCALADO",
                 *       "detalles": [
                 *         {
                 *           "campo": "estado",
                 *           "mensaje": "transición no permitida"
                 *         }
                 *       ],
                 *       "timestamp": "2026-10-05T14:03:11Z",
                 *       "path": "/api/tickets/7c9e6679-7425-40de-944b-e07fc1f90ae7/asignacion",
                 *       "correlationId": "a8e1b2c3-0000-4000-8000-000000000000"
                 *     }
                 */
                "application/json": components["schemas"]["Error"];
            };
        };
    };
    parameters: {
        /** @description Id del ticket (UUID) */
        TicketId: string;
    };
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    listarTickets: {
        parameters: {
            query?: {
                estado?: components["schemas"]["EstadoTicket"];
                prioridad?: components["schemas"]["Prioridad"];
                categoria?: components["schemas"]["Categoria"];
                /** @description Numero de pagina, desde 0 */
                page?: number;
                /** @description Tamaño de pagina */
                size?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Pagina de tickets */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginaTicket"];
                };
            };
            400: components["responses"]["Validacion"];
        };
    };
    crearTicket: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "titulo": "No puede ingresar nadie",
                 *       "descripcion": "Producción caída, todos los usuarios bloqueados en el login desde las 9"
                 *     }
                 */
                "application/json": components["schemas"]["CrearTicketRequest"];
            };
        };
        responses: {
            /** @description Ticket creado (clasificado, escalado o pendiente de clasificacion) */
            201: {
                headers: {
                    /** @description URL del ticket creado */
                    Location?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Ticket"];
                };
            };
            400: components["responses"]["Validacion"];
        };
    };
    obtenerTicket: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Id del ticket (UUID) */
                id: components["parameters"]["TicketId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description El ticket */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Ticket"];
                };
            };
            400: components["responses"]["Validacion"];
            404: components["responses"]["NoEncontrado"];
        };
    };
    asignarTicket: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Id del ticket (UUID) */
                id: components["parameters"]["TicketId"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "agenteId": "b1c2d3e4-0000-4000-8000-000000000002"
                 *     }
                 */
                "application/json": components["schemas"]["AsignarTicketRequest"];
            };
        };
        responses: {
            /** @description Ticket asignado */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Ticket"];
                };
            };
            400: components["responses"]["Validacion"];
            404: components["responses"]["NoEncontrado"];
            409: components["responses"]["TransicionInvalida"];
        };
    };
    cambiarEstadoTicket: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Id del ticket (UUID) */
                id: components["parameters"]["TicketId"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CambiarEstadoRequest"];
            };
        };
        responses: {
            /** @description Estado cambiado */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Ticket"];
                };
            };
            400: components["responses"]["Validacion"];
            404: components["responses"]["NoEncontrado"];
            /** @description TRANSICION_INVALIDA o REGLA_DE_NEGOCIO */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    reclasificarTicket: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Id del ticket (UUID) */
                id: components["parameters"]["TicketId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Ticket reclasificado */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Ticket"];
                };
            };
            400: components["responses"]["Validacion"];
            404: components["responses"]["NoEncontrado"];
            409: components["responses"]["TransicionInvalida"];
            /** @description IA_NO_DISPONIBLE */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "codigo": "IA_NO_DISPONIBLE",
                     *       "mensaje": "La IA no esta disponible: el ticket no se reclasifico",
                     *       "timestamp": "2026-10-05T14:03:11Z",
                     *       "path": "/api/tickets/7c9e6679-7425-40de-944b-e07fc1f90ae7/reclasificacion",
                     *       "correlationId": "a8e1b2c3-0000-4000-8000-000000000000"
                     *     }
                     */
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    health: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description El servicio esta arriba */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example UP */
                        status?: string;
                        /** @example ticket-service */
                        service?: string;
                        /** @example 0.1.0 */
                        version?: string;
                    };
                };
            };
        };
    };
}
