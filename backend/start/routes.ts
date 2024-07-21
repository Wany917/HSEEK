/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
const UsersController = () => import('#controllers/users_controller')
const FoldersController = () => import('#controllers/folders_controller')
const FilesController = () => import('#controllers/files_controller')

const InvoicesController = () => import('#controllers/invoices_controller')

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'

router.get('/swagger', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})

router.get('/docs', async () => {
  return AutoSwagger.default.ui('/swagger', swagger)
})

router
  .group(() => {
    router.post('register', [UsersController, 'register'])
    router.post('login', [UsersController, 'login'])
    router.get('me', [UsersController, 'me']).use(middleware.auth())
  })
  .prefix('auth')

router
  .group(() => {
    router.post('/', [FoldersController, 'create']).use(middleware.auth())
    router.put('/:folderId', [FoldersController, 'modify']).use(middleware.auth())
    router.delete('/:folderId', [FoldersController, 'delete']).use(middleware.auth())
  })
  .prefix('folders')

router
  .group(() => {
    router.post('/', [FilesController, 'upload']).use(middleware.auth())
    router.get('/', [FilesController, 'list']).use(middleware.auth())
    router.get('/:fileId', [FilesController, 'read']).use(middleware.auth())
    router.get('/analyze/:fileId', [FilesController, 'analyze']).use(middleware.auth())
    router.delete('/:fileId', [FilesController, 'delete']).use(middleware.auth())
  })
  .prefix('files')

router
  .group(() => {
    router.post('/', [InvoicesController, 'createInvoice']).use(middleware.auth())
    router.get('/', [InvoicesController, 'getAllInvoices']).use(middleware.auth())
    router.get('/:id', [InvoicesController, 'getInvoiceById']).use(middleware.auth())
    router.delete('/:id', [InvoicesController, 'deleteInvoice']).use(middleware.auth())
    router.put('/:id', [InvoicesController, 'updateInvoice']).use(middleware.auth())
  })
  .prefix('invoices')

router.resource('users', UsersController).only(['index', 'show']).use('*', middleware.auth())
