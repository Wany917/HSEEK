import type { HttpContext } from '@adonisjs/core/http'
import fs from 'node:fs/promises'
import path from 'node:path'
import app from '@adonisjs/core/services/app'
import { uploadFileValidator } from '#validators/file'
import cuid from 'cuid'

export default class FilesController {
  private getUserDir(userId: string) {
    return path.join(app.makePath('/home/debian/data'), userId)
  }

  private async ensureUserDirectories(userId: string) {
    const userDir = this.getUserDir(userId)
    const contDir = path.join(userDir, 'cont')
    const tempFileDir = path.join(userDir, 'temp_file')
    const tempLogDir = path.join(userDir, 'temp_log')

    await fs.mkdir(userDir, { recursive: true })
    await fs.mkdir(contDir, { recursive: true })
    await fs.mkdir(tempFileDir, { recursive: true })
    await fs.mkdir(tempLogDir, { recursive: true })
  }

  async upload({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { file } = await request.validateUsing(uploadFileValidator)
    const userId = user.id.toString()

    await this.ensureUserDirectories(userId)

    const userDir = this.getUserDir(userId)
    const tempFileDir = path.join(userDir, 'temp_file')
    const contDir = path.join(userDir, 'cont')

    const fileName = `${cuid()}.${file.extname}`
    await file.move(tempFileDir, { name: fileName })

    const tempFilePath = path.join(tempFileDir, fileName)
    const contFilePath = path.join(contDir, fileName)

    await fs.copyFile(tempFilePath, contFilePath)

    console.log(`File uploaded to: ${tempFilePath} and copied to: ${contFilePath}`)

    return response.created({ message: 'File uploaded successfully', path: tempFilePath })
  }

  async list({ auth, response }: HttpContext) {
    const user = auth.user!
    const userDir = this.getUserDir(user.id.toString())
    const tempFileDir = path.join(userDir, 'temp_file')

    try {
      const files = await fs.readdir(tempFileDir)
      return response.ok(files)
    } catch (error) {
      console.error(`Error listing files: ${error}`)
      return response.ok([])
    }
  }

  async read({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const userDir = this.getUserDir(user.id.toString())
    const tempFileDir = path.join(userDir, 'temp_file')
    const filePath = path.join(tempFileDir, params.fileId)

    try {
      await fs.access(filePath)
      return response.download(filePath)
    } catch {
      return response.notFound('File not found')
    }
  }

  async analyze({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const userDir = this.getUserDir(user.id.toString())
    const tempLogDir = path.join(userDir, 'temp_log')
    const logFile = path.join(tempLogDir, params.fileId.replace(/\.[^.]+$/, '.txt'))

    try {
      const analysisResult = await fs.readFile(logFile, 'utf-8')
      return response.ok({ result: analysisResult })
    } catch (error) {
      console.error('Error reading analysis result:', error)
      return response.internalServerError('Analysis result not available')
    }
  }

  async delete({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const userDir = this.getUserDir(user.id.toString())
    const tempFileDir = path.join(userDir, 'temp_file')
    const contDir = path.join(userDir, 'cont')
    const tempFilePath = path.join(tempFileDir, params.fileId)
    const contFilePath = path.join(contDir, params.fileId)

    try {
      await fs.unlink(tempFilePath)
      await fs.unlink(contFilePath)
      return response.ok({ message: 'File deleted successfully' })
    } catch (error) {
      console.error(`Error deleting file: ${error}`)
      return response.notFound('File not found')
    }
  }
}
