import vine from '@vinejs/vine'

export const uploadValidator = vine.compile(
  vine.object({
    userId: vine.number().positive(),
    file: vine.any(),
  })
)

export function validateFile(file: any): boolean {
  if (!file || Array.isArray(file) || !file.tmpPath) {
    throw new Error('A file is required')
  }

  const allowedExtensions = ['py', 'js', 'txt', 'exe', 'bash', 'sh', 'bat']
  const extension = file.clientName.split('.').pop()
  if (!allowedExtensions.includes(extension)) {
    throw new Error('Invalid file type')
  }

  const maxSize = 2 * 1024 * 1024 // 2MB in bytes
  if (file.size > maxSize) {
    throw new Error('File size should not exceed 2MB')
  }

  return true
}
