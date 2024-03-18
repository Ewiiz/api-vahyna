import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    const user = ctx.auth.use('web').user

    if (!user) {
      return ctx.response.unauthorized({
        message: 'Vous devez être connecté pour accéder à cette ressource.',
      })
    }
    // Vérifier si l'utilisateur est un administrateur
    if (!user.isAdmin) {
      return ctx.response.forbidden({
        message: "Vous n'avez pas les autorisations suffisantes pour accéder à cette ressource.",
      })
    }

    // Si l'utilisateur est connecté et est un administrateur, passer à l'étape suivante
    await next()
  }
}
