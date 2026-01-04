const Address = require('../../models/Address');
const httpStatus = require('../../constants/httpStatus');
const Messages = require('../../constants/messages');

/**
 * User: Add a new address
 * @param {*} req 
 * @param {*} res 
 */
const addAddress = async (req, res) => {
  try {
    const { street, city, state, postcode, country, phoneNumber, isDefault } = req.body;
    const userId = req.user.id; 

    // If the new address is set as default, update the user's other addresses to non-default
    if (isDefault) {
      await Address.updateMany({ user: userId }, { isDefault: false });
    }

    const newAddress = new Address({
      street,
      city,
      state,
      postcode,
      country,
      phoneNumber,
      isDefault,
      user: userId
    });

    await newAddress.save();
    res.status(httpStatus.CREATED).json({ success: true, message: 'Address added successfully', address: newAddress });
  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to add address', error: error.message });
  }
};

/**
 * User: Get all addresses for a user
 * @param {*} req 
 * @param {*} res 
 */
const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await Address.find({ user: userId });



    res.status(httpStatus.OK).json({ success: true, addresses });
  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to retrieve addresses', error: error.message });
  }
};

/**
 * User: Update an address
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { street, city, state, postcode, country, phoneNumber, isDefault } = req.body;
    const userId = req.user.id;

    // Ensure the address belongs to the user
    const address = await Address.findOne({ _id: addressId, user: userId });

    if (!address) {
      return res.status(httpStatus.NOT_FOUND).json({ success: false, message: Messages.ADDRESS_NOT_FOUND });
    }

    // If the new address is set as default, update other addresses to non-default
    if (isDefault) {
      await Address.updateMany({ user: userId }, { isDefault: false });
    }

    address.street = street;
    address.city = city;
    address.state = state;
    address.postcode = postcode;
    address.country = country;
    address.phoneNumber = phoneNumber;
    address.isDefault = isDefault;

    await address.save();
    res.status(httpStatus.OK).json({ success: true, message: 'Address updated successfully', address });
  } catch (error) {
    
    res.status(500).json({ success: false, message: 'Failed to update address', error: error.message });
  }
};

//User: Delete an Address
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user.id;
   
   
    const address = await Address.findOneAndDelete({ _id: addressId, user: userId });

    if (!address) {
      return res.status(httpStatus.NOT_FOUND).json({ success: false, message: Messages.ADDRESS_NOT_FOUND });
    }

    res.status(200).json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to delete address', error: error.message });
  }
};


module.exports = {
  addAddress,
  getUserAddresses,
  updateAddress,
  deleteAddress
};
