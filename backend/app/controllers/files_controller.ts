import type { HttpContext } from '@adonisjs/core/http'
import fs from 'fs'
import app from '@adonisjs/core/services/app'
import { uploadFileValidator } from '#validators/file'

export default class FilesController {
  async upload({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { files, path } = await request.validateUsing(uploadFileValidator)
    const userDir = app.makePath('data', user.id.toString(), path || '')

    if (!fs.existsSync(userDir)) {
      return response.badRequest('Folder does not exist')
    }

    const filePaths = []

    for (const file of files) {
      const filePath = `${userDir}/${file.clientName}`
      await file.move(userDir)
      filePaths.push(filePath)
    }

    return response.created({ message: 'Files uploaded successfully', paths: filePaths })
  }

  async list({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const path = request.input('path', '')

    const userDir = app.makePath('data', user.id.toString(), path)

    if (!fs.existsSync(userDir)) {
      return response.notFound('Folder not found')
    }

    const files = await fs.promises.readdir(userDir)
    return response.ok(files)
  }

  async read({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const path = request.input('path', '')
    const filePath = app.makePath('data', user.id.toString(), path, params.fileId)

    if (!fs.existsSync(filePath)) {
      return response.notFound('File not found')
    }

    return response.download(filePath)
  }

  async delete({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const path = request.input('path', '')
    const filePath = app.makePath('data', user.id.toString(), path, params.fileId)

    if (!fs.existsSync(filePath)) {
      return response.notFound('File not found')
    }

    await fs.promises.unlink(filePath)
    return response.ok({ message: 'File deleted successfully' })
  }
}
