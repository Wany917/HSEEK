import type { HttpContext } from '@adonisjs/core/http'
import fs from 'node:fs'
import path from 'node:path'
import app from '@adonisjs/core/services/app'
import { uploadFileValidator } from '#validators/file'
import cuid from 'cuid'

export default class FilesController {
  async upload({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { file, path: requestPath } = await request.validateUsing(uploadFileValidator)
    const userDir = path.join(
      app.makePath('../frontend/web/public/data'),
      user.id.toString(),
      requestPath || ''
    )

    console.log(`Attempting to upload file to directory: ${userDir}`)

    if (!fs.existsSync(userDir)) {
      console.log(`Directory does not exist: ${userDir}, creating it...`)
      fs.mkdirSync(userDir, { recursive: true })
    }

    const fileName = `${cuid()}.${file.extname}`
    await file.move(userDir, { name: fileName })

    const filePath = path.join(userDir, fileName)
    console.log(`File uploaded to: ${filePath}`)

    return response.created({ message: 'File uploaded successfully', path: filePath })
  }

  async list({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const requestPath = request.input('path', '')

    const userDir = path.join(app.makePath('data'), user.id.toString(), requestPath)

    console.log(`Listing files in directory: ${userDir}`)

    if (!fs.existsSync(userDir)) {
      console.error(`Directory does not exist: ${userDir}`)
      return response.notFound('Folder not found')
    }

    const files = await fs.promises.readdir(userDir)
    return response.ok(files)
  }

  async read({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const requestPath = request.input('path', '')
    const filePath = path.join(app.makePath('data'), user.id.toString(), requestPath, params.fileId)

    console.log(`Reading file: ${filePath}`)

    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`)
      return response.notFound('File not found')
    }

    return response.download(filePath)
  }

  async delete({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const requestPath = request.input('path', '')
    const filePath = path.join(app.makePath('data'), user.id.toString(), requestPath, params.fileId)

    console.log(`Deleting file: ${filePath}`)

    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`)
      return response.notFound('File not found')
    }

    await fs.promises.unlink(filePath)
    return response.ok({ message: 'File deleted successfully' })
  }
}
