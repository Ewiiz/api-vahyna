import vine, {SimpleMessagesProvider} from '@vinejs/vine'

/**
 * Validation l'inscription d'un utilisateur
 */
export const registerUserValidator = vine.compile(
  vine.object({
    firstname: vine.string().trim(),
    lastname: vine.string().trim(),
    email: vine.string().email().unique(async (db, value) => {
      try {
        const user = await db.from('users').where('email', value).first();
        return !user;
      } catch (error) {
        throw new Error("Erreur lors de la vérification de l'unicité de l'e-mail.");
      }
    }),
    password: vine.string().minLength(8)
  })
)

registerUserValidator.messagesProvider = new SimpleMessagesProvider({
  'firstname.required': 'Veuillez fournir votre prénom.',
  'lastname.required': 'Veuillez fournir votre nom de famille.',
  'email.required': "Veuillez fournir une adresse e-mail.",
  'email.database.unique': `Cette adresse e-mail est déjà utilisée.`,
  'password.required': 'Veuillez fournir un mot de passe.',
  'password.minLength': 'Le mot de passe doit contenir au moins 8 caractères.',
})

