// app/models/scan_result.ts

import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class ScanResult extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare filename: string

  @column()
  declare knownViruses: number

  @column()
  declare engineVersion: string

  @column()
  declare scannedDirectories: number

  @column()
  declare scannedFiles: number

  @column()
  declare infectedFiles: number

  @column()
  declare dataScanned: number

  @column()
  declare dataRead: number

  @column()
  declare scanTime: number

  @column.dateTime()
  declare startDate: DateTime

  @column.dateTime()
  declare endDate: DateTime

  @column()
  declare fullLog: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
