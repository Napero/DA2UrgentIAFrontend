# Tipos generados

Tipos de los cuatro contratos aprobados de contracts/. Su procedencia está en
contracts/source.json. No editar los .d.ts a mano.

Desde la raíz:

```sh
npm run api:generate:all
npm run api:check
```

Los alias de uso de la aplicación están en ../types.ts y apuntan a estos tipos;
no duplican los modelos del backend.
