const express = require('express');
const router = express.Router();
const stuffCtrl = require('../controllers/stuff');



router.get('/', stuffCtrl.getAllUsers);
router.get('/:id', stuffCtrl.getOneUser);
router.delete('/:id', stuffCtrl.deleteOneUser);

module.exports = router;