import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

export default class ImagesController {
  async getImagesForProducts({ params, response }: HttpContext) {
    const basePath = 'uploads/products'
    const imagePath: string = app.makePath(basePath, params.imageName)
    console.log(imagePath)
    return response.download(imagePath)
  }
}
