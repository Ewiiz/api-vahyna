/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import AuthController from "#controllers/auth_controller";
import ProductsController from "#controllers/products_controller";
import {middleware} from "#start/kernel";

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.post('register', [AuthController, 'register'])
router.post('login', [AuthController, 'login'])


router.group(() => {
  /*
  |--------------------------------------------------------------------------
  |  CRUD d'une template
  |--------------------------------------------------------------------------
  */
  router.resource('products', ProductsController).apiOnly()

}).use(middleware.auth())
