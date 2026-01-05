const offerService = require("./offer.service");

class PricingService {
  async calculateProductPrice(product) {
    const activeOffers = await offerService.getActiveOffersForPricing();
    return this.applyBestOffer(product, activeOffers);
  }

  async calculatePriceForProducts(products) {
    const activeOffers = await offerService.getActiveOffersForPricing();

    const updatedProducts = products.map((product) => ({
      ...product.toObject(),
      discountedPrice: this.applyBestOffer(product, activeOffers),
    }));


    return updatedProducts;
  }

  applyBestOffer(product, offers) {
    const subCategoryId = product.subCategory?._id || product.subCategory;


    const productOffer = offers.find(
      (offer) =>
        offer.type === "product" &&
        offer.products.some((id) => id.toString() === product._id.toString())
    );

    const categoryOffer = offers.find(
      (offer) =>
        offer.type === "category" &&
        offer.categories.some(
          (id) => id.toString() === subCategoryId?.toString()
        )
    );

    let productDiscount = 0;
    let categoryDiscount = 0;

    if (productOffer) {
      productDiscount =
        productOffer.discountType === "percentage"
          ? (product.price * productOffer.discountValue) / 100
          : productOffer.discountValue;
    }

    if (categoryOffer) {
      categoryDiscount =
        categoryOffer.discountType === "percentage"
          ? (product.price * categoryOffer.discountValue) / 100
          : categoryOffer.discountValue;
    }

    const discount = Math.max(productDiscount, categoryDiscount);
    const finalPrice = Math.max(product.price - discount, 0);

    return finalPrice;
  }
}

module.exports = new PricingService();
