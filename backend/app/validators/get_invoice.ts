import vine from '@vinejs/vine'

export const getInvoiceValidator = vine.compile(
  vine.object({
    id: vine.number().positive().withoutDecimals(),
  })
)
