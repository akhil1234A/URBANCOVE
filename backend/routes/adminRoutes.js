const express = require('express');
const { login, listUsers, blockUser } = require('../controllers/admin/adminController');
const {adminAuth} = require('../middlewares/authMiddleware')
const router = express.Router();
router.post('/login', login);
router.get('/users', adminAuth, listUsers);
router.put('/users/:id/block',adminAuth,blockUser);
module.exports = router;
