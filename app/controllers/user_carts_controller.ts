import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import { addProductToCartValidator, updateProductInCartValidator } from '#validators/user_cart'
import UserCart from '#models/user_cart'

type ProductInfo = {
  productId: number
  name?: string
  coverImage?: string
  price: string
  quantity: number
  total: number
}

export default class UserCartsController {
  /**
   * Display a list of resource
   */
  async index({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const userCartItems = await this.getProductsInCart(user.id)
    const { productsInfo, totalGeneral } = await this.calculateCart(userCartItems, true, false)

    // Retourner le tableau des informations sur les produits
    return response.ok({ productsInfo, totalGeneral })
  }

  /**
   * Handle form submission for the create action
   */
  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { productId, quantity } = await request.validateUsing(addProductToCartValidator)

    // Vérifier si le produit est déjà dans le panier de l'utilisateur
    const existingCartItem = await UserCart.query()
      .where('userId', user.id)
      .where('productId', productId)
      .first()

    if (existingCartItem) {
      return response.conflict({
        message: 'Le produit est déjà dans votre panier',
      })
    } else {
      await user.related('cart').create({ productId, quantity })

      return response.created({
        message: 'Le produit a été ajouté au panier avec succès',
      })
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ auth, params, request, response }: HttpContext) {
    const userId = auth.getUserOrFail().id
    const productId = Number(params.id)
    if (Number.isNaN(productId)) {
      return response.badRequest({
        message: "L'identifiant du produit est invalide.",
      })
    }
    const { quantity } = await request.validateUsing(updateProductInCartValidator)

    try {
      const cartItem = await UserCart.query()
        .where('userId', userId)
        .andWhere('productId', productId)
        .firstOrFail()

      cartItem.quantity = quantity
      await cartItem.save()

      const userCartItems = await this.getProductsInCart(userId)
      const { productsInfo, totalGeneral } = await this.calculateCart(userCartItems, false, false)

      const updatedProductInfo = productsInfo.find((product) => product.productId === productId)

      if (updatedProductInfo) {
        return response.ok({ updatedProductInfo, totalGeneral })
      } else {
        return response.notFound({
          message: "Le produit demandé n'a pas été trouvé dans votre panier.",
        })
      }
    } catch (error) {
      return response.notFound({
        message: "Le produit demandé n'a pas été trouvé dans votre panier.",
      })
    }
  }

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

  getProductInfo({
    product,
    quantity,
    total,
    withName = false,
    withCoverImage = false,
  }: {
    product: Product
    quantity: number
    total: number
    withName?: boolean
    withCoverImage?: boolean
  }): ProductInfo {
    const productInfo: ProductInfo = {
      productId: product.id,
      price: product.price,
      quantity,
      total,
    }

    if (withName) {
      productInfo.name = product.title
    }

    if (withCoverImage) {
      productInfo.coverImage = product.getCoverImage
    }

    return productInfo
  }

  async getProductsInCart(userId: number): Promise<UserCart[]> {
    return await UserCart.query().where('userId', userId).exec()
  }

  async calculateCart(
    userCartItems: UserCart[],
    withName = false,
    withCoverImage = false
  ): Promise<{
    productsInfo: ProductInfo[]
    totalGeneral: number
  }> {
    // Construire un tableau avec les informations requises pour chaque produit
    const productsInfo = await Promise.all(
      userCartItems.map(async (item: UserCart) => {
        const productId: number = item.productId // Accès à la propriété productId
        const product: Product = await Product.findOrFail(productId)
        const quantity: number = item.quantity // Accès à la propriété quantity
        const price: number = Number.parseFloat(product.price)
        let total: number = price * quantity // Calculer le total du produit
        total = Number(total.toFixed(2))
        return this.getProductInfo({
          product,
          quantity,
          total,
          withName,
          withCoverImage,
        })
      })
    )

    let totalGeneral: number = productsInfo.reduce((acc, curr) => acc + curr.total, 0)
    totalGeneral = Number(totalGeneral.toFixed(2)) // Limiter le total général à deux chiffres après la virgule

    return { productsInfo, totalGeneral }
  }
}
