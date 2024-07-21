import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'scan_results'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('filename').notNullable()
      table.integer('known_viruses').unsigned()
      table.string('engine_version')
      table.integer('scanned_directories').unsigned()
      table.integer('scanned_files').unsigned()
      table.integer('infected_files').unsigned()
      table.float('data_scanned').unsigned()
      table.float('data_read').unsigned()
      table.float('scan_time').unsigned()
      table.datetime('start_date')
      table.datetime('end_date')
      table.text('full_log')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
