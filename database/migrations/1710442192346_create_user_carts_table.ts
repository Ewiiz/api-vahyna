import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_carts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.foreign('user_id').references('users.id').onDelete('CASCADE')
      table.foreign('product_id').references('products.id').onDelete('CASCADE')
      table.integer('quantity').notNullable().unsigned()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
