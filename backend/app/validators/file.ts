import vine from '@vinejs/vine'

export const uploadFileValidator = vine.compile(
  vine.object({
    file: vine.file(),
  })
)
