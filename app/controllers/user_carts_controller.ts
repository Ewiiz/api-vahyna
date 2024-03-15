import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import { addProductToCartValidator } from '#validators/user_cart'
import UserCart from '#models/user_cart'

export default class UserCartsController {
  /**
   * Display a list of resource
   */
  async index({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    // Récupérer les produits dans le panier de l'utilisateur
    const productInsideCart = await UserCart.query().where('userId', user.id).exec()

    // Construire un tableau avec les informations requises pour chaque produit
    const productsInfo = await Promise.all(
      productInsideCart.map(async (item: UserCart) => {
        const productId: number = item.productId // Accès à la propriété productId
        const product: Product = await Product.findOrFail(productId)
        const quantity: number = item.quantity // Accès à la propriété quantity
        const price: number = Number.parseFloat(product.price)
        let total: number = price * quantity // Calculer le total du produit
        total = Number(total.toFixed(2))
        return {
          name: product.title,
          coverImage: product.getCoverImage,
          price: product.price,
          quantity,
          total,
        }
      })
    )

    let totalGeneral: number = productsInfo.reduce((acc, curr) => acc + curr.total, 0)
    totalGeneral = Number(totalGeneral.toFixed(2)) // Limiter le total général à deux chiffres après la virgule

    // Retourner le tableau des informations sur les produits
    return response.ok({ productsInfo, totalGeneral })
  }

  /**
   * Handle form submission for the create action
   */
  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { productId, quantity } = await request.validateUsing(addProductToCartValidator)
    // Ajouter le produit au panier de l'utilisateur
    await user.related('cart').create({ productId, quantity })

    return response.created({
      message: 'Le produit a été ajouté au panier avec succès',
    })
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({ auth, params, response }: HttpContext) {
    const id: number = Number(params.id)
    const user = auth.getUserOrFail()
    if (!id) return response.badRequest({ message: "L'identifiant est requis pour cette requête." })

    try {
      // Récupérer le produit à supprimer
      const productToDelete: UserCart = await UserCart.query()
        .where('user_id', user.id)
        .andWhere('product_id', id)
        .firstOrFail()

      console.log(productToDelete)
      // Supprimer le produit du panier de l'utilisateur
      await productToDelete.delete()

      return response.ok({
        message: `Le produit a bien été supprimé du panier.`,
      })
    } catch (error) {
      // Si le produit n'a pas été trouvé dans le panier de l'utilisateur
      return response.notFound({
        message: "Le produit demandé n'a pas été trouvé dans votre panier.",
      })
    }
  }
}
