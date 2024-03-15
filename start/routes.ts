/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

const AuthController = () => import('#controllers/auth_controller')
const ProductsController = () => import('#controllers/products_controller')
import { middleware } from '#start/kernel'

const ImagesController = () => import('#controllers/images_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.post('register', [AuthController, 'register'])
router.post('login', [AuthController, 'login'])

router
  .group(() => {
    /*
    |--------------------------------------------
    |  CRUD d'une template
    |--------------------------------------------
    */
    router.resource('products', ProductsController).apiOnly()

    /*
    |--------------------------------------------
    |  Pour renvoyé les images d'un produit
    |--------------------------------------------
    */
    router.get('uploads/products/:imageName', [ImagesController, 'getImagesForProducts'])
  })
  .use(middleware.auth())
