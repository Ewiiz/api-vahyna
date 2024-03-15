import { DateTime } from 'luxon'
import { BaseModel, column, computed } from '@adonisjs/lucid/orm'
import env from '#start/env'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare details: string | null

  @column()
  declare price: string

  @column({ serializeAs: null })
  declare coverImage: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @computed()
  get getCoverImage() {
    const baseUrl = env.get('URL_API', 'http://localhost:3335')
    return `${baseUrl}/${this.coverImage}`
  }
}
