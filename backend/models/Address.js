const mongoose = require('mongoose');


const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postcode: { type: String, required: true },
  country: { type: String, required: true },
  phoneNumber: { 
    type: String, 
    required: true, 
    validate: {
      validator: function(v) {
        return /\d{10}/.test(v); 
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  isDefault: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
}, { timestamps: true });


const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
