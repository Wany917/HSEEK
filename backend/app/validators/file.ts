import vine from '@vinejs/vine'

export const uploadFileValidator = vine.compile(
  vine.object({
    file: vine.file(),
    path: vine.string().minLength(1).maxLength(255).optional(),
  })
)
