import type { HttpContext } from '@adonisjs/core/http'
import { registerUserValidator } from '#validators/auth'
import User from '#models/user'
import { errors as authErrors } from '@adonisjs/auth'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const payload = await request.validateUsing(registerUserValidator)
    await User.create(payload)
    return response.created({
      message: `Bienvenue, ${payload.firstname} ! Votre compte a été créé avec succès.`,
    })
  }

  async login({ auth, request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    try {
      const user: User = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)
      return response.ok({ message: 'Connexion réussie', user })
    } catch (error) {
      if (error instanceof authErrors.E_INVALID_CREDENTIALS) {
        return response.status(400).json({
          message: "L'adresse e-mail ou le mot de passe est incorrect. Veuillez réessayer.",
        })
      }
      return response.status(500).json({
        message:
          "Une erreur s'est produite lors de la tentative de connexion. Veuillez réessayer plus tard.",
      })
    }
  }
}
