import vine from '@vinejs/vine'

export const deleteInvoiceValidator = vine.compile(
  vine.object({
    id: vine.number().positive().withoutDecimals(),
  })
)
