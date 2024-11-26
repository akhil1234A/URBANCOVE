const express = require('express');
const { login, listUsers, blockUser } = require('../controllers/adminController');
const {adminAuth} = require('../middlewares/authMiddleware')
const router = express.Router();

//Admin: User Management Routes
//admin auth
router.post('/login', login);


//user management
router.get('/users', adminAuth, listUsers);
router.put('/users/:id/block',adminAuth,blockUser);





module.exports = router;
