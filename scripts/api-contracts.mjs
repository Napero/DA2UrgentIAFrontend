import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import openapiTS, { astToString } from 'openapi-typescript'

const source = JSON.parse(
  await readFile(new URL('../contracts/source.json', import.meta.url), 'utf8'),
)
const check = process.argv.includes('--check')
for (const { archivo, sha256 } of source.archivos) {
  const input = new URL('../contracts/' + archivo, import.meta.url)
  const content = (await readFile(input, 'utf8')).replace(/\r\n/g, '\n')
  if (createHash('sha256').update(content).digest('hex') !== sha256) {
    throw new Error(
      'Contrato modificado sin actualizar su procedencia: ' + archivo,
    )
  }
  const output = new URL(
    '../src/shared/api/generated/' + archivo.replace('.yaml', '.d.ts'),
    import.meta.url,
  )
  const generated =
    '// Generado desde OpenAPI. No editar a mano.\n' +
    astToString(await openapiTS(input))
  if (check) {
    if ((await readFile(output, 'utf8')).replace(/\r\n/g, '\n') !== generated)
      throw new Error('Regenerar tipos de ' + archivo)
  } else {
    await writeFile(output, generated)
  }
  console.log((check ? 'Verificado: ' : 'Generado: ') + archivo)
}
