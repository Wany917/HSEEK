/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import InvoicesController from '#controllers/invoices_controller'
import router from '@adonisjs/core/services/router'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})
router.post('/invoice', [InvoicesController, 'createInvoice'])
router.get('/invoice', [InvoicesController, 'getAllInvoices'])
router.get('/invoice/:id', [InvoicesController, 'getInvoiceById'])
router.delete('/invoice/:id', [InvoicesController, 'deleteInvoice'])
router.put('/invoice/:id', [InvoicesController, 'updateInvoice'])
