import vine from '@vinejs/vine'
export const createInvoiceValidator = vine.compile(
  vine.object({
    to: vine.number().min(1),
    description: vine.string().minLength(2),
    quantity: vine.number().max(1).min(1),
    unitPrice: vine.number(),
  })
)
