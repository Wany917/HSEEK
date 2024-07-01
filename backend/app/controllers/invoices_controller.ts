import type { HttpContext } from '@adonisjs/core/http'
import { createInvoiceValidator } from '#validators/create_invoice'
import Invoice from '#models/invoice'

export default class InvoicesController {
  async createInvoice({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(createInvoiceValidator)

      const invoice = await Invoice.create({
        from: payload.from,
        to: payload.to,
        description: payload.description,
        quantity: payload.quantity,
        unitPrice: payload.unitPrice,
        dueAt: payload.dueAt,
      })

      return response.created(invoice)
    } catch (error) {
      console.error(error)
      return response.status(400).send(error)
    }
  }
}
