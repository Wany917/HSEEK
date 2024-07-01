import type { HttpContext } from '@adonisjs/core/http'
import Invoice from '../models/invoice.js'

export default class InvoicesController {
  async createInvoice({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(registerValidator)

      const fullName = `${payload.firstname} ${payload.lastname}`
      const user = await User.create({
        fullName,
        email: payload.email,
        password: payload.password,
      })

      return response.created(user)
    } catch (error) {
      console.error(error)
      return response.status(400).send(error)
    }
  }
}
