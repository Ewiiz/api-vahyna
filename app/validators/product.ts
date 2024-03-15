import vine, { SimpleMessagesProvider } from '@vinejs/vine'

export const createProductValidator = vine.compile(
  vine.object({
    title: vine.string().trim(),
    details: vine.string().trim().minLength(5).maxLength(500).optional(),
    price: vine.string().transform((value) => {
      const parsedPrice = Number.parseFloat(value.replace(',', '.'))
      if (Number.isNaN(parsedPrice)) {
        return false
      }
      return parsedPrice.toFixed(2)
    }),
    coverImage: vine.file({ extnames: ['jpg', 'png'], size: '6mb' }),
  })
)

createProductValidator.messagesProvider = new SimpleMessagesProvider({
  'title.required': 'Le titre est requis.',
  'title.minLength': 'Le titre doit contenir au moins 5 caractères.',
  'title.maxLength': 'Le titre ne peut pas dépasser 50 caractères.',
  'details.required': 'Les détails sont requis.',
  'details.minLength': 'Les détails doivent contenir au moins 10 caractères.',
  'details.maxLength': 'Les détails ne peuvent pas dépasser 500 caractères.',
  'price.required': 'Le prix est requis.',
  'price.transform': 'Le prix doit être un nombre décimal.',
  'coverImage.required': "L'image de couverture est requise.",
  'coverImage.extnames': "L'image de couverture doit être au format JPG ou PNG.",
  'coverImage.size': "La taille de l'image de couverture ne peut pas dépasser 6 Mo.",
})
