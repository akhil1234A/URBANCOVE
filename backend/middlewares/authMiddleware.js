const { verifyToken } = require('../services/authService');

exports.adminAuth = (req, res, next) => {
   if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
   const token = req.header('Authorization').replace('Bearer ', '');
   

   try {
      const decoded = verifyToken(token);
      if (decoded.role !== 'admin') throw new Error();
      req.admin = decoded;
      next();
   } catch (err) {
      console.log('error',err)
      res.status(401).json({ message: 'Authentication failed' });
   }
};
