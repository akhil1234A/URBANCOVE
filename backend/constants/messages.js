/**
 * Constants for response messages
 * @constant
 */
const Messages = {
  ADMIN_NOT_FOUND: 'Admin not found',
  INVALID_CREDENTIALS: 'Invalid credentials',
  SERVER_ERROR: 'Server error',
  USER_NOT_FOUND: 'User not found',
  USER_BLOCKED: 'User has been blocked',
  USER_UNBLOCKED: 'User has been unblocked',
  ORDER_NOT_FOUND: 'Order not found',
  CANNOT_CANCEL_SHIPPED_DELIVERED: 'Cannot cancel an order that has been shipped or delivered',
};

module.exports = Messages;