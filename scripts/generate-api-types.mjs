import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import openapiTS, { astToString } from 'openapi-typescript'

const [entrada, nombre, ...extra] = process.argv.slice(2)

if (!entrada || !nombre || extra.length || !/^[a-z][a-z0-9-]*$/.test(nombre)) {
  console.error(
    'Uso: npm run api:generate -- <contrato.yaml|json> <nombre-del-servicio>',
  )
  process.exitCode = 1
} else {
  try {
    // Solo lee el contrato indicado. No busca ni modifica el repositorio del backend.
    const ast = await openapiTS(pathToFileURL(resolve(entrada)))
    const carpeta = new URL('../src/shared/api/generated/', import.meta.url)
    await mkdir(carpeta, { recursive: true })
    const salida = new URL(nombre + '.d.ts', carpeta)
    await writeFile(
      salida,
      '// Generado desde OpenAPI. No editar a mano.\n' + astToString(ast),
    )
    console.log('Tipos generados: ' + fileURLToPath(salida))
  } catch (error) {
    console.error('No se pudieron generar los tipos:', error.message)
    process.exitCode = 1
  }
}
