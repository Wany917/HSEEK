import vine from '@vinejs/vine'
export const updateInvoiceValidator = vine.compile(
  vine.object({
    description: vine.string().minLength(2).optional(),
    quantity: vine.number().max(1).min(1).optional(),
    unitPrice: vine.number().optional(),
  })
)
