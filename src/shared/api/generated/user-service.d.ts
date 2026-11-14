// Generado desde OpenAPI. No editar a mano.
export interface paths {
    "/api/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Iniciar sesion
         * @description Devuelve un JWT valido por JWT_EXPIRATION_MINUTES (60 min por defecto; expiresIn va en segundos).
         *     Email inexistente, contraseña incorrecta o usuario inactivo devuelven siempre el mismo
         *     401 CREDENCIALES_INVALIDAS, para no revelar cual de los tres paso.
         */
        post: operations["login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/usuarios": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar usuarios
         * @description El gateway deja pasar esta ruta a AGENTE y ADMIN. Filtro opcional por rol.
         *     Paginacion igual que el resto de los servicios (seccion 5).
         */
        get: operations["listarUsuarios"];
        put?: never;
        /**
         * Crear un usuario
         * @description El gateway solo deja pasar esta ruta a ADMIN. El email se normaliza a minusculas;
         *     si ya existe (sin importar mayusculas/minusculas), 409 EMAIL_DUPLICADO. La contraseña
         *     se guarda con BCrypt; nunca se devuelve en la respuesta.
         */
        post: operations["crearUsuario"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/usuarios/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Ver un usuario */
        get: operations["obtenerUsuario"];
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
        Rol: "SOLICITANTE" | "AGENTE" | "ADMIN";
        LoginRequest: {
            /** Format: email */
            email: string;
            password: string;
        };
        LoginResponse: {
            /** @example eyJhbGciOiJIUzI1NiJ9... */
            accessToken: string;
            /** @example Bearer */
            tokenType: string;
            /**
             * @description Segundos hasta que expira el token (JWT_EXPIRATION_MINUTES * 60)
             * @example 3600
             */
            expiresIn: number;
            /** @description Datos minimos del usuario autenticado (seccion 9.1). No incluye activo ni fechaAlta. */
            usuario: {
                /** Format: uuid */
                id: string;
                nombre: string;
                /** Format: email */
                email: string;
                rol: components["schemas"]["Rol"];
            };
        };
        CrearUsuarioRequest: {
            /** @description Maximo propuesto por P3 (pendiente de acordar). */
            nombre: string;
            /**
             * Format: email
             * @description Se normaliza a minusculas. Maximo propuesto por P3 (pendiente de acordar).
             */
            email: string;
            /** @description Minimo propuesto por P3 (pendiente de acordar). Se guarda con BCrypt, nunca en texto plano. */
            password: string;
            rol: components["schemas"]["Rol"];
        };
        /** @description Nunca incluye la contraseña ni el hash. */
        Usuario: {
            /** Format: uuid */
            id: string;
            nombre: string;
            /** Format: email */
            email: string;
            rol: components["schemas"]["Rol"];
            activo: boolean;
            /** Format: date-time */
            fechaAlta: string;
        };
        PaginaUsuarios: {
            content: components["schemas"]["Usuario"][];
            /** @example 0 */
            page: number;
            /** @example 20 */
            size: number;
            /**
             * Format: int64
             * @example 5
             */
            totalElements: number;
            /** @example 1 */
            totalPages: number;
        };
        /** @description Formato comun de error (seccion 5.3) */
        Error: {
            /** @enum {string} */
            codigo: "VALIDACION" | "CREDENCIALES_INVALIDAS" | "NO_ENCONTRADO" | "EMAIL_DUPLICADO" | "ERROR_INTERNO";
            mensaje: string;
            /** @description Solo en errores de validacion */
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
        /** @description VALIDACION - body o parametros invalidos */
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
                 *           "campo": "email",
                 *           "mensaje": "debe ser un email valido"
                 *         }
                 *       ],
                 *       "timestamp": "2026-10-05T14:03:11Z",
                 *       "path": "/api/usuarios",
                 *       "correlationId": "a8e1b2c3-0000-4000-8000-000000000000"
                 *     }
                 */
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description CREDENCIALES_INVALIDAS - email inexistente, contraseña incorrecta o usuario inactivo (mismo codigo en los tres casos) */
        CredencialesInvalidas: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                /**
                 * @example {
                 *       "codigo": "CREDENCIALES_INVALIDAS",
                 *       "mensaje": "Email o contraseña invalidos",
                 *       "timestamp": "2026-10-05T14:03:11Z",
                 *       "path": "/api/auth/login",
                 *       "correlationId": "a8e1b2c3-0000-4000-8000-000000000000"
                 *     }
                 */
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description NO_ENCONTRADO - el usuario no existe */
        NoEncontrado: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                /**
                 * @example {
                 *       "codigo": "NO_ENCONTRADO",
                 *       "mensaje": "No existe el usuario b1c2d3e4-0000-4000-8000-000000000099",
                 *       "timestamp": "2026-10-05T14:03:11Z",
                 *       "path": "/api/usuarios/b1c2d3e4-0000-4000-8000-000000000099",
                 *       "correlationId": "a8e1b2c3-0000-4000-8000-000000000000"
                 *     }
                 */
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description EMAIL_DUPLICADO - ya existe un usuario con ese email */
        EmailDuplicado: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                /**
                 * @example {
                 *       "codigo": "EMAIL_DUPLICADO",
                 *       "mensaje": "Ya existe un usuario con el email ana@urgentia.local",
                 *       "detalles": [
                 *         {
                 *           "campo": "email",
                 *           "mensaje": "ya esta en uso"
                 *         }
                 *       ],
                 *       "timestamp": "2026-10-05T14:03:11Z",
                 *       "path": "/api/usuarios",
                 *       "correlationId": "a8e1b2c3-0000-4000-8000-000000000000"
                 *     }
                 */
                "application/json": components["schemas"]["Error"];
            };
        };
    };
    parameters: {
        /** @description Id del usuario (UUID) */
        UsuarioId: string;
    };
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    login: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginRequest"];
            };
        };
        responses: {
            /** @description Login correcto */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LoginResponse"];
                };
            };
            400: components["responses"]["Validacion"];
            401: components["responses"]["CredencialesInvalidas"];
        };
    };
    listarUsuarios: {
        parameters: {
            query?: {
                rol?: components["schemas"]["Rol"];
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
            /** @description Pagina de usuarios */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginaUsuarios"];
                };
            };
            400: components["responses"]["Validacion"];
        };
    };
    crearUsuario: {
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
                 *       "nombre": "Ana Agente",
                 *       "email": "ana@urgentia.local",
                 *       "password": "Segura123!",
                 *       "rol": "AGENTE"
                 *     }
                 */
                "application/json": components["schemas"]["CrearUsuarioRequest"];
            };
        };
        responses: {
            /** @description Usuario creado */
            201: {
                headers: {
                    /** @description URL del usuario creado */
                    Location?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Usuario"];
                };
            };
            400: components["responses"]["Validacion"];
            409: components["responses"]["EmailDuplicado"];
        };
    };
    obtenerUsuario: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Id del usuario (UUID) */
                id: components["parameters"]["UsuarioId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description El usuario */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Usuario"];
                };
            };
            404: components["responses"]["NoEncontrado"];
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
                        /** @example user-service */
                        service?: string;
                        /** @example 0.1.0 */
                        version?: string;
                    };
                };
            };
        };
    };
}
