import File from '#models/file'
import { HttpContext } from '@adonisjs/core/http';
import { uploadValidator, validateFile } from '#validators/upload'
import { cuid } from '@adonisjs/core/build/standalone/helpers'

export default class FilesController {
  public async uploadFile({ request, response }: HttpContext) {
    const payload = await request.validate(uploadValidator);
    const file = request.file('file', {
      size: '2mb',
      extnames: ['jpg', 'png', 'txt', 'pdf']
    })

    if (!file || !file.isValid) {
      return response.badRequest(file?.errors || 'Invalid file upload')
    }

    try {
      validateFile(file); // Utilisez la fonction de validation personnalisée pour des vérifications supplémentaires
    } catch (error) {
      return response.badRequest(error.message);
    }

    const fileName = `${cuid()}.${file.extname}`

    await file.move(Application.tmpPath('uploads'), {
      name: fileName
    })

    const newFile = await File.create({
      userId: payload.userId,
      fileName: file.clientName,
      filePath: Application.tmpPath('uploads', fileName),
      fileType: file.type,
    })

    return response.created({ message: 'File uploaded successfully', data: newFile })
  }
}