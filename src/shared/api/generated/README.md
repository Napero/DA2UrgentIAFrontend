# Tipos generados

Esta carpeta recibirá los tipos de los contratos OpenAPI aprobados.

Ejemplo, cuando el archivo del contrato esté disponible en este repo:

```sh
npm run api:generate -- ./contracts/reporting-service.yaml reporting
```

Esto crea `reporting.d.ts`. Los archivos generados deben versionarse junto
con la versión del contrato utilizada; no deben editarse a mano.

Todavía no se copiaron contratos ni se generaron modelos de endpoints.
