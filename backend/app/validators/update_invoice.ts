import vine from '@vinejs/vine'
export const updateInvoiceValidator = vine.compile(
  vine.object({
    //id: vine.number().positive().withoutDecimals(),
    from: vine.string().minLength(2).optional(),
    to: vine.string().minLength(2).optional(),
    description: vine.string().minLength(2).optional(),
    quantity: vine.number().max(1).min(1).optional(),
    unitPrice: vine.number().optional(),
    dueAt: vine.date().optional(),
  })
)
