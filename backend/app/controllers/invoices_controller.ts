import type { HttpContext } from '@adonisjs/core/http'
import { createInvoiceValidator } from '#validators/invoices/create_invoice'
import { getInvoiceValidator } from '#validators/invoices/get_invoice'
import { deleteInvoiceValidator } from '#validators/invoices/delete_invoice'
import { updateInvoiceValidator } from '#validators/invoices/update_invoice'
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

  async getAllInvoices({ response }: HttpContext) {
    try {
      const invoices = await Invoice.all()
      return response.json(invoices)
    } catch (error) {
      console.error(error)
      return response.status(400).send(error)
    }
  }

  async getInvoiceById({ request, response, params }: HttpContext) {
    try {
      //await request.validateUsing(getInvoiceValidator)

      const invoice = await Invoice.findOrFail(params.id)
      return response.json(invoice)
    } catch (error) {
      console.error(error)
      return response.status(404).send(error)
    }
  }

  async deleteInvoice({ request, response, params }: HttpContext) {
    try {
      //await request.validateUsing(deleteInvoiceValidator)

      const invoice = await Invoice.findOrFail(params.id)
      await invoice.delete()

      return response.send('Delete success')
    } catch (error) {
      console.error(error)
      return response.status(404).send(error)
    }
  }

  async updateInvoice({ request, response, params }: HttpContext) {
    try {
      await request.validateUsing(updateInvoiceValidator)

      const invoice = await Invoice.findOrFail(params.id)

      invoice.merge(request.only(['from', 'to', 'description', 'quantity', 'unitPrice', 'dueAt']))
      await invoice.save()

      return response.json(invoice)
    } catch (error) {
      console.error(error)
      return response.status(400).send(error)
    }
  }
}
