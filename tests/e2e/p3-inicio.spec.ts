import { expect, test, type Page } from '@playwright/test'
import { abrir } from './fixtures'

// Accesos de Inicio por rol (P3). Entra con el harness de P6; Inicio no consulta el gateway.

const accesos = (page: Page) =>
  page
    .getByRole('region', { name: 'Todo a mano' })
    .getByRole('link')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')))

test.beforeEach(async ({ page }) => {
  await page.route('http://localhost:8080/**', (route) =>
    route.fulfill({ status: 404, json: {} }),
  )
})

test('un solicitante ve sus accesos y no los de la atención', async ({
  page,
}) => {
  await abrir(page, '/', 'SOLICITANTE')

  await expect
    .poll(() => accesos(page))
    .toEqual(['/mis-tickets', '/tickets/nuevo'])
})

for (const rol of ['AGENTE', 'ADMIN']) {
  test(`un ${rol.toLowerCase()} ve la bandeja, los reportes y las notificaciones`, async ({
    page,
  }) => {
    await abrir(page, '/', rol)

    await expect
      .poll(() => accesos(page))
      .toEqual(['/tickets', '/reportes', '/notificaciones'])
  })
}

test('sin sesión muestra los accesos de la atención', async ({ page }) => {
  await abrir(page, '/', '')

  await expect
    .poll(() => accesos(page))
    .toEqual(['/tickets', '/reportes', '/notificaciones'])
})
