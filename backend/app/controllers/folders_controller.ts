import type { HttpContext } from '@adonisjs/core/http'
import fs from 'fs'
import app from '@adonisjs/core/services/app'
import { createFolderValidator, modifyFolderValidator } from '#validators/folder'

export default class FoldersController {
  async create({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { name, path } = await request.validateUsing(createFolderValidator)
    const userDir = app.makePath('data', user.id.toString(), path || '', name)

    if (fs.existsSync(userDir)) {
      return response.badRequest('Folder already exists')
    }

    await fs.promises.mkdir(userDir, { recursive: true })
    return response.created({ message: 'Folder created successfully' })
  }

  async modify({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { name, path, newName } = await request.validateUsing(modifyFolderValidator)
    const userDir = app.makePath('data', user.id.toString(), path || '', name)
    const newUserDir = app.makePath('data', user.id.toString(), path || '', newName)

    if (!fs.existsSync(userDir)) {
      return response.notFound('Folder not found')
    }

    await fs.promises.rename(userDir, newUserDir)
    return response.ok({ message: 'Folder renamed successfully' })
  }

  async delete({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const path = request.input('path', '')
    const folderPath = app.makePath('data', user.id.toString(), path, params.folderId)

    if (!fs.existsSync(folderPath)) {
      return response.notFound('Folder not found')
    }

    await fs.promises.rmdir(folderPath, { recursive: true })
    return response.ok({ message: 'Folder deleted successfully' })
  }
}
