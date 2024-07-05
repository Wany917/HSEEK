import vine from '@vinejs/vine'
export const createInvoiceValidator = vine.compile(
  vine.object({
    from: vine.string().minLength(2),
    to: vine.string().minLength(2),
    description: vine.string().minLength(2),
    quantity: vine.number().max(1).min(1),
    unitPrice: vine.number(),
    dueAt: vine.date(),
  })
)
