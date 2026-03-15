const router = require('express').Router();
const ctrl   = require('../controllers/invoice.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { invoiceSchema } = require('../validators/shipment.validator');

router.use(protect);
router.get('/',             ctrl.getAll);
router.get('/:id',          ctrl.getOne);
router.post('/',            validate(invoiceSchema), ctrl.create);
router.patch('/:id/status', ctrl.setStatus);
router.delete('/:id',       adminOnly, ctrl.remove); // ADMIN only
module.exports = router;
