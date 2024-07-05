import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { registerValidator } from '#validators/user'
import { loginValidator } from '#validators/user'
import { queryAllUsersValidator } from '#validators/user'
import { updateProfileValidator } from '#validators/user'

export default class UsersController {
    async register({ request, response }: HttpContext) {
        try {
          const payload = await request.validateUsing(registerValidator)
          const user = new User()

          user.merge(payload)
          await user.save()
    
          return response.created(user)
        } catch (error) {
          console.log(error);
          return response.status(400).send({ error: 'Registration failed', details: error.messages })
        }
      }
    
      async login({ request, response }: HttpContext) {
        try {
          const { email, password } = await request.validateUsing(loginValidator)
          const user = await User.verifyCredentials(email, password)
          const token = await User.accessTokens.create(user)
    
          return response.ok({
            token: token.value!.release(),
          })
        } catch (error) {
          return response.status(401).send({ error: 'Login failed', details: error.messages })
        }
      }
    
      async me({ auth, response }: HttpContext) {
        const user = auth.user!
        return response.ok(user)
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