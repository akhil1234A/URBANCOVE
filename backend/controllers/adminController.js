const Admin = require('../models/Admin');
const User = require('../models/User');
const { generateToken } = require('../services/authService');

exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log('req body',req.body)

    try {
       
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(400).json({ message: 'Admin not found' });


        const isMatch = await admin.comparePassword(password);
 
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        
        const token = generateToken({ id: admin._id, role: 'admin' });
     
        res.json({ token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error });
    }
};


exports.listUsers = async(req,res)=>{
   try{
      const users = await User.find();
      res.json(users);
   } catch(error){
      res.status(500).json({message: 'Server error'});
   }
};

exports.blockUser = async(req,res)=>{
   try{
      // console.log('Headers: ',req.headers);
      const user = await User.findById(req.params.id);
      if(!user) return res.status(404).json({message: 'User not found'});

      user.isActive = !user.isActive;
      // console.log('debugging',user);
      await user.save();

      res.json({message: `User has been ${user.isActive? 'unblocked': 'blocked'}`, isActive: user.isActive});
   } catch(error){
      console.log(error);
      res.status(500).json({message: `Server error: ${error}`});
   }
}