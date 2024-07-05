import vine from '@vinejs/vine'

export const createFolderValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(255),
    path: vine.string().minLength(1).maxLength(255).optional(),
  })
)

export const modifyFolderValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(255),
    path: vine.string().minLength(1).maxLength(255).optional(),
    newName: vine.string().minLength(1).maxLength(255),
  })
)
