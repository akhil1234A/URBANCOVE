const Admin = require('../models/Admin');
const User = require('../models/User');
const { generateToken } = require('../services/authService');
const logger = require('../utils/logger');


//Admin : Login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
       
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(400).json({ message: 'Admin not found' });


        const isMatch = await admin.comparePassword(password);
 
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        
        const token = generateToken({ id: admin._id, role: 'admin' });
     
        res.json({ token });
    } catch (error) {
        logger.error(error.message)
        res.status(500).json({ message: 'Server error', error });
    }
};

//Admin : List All Users
exports.listUsers = async (req, res) => {
   try {
     const page = parseInt(req.query.page) || 1; 
     const limit = parseInt(req.query.limit) || 5; 
     const skip = (page - 1) * limit;
 
     const totalUsers = await User.countDocuments();
     const users = await User.find().skip(skip).limit(limit);
 
     res.json({
       users,
       currentPage: page,
       totalPages: Math.ceil(totalUsers / limit),
       totalUsers,
     });
   } catch (error) {
     res.status(500).json({ message: 'Server error' });
   }
 };
 

//Admin: Block a User
exports.blockUser = async(req,res)=>{
   try{
      const user = await User.findById(req.params.id);
      if(!user) return res.status(404).json({message: 'User not found'});

      user.isActive = !user.isActive;
      await user.save();

      res.json({message: `User has been ${user.isActive? 'unblocked': 'blocked'}`, isActive: user.isActive});
   } catch(error){
      logger.error(error.message);
      res.status(500).json({message: `Server error: ${error}`});
   }
}