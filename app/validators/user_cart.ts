import vine, { SimpleMessagesProvider } from '@vinejs/vine'

export const addProductToCartValidator = vine.compile(
  vine.object({
    productId: vine.number().exists(async (db, productId) => {
      try {
        return await db.from('products').where('id', productId).first()
      } catch (error) {
        return false
      }
    }),
    quantity: vine.number().min(1),
  })
)

addProductToCartValidator.messagesProvider = new SimpleMessagesProvider({
  'productId.database.exists': "Le produit avec l'ID spécifié n'existe pas.",
  'productId.number': 'Veuillez entrer un nombre valide.',
  'productId.required': "L'id du produit est requis.",
  'quantity.required': 'La quantité est requise.',
  'quantity.number': 'Veuillez entrer un nombre valide.',
  'quantity.min': "La quantité doit être d'au moins 1.",
})
