import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    username: vine
      .string()
      .minLength(3)
      .maxLength(25)
      .toLowerCase()
      .unique(async (query: any, field: any) => {
        const user = await query.from('users').where('username', field).first()
        return !user
      }),
    email: vine
      .string()
      .email()
      .toLowerCase()
      .unique(async (query: any, field: any) => {
        const user = await query.from('users').where('email', field).first()
        return !user
      }),
    password: vine.string().minLength(8).maxLength(32),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().toLowerCase(),
    password: vine.string().minLength(8).maxLength(32),
  })
)

export const queryAllUsersValidator = vine.compile(
  vine.object({
    page: vine.number(),
    perPage: vine.number(),
    username: vine.string().nullable(),
  })
)

export const updateProfileValidator = vine.compile(
  vine.object({
    username: vine
      .string()
      .minLength(3)
      .maxLength(25)
      .toLowerCase()
      .unique(async (query: any, field: any) => {
        const user = await query.from('users').where('username', field).first()
        return !user
      }),
    email: vine
      .string()
      .email()
      .toLowerCase()
      .unique(async (query: any, field: any) => {
        const user = await query.from('users').where('email', field).first()
        return !user
      }),
  })
)
