import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory } from '#database/factories/user_factory'

test.group('Users | Register', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('ensure user can register', async ({ client }) => {
    const response = await client.post('register').json({
      email: 'test@example.com',
      firstname: 'john',
      lastname: 'Doe',
      password: '12345678',
    })

    response.assertStatus(201)
  })

  test('ensure user cannot register with an existing email', async ({ client }) => {
    await UserFactory.merge({ email: 'test@example.com' }).create()

    const response = await client.post('register').json({
      email: 'test@example.com',
      firstname: 'john',
      lastname: 'Doe',
      password: '12345678',
    })

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          field: 'email',
          rule: 'database.unique',
          message: 'Cette adresse e-mail est déjà utilisée.',
        },
      ],
    })
  })

  test('ensure user cannot register with an invalid email', async ({ client }) => {
    const response = await client.post('register').json({
      email: 'test.com',
      firstname: 'john',
      lastname: 'Doe',
      password: '12345678',
    })

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          field: 'email',
          rule: 'email',
          message: 'Veuillez fournir une adresse e-mail valide.',
        },
      ],
    })
  })

  test('ensure user cannot register with short password', async ({ client }) => {
    const response = await client.post('register').json({
      email: 'test@example.com',
      firstname: 'john',
      lastname: 'Doe',
      password: '1234567',
    })

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          field: 'password',
          rule: 'minLength',
          message: 'Le mot de passe doit contenir au moins 8 caractères.',
        },
      ],
    })
  })
})
