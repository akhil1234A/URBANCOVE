const Admin = require('../../models/Admin');
const User = require('../../models/User');
const { generateToken } = require('../../services/authService');
const logger = require('../../utils/logger');
const httpStatus = require('../../constants/httpStatus');
const Messages = require('../../constants/messages');


/**
 * Admin Login 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
       
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(httpStatus.BAD_REQUEST).json({ message: Messages.ADMIN_NOT_FOUND });


        const isMatch = await admin.comparePassword(password);

        if (!isMatch) return res.status(httpStatus.BAD_REQUEST).json({ message: Messages.INVALID_CREDENTIALS });

        
        const token = generateToken({ id: admin._id, role: 'admin' });
     
        res.json({ token });
    } catch (error) {
        logger.error(error.message)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.SERVER_ERROR, error });
    }
};

/**
 * List all users with pagination 
 * @param {*} req 
 * @param {*} res 
 */
exports.listUsers = async (req, res) => {
   try {
     const page = parseInt(req.query.page) || 1; 
     const limit = parseInt(req.query.limit) || 5; 
     const skip = (page - 1) * limit;
 
     const totalUsers = await User.countDocuments();
     const users = await User.find().select('_id name email password isActive isVerified').skip(skip).limit(limit);
 
     res.json({
       users,
       currentPage: page,
       totalPages: Math.ceil(totalUsers / limit),
       totalUsers,
     });
   } catch (error) {
     res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.SERVER_ERROR });
   }
 };
 

/**
 * Admin Block or Unblock a user
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.blockUser = async(req,res)=>{
   try{
      const user = await User.findById(req.params.id);
      if(!user) return res.status(httpStatus.NOT_FOUND).json({message: Messages.USER_NOT_FOUND});

      user.isActive = !user.isActive;
      await user.save();

      res.json({message: `User has been ${user.isActive? 'unblocked': 'blocked'}`, isActive: user.isActive});
   } catch(error){
      logger.error(error.message);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: Messages.SERVER_ERROR});
   }
}