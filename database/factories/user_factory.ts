import factory from '@adonisjs/lucid/factories'
import User from '#models/user'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      email: faker.internet.email(),
      firstname: faker.internet.userName(),
      lastname: faker.internet.userName(),
      password: 'secret1234',
    }
  })
  .build()
