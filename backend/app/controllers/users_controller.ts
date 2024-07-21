import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { registerValidator } from '#validators/user'
import { loginValidator } from '#validators/user'
import { queryAllUsersValidator } from '#validators/user'
import { updateProfileValidator } from '#validators/user'

export default class UsersController {
  async register({ request, response, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(registerValidator)
      const user = new User()

      user.merge(payload)
      await user.save() // Save the user to generate an ID

      const token = await auth.use('jwt').generate(user) // Now generate the token

      // Adjusted response to correctly return the created user and token
      return response.created({ accessToken: token.token, data: user })
    } catch (error) {
      console.log(error)
      return response.status(400).send({ error: 'Registration failed', details: error.messages })
    }
  }

  async login({ request, response, auth }: HttpContext) {
    try {
      const { email, password } = await request.validateUsing(loginValidator)
      console.log('Login attempt for:', email)

      const user = await User.findBy('email', email)
      if (!user) {
        console.log('User not found for email:', email)
        return response.status(401).send({ error: 'Login failed', details: 'User not found' })
      }

      const isPasswordValid = await User.verifyCredentials(email, password)
      console.log('Password verification result:', isPasswordValid)

      if (!isPasswordValid) {
        return response.status(401).send({ error: 'Login failed', details: 'Invalid password' })
      }

      const token = await auth.use('jwt').generate(user)
      console.log('Token generated successfully')

      return response.ok({
        accessToken: token.token,
        user: user,
      })
    } catch (error) {
      console.error('Login error:', error)
      return response.status(401).send({ error: 'Login failed', details: error.message })
    }
  }

  async me({ auth, response }: HttpContext) {
    await auth.use('jwt').authenticate()
    const user = auth.user!
    return response.ok({
      user: user,
    })
  }

  async index({ request, response }: HttpContext) {
    const { page, perPage, username } = await request.validateUsing(queryAllUsersValidator)

    const query = User.query().where('username', 'like', `%${username}%`)
    const users = await query.paginate(page, perPage)

    return response.ok(users)
  }

  async show({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    return response.ok(user)
  }

  async update({ request, response, auth }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(updateProfileValidator)

    user.merge(payload)
    await user.save()

    return response.ok(user)
  }
}
