const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const AdminSchema = new mongoose.Schema({
   email: { type: String, required: true, unique: true },
   password: { type: String, required: true },
});

AdminSchema.pre('save', async function(next) {
   if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
   }
   next();
});

AdminSchema.methods.comparePassword = async function(password) {
   return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Admin', AdminSchema);
