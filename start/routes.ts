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

const UserCartsController = () => import('#controllers/user_carts_controller')

const ImagesController = () => import('#controllers/images_controller')

router.get('/', async () => {
  return {
    API_BY: 'CODE-HIVE !!!',
  }
})

router.post('register', [AuthController, 'register'])
router.post('login', [AuthController, 'login'])

router
  .group(() => {
    /*
    |--------------------------------------------
    | Authentification session utilisateur
    |--------------------------------------------
    */
    router.post('logout', [AuthController, 'logout'])
    router.get('check', [AuthController, 'check'])
    /*
    |--------------------------------------------
    |  CRUD d'une template partie ADMIN
    |--------------------------------------------
    */
    router
      .group(() => {
        router.post('/products', [ProductsController, 'store'])
        // router.put('/products/:id', [ProductsController, 'update'])
        // router.patch('/products/:id', [ProductsController, 'update'])
        router.delete('/products/:id', [ProductsController, 'destroy'])
      })
      .use(middleware.admin())

    /*
    |--------------------------------------------
    |  CRUD du panier
    |--------------------------------------------
    */
    router.resource('cart', UserCartsController).apiOnly()
  })
  .use(middleware.auth())

/*
|--------------------------------------------
|  Renvoie des produits pour les clients
|--------------------------------------------
*/
router.get('/products/', [ProductsController, 'index'])
router.get('/products/:id', [ProductsController, 'show'])

/*
|--------------------------------------------
|  Pour renvoyer les images de tous les produits
|--------------------------------------------
*/
router.get('uploads/products/:imageName', [ImagesController, 'getImagesForProducts'])
