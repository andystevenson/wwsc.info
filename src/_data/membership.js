const stripeJoin = require("../../.cache/stripe/join.json");
const { cloneDeep } = require("lodash");

const getPrices = () => {
  const clone = cloneDeep(stripeJoin);
  const simplified = clone.categories.map((category) => {
    let { products } = category;
    products = products.map((product) => {
      const prices = product.prices.map((price) => {
        const { paymentLink, nickname } = price;
        console.log("membership", nickname);
        const { id, active, url } = paymentLink;
        const link = { id, active, url };
        price.link = link;
        delete price.paymentLink;
        return price;
      });
      product.prices = prices;
      return product;
    });
    return category;
  });
  return simplified;
};

module.exports = getPrices();
