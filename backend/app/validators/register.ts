import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    firstname: vine.string().minLength(2), // Implicitement requis par `minLength`
    lastname: vine.string().minLength(2), // Implicitement requis par `minLength`
    email: vine
      .string()
      .email()
      .toLowerCase()
      .unique(async (query, field) => {
        const user = await query.from('users').where('email', field).first()
        return !user
      }),
    password: vine.string().minLength(8),
  })
)
