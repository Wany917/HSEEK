import type { HttpContext } from '@adonisjs/core/http'
import fs from 'node:fs/promises'
import path from 'node:path'
import app from '@adonisjs/core/services/app'
import { uploadFileValidator } from '#validators/file'
import cuid from 'cuid'
import ScanResult from '#models/scan_result'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

export default class FilesController {
  private async isDockerContainerRunning(userId: string): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`docker ps -q --filter name=c1_user_${userId}`)
      return stdout.trim() !== ''
    } catch (error) {
      console.error('Error checking Docker container status:', error)
      return false
    }
  }

  private getUserDir(userId: string) {
    return path.join(app.makePath('/home/debian/data/'), userId)
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
    const userDir = this.getUserDir(userId)

    try {
      // Vérifier si le dossier utilisateur existe déjà
      const dirExists = await fs
        .access(userDir)
        .then(() => true)
        .catch(() => false)
      if (dirExists) {
        // Supprimer le dossier existant
        await fs.rm(userDir, { recursive: true, force: true })
        console.log(`Existing directory removed: ${userDir}`)
      }

      // Créer les nouveaux répertoires
      await this.ensureUserDirectories(userId)

      const tempFileDir = path.join(userDir, 'temp_file')
      const contDir = path.join(userDir, 'cont')

      const fileName = `${cuid()}.${file.extname}`
      await file.move(tempFileDir, { name: fileName })

      const tempFilePath = path.join(tempFileDir, fileName)
      const contFilePath = path.join(contDir, fileName)

      await fs.copyFile(tempFilePath, contFilePath)

      console.log(`File uploaded to: ${tempFilePath} and copied to: ${contFilePath}`)

      return response.created({ message: 'File uploaded successfully', path: tempFilePath })
    } catch (error) {
      console.error('Error during file upload:', error)
      return response.internalServerError('Failed to upload file')
    }
  }

  async list({ auth, response }: HttpContext) {
    const user = auth.user!

    try {
      const results = await ScanResult.query().where('userId', user.id).orderBy('createdAt', 'desc')

      return response.ok(results)
    } catch (error) {
      console.error(`Error listing analysis results: ${error}`)
      return response.internalServerError('Unable to retrieve analysis results')
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

  async getAnalysisResult({ auth, params, response }: HttpContext) {
    const user = auth.user!

    try {
      const result = await ScanResult.query()
        .where('userId', user.id)
        .where('id', params.id)
        .firstOrFail()

      return response.ok(result)
    } catch (error) {
      console.error(`Error retrieving analysis result: ${error}`)
      return response.notFound('Analysis result not found')
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

  private parseAnalysisResult(result: string) {
    const lines = result.split('\n')
    const parsedResult: any = {}

    lines.forEach((line) => {
      const [key, value] = line.split(':').map((s) => s.trim())
      switch (key) {
        case 'Known viruses':
          parsedResult.knownViruses = Number.parseInt(value)
          break
        case 'Engine version':
          parsedResult.engineVersion = value
          break
        case 'Scanned directories':
          parsedResult.scannedDirectories = Number.parseInt(value)
          break
        case 'Scanned files':
          parsedResult.scannedFiles = Number.parseInt(value)
          break
        case 'Infected files':
          parsedResult.infectedFiles = Number.parseInt(value)
          break
        case 'Data scanned':
          parsedResult.dataScanned = Number.parseFloat(value.split(' ')[0])
          break
        case 'Data read':
          parsedResult.dataRead = Number.parseFloat(value.split(' ')[0])
          break
        case 'Time':
          parsedResult.scanTime = Number.parseFloat(value.split(' ')[0])
          break
        case 'Start Date':
          parsedResult.startDate = new Date(value)
          break
        case 'End Date':
          parsedResult.endDate = new Date(value)
          break
      }
    })

    return parsedResult
  }

  async checkAnalysisResult({ auth, response }: HttpContext) {
    const user = auth.user!
    const userId = user.id.toString()
    const userDir = this.getUserDir(userId)
    const tempLogDir = path.join(userDir, 'temp_log')

    try {
      // Vérifier si le conteneur Docker est toujours en cours d'exécution
      const isContainerRunning = await this.isDockerContainerRunning(userId)

      if (isContainerRunning) {
        return response.ok({ message: 'Analysis is still in progress.' })
      }

      // Vérifier si le répertoire utilisateur existe
      const dirExists = await fs
        .access(userDir)
        .then(() => true)
        .catch(() => false)
      if (!dirExists) {
        return response.ok({
          message: 'Analysis results not available. The directory may have been cleaned up.',
        })
      }

      // Attendre un court instant pour s'assurer que le fichier de log est complètement écrit
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Lire les fichiers du répertoire de logs
      const files = await fs.readdir(tempLogDir)
      if (files.length === 0) {
        return response.ok({ message: 'No analysis results found.' })
      }

      // Trier les fichiers par date de modification (le plus récent en premier)
      const sortedFiles = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(tempLogDir, file)
          const stats = await fs.stat(filePath)
          return { name: file, mtime: stats.mtime }
        })
      )
      sortedFiles.sort((a, b) => b.mtime.getTime() - a.mtime.getTime())

      const mostRecentFile = sortedFiles[0].name
      const logFile = path.join(tempLogDir, mostRecentFile)
      const analysisResult = await fs.readFile(logFile, 'utf-8')

      const parsedResult = this.parseAnalysisResult(analysisResult)

      // Stocker les résultats en utilisant le modèle
      const scanResult = await ScanResult.create({
        userId,
        filename: mostRecentFile,
        ...parsedResult,
        fullLog: analysisResult,
      })

      // Nettoyer les répertoires
      await fs.rm(userDir, { recursive: true, force: true })

      return response.ok({
        message: 'Analysis completed and results stored.',
        result: scanResult,
      })
    } catch (error) {
      console.error(`Error checking analysis result for user ${userId}:`, error)
      return response.internalServerError('Error checking analysis result')
    }
  }
}
