/**
 * Constants for response messages
 * @constant
 */
const Messages = {
  // Admin Authentication
  ADMIN_NOT_FOUND: "Admin not found",
  INVALID_CREDENTIALS: "Invalid credentials",

  // User Management
  USER_NOT_FOUND: "User not found",
  USER_BLOCKED: "User has been blocked",
  USER_UNBLOCKED: "User has been unblocked",

  // Category Management
  CATEGORY_NOT_FOUND: "Category not found",
  CATEGORY_REQUIRED: "Category name is required",
  CATEGORY_INVALID: "Category name should contain only letters",
  CATEGORY_EXISTS: "Category already exists",
  CATEGORY_ADDED: "New category added successfully",
  CATEGORY_UPDATED: "Category updated successfully",
  CATEGORY_SOFT_DELETED: "Category has been soft deleted",

  // Subcategory Management
  SUBCATEGORY_NOT_FOUND: "Subcategory not found",
  SUBCATEGORY_EXISTS:
    "A subcategory with the same name and category already exists",
  SUBCATEGORY_ADDED: "Subcategory added successfully",
  SUBCATEGORY_UPDATED: "Subcategory updated successfully",
  SUBCATEGORY_TOGGLED: "Subcategory {status} successfully",

  // Coupon Management
  COUPON_NOT_FOUND: "Coupon not found or active",
  COUPON_EXISTS: "Coupon already exists",
  COUPON_ADDED: "Coupon added successfully",
  COUPON_DELETED: "Coupon deleted successfully",
  COUPON_EXPIRED: "Coupon has expired",

  // Offer Management
  OFFER_NOT_FOUND: "Offer not found",
  OFFER_ADDED: "Offer created successfully",
  OFFER_UPDATED: "Offer updated successfully",
  OFFER_TOGGLED: "Offer {status} successfully",

  // Product Management
  PRODUCT_NOT_FOUND: "Product not found",
  PRODUCT_MIN_IMAGES: "At least 3 images are required",
  PRODUCT_ONE_IMAGE_REQUIRED: "Select at least one image",
  CATEGORY_INACTIVE:
    "Cannot list product because the associated category is inactive",
  SUBCATEGORY_INACTIVE:
    "Cannot list product because the associated sub-category is inactive",
  PRODUCT_TOGGLED: "Product has been {status}",

  // Order Management
  ORDER_NOT_FOUND: "Order not found",
  CANNOT_CANCEL_SHIPPED_DELIVERED:
    "Cannot cancel an order that is shipped or delivered",
  ORDER_STATUS_UPDATED: "Order status updated successfully",

  // Sales Report
  INVALID_PERIOD:
    "Invalid period specified. Choose from daily, weekly, monthly, or custom",
  INVALID_DATE_RANGE: "Both startDate and endDate must be provided",
  NO_SALES_DATA: "No sales data found for this period",

  // General
  SERVER_ERROR: "Server error",
  IMAGE_PROCESSING_FAILED: "Image processing failed",
  FAILED_TO_FETCH_CATEGORIES: "Failed to fetch categories",
  FAILED_TO_FETCH_SUBCATEGORIES: "Failed to fetch subcategories",
  FAILED_TO_FETCH_ORDERS_CHART: "Failed to fetch orders chart data",
  FAILED_TO_FETCH_TOP_PRODUCTS: "Failed to fetch top-selling products",
  FAILED_TO_FETCH_TOP_CATEGORIES: "Failed to fetch top-selling categories",

  //Address
  ADDRESS_NOT_FOUND: "Address not found",
  INSUFFICIENT_STOCK: "Insufficient stock for the product",
  CART_ITEM_NOT_FOUND: "Cart item not found",
  USER_ALREADY_EXISTS: "User already exists with this email",
  USER_NOT_FOUND: "User not found",
};

module.exports = Messages;
