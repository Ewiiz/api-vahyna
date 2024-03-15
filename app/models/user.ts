import { DateTime } from 'luxon'
import { withAuthFinder } from '@adonisjs/auth'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import UserCart from '#models/user_cart'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Product from '#models/product'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare firstname: string

  @column()
  declare lastname: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column({ serializeAs: null })
  declare isAdmin: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => UserCart)
  declare cart: HasMany<typeof UserCart>

  async getCartProducts() {
    await this.load('cart')
    const userCart = this.cart
    const products = []

    for (const item of userCart) {
      const product = await Product.findOrFail(item.productId)
      products.push({
        id: product.id,
        title: product.title,
        details: product.details,
        price: product.price,
        coverImage: product.coverImage,
      })
    }

    return products
  }
}
