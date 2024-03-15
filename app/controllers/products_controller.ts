import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import { createProductValidator } from '#validators/product'
import app from '@adonisjs/core/services/app'

export default class ProductsController {
  /**
   * Display a list of resource
   */
  async index({ response }: HttpContext) {
    const products = await Product.all()
    return response.ok({ products })
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response }: HttpContext) {
    const { title, details, price, coverImage } =
      await request.validateUsing(createProductValidator)

    await coverImage.move(app.makePath(`uploads/products`), {
      name: `${coverImage.clientName}`,
    })

    if (!price) return response.badRequest({ message: 'Le prix doit être un nombre.' })

    const filePath: string = `uploads/products/${coverImage.fileName}`
    try {
      const product: Product = await Product.create({
        title,
        details,
        price,
        coverImage: filePath,
      })

      return response.created({ message: 'Produit créé avec succès.', product })
    } catch (error) {
      return response.status(500).json({
        message:
          "Une erreur s'est produite lors de la création du produit. Veuillez réessayer plus tard.",
      })
    }
  }

  /**
   * Show individual record
   */
  async show({ params, response }: HttpContext) {
    const id: number = Number(params.id)
    if (!id) return response.badRequest({ message: "L'identifiant est requis pour cette requête." })

    try {
      const product = await this.findOneProduct(id)
      return response.ok({ product })
    } catch (error) {
      return response.notFound({ message: "Le product demandé n'a pas été trouvé." })
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    const id: number = Number(params.id)
    if (!id) return response.badRequest({ message: "L'identifiant est requis pour cette requête." })

    try {
      const productToDelete: Product = await this.findOneProduct(id)
      await productToDelete.delete()
      return response.ok({ message: `Le produit '${productToDelete.title}' a bien été supprimé.` })
    } catch (error) {
      return response.notFound({ message: "Le product demandé n'a pas été trouvé." })
    }
  }

  private async findOneProduct(id: number) {
    return await Product.findByOrFail('id', id)
  }
}
