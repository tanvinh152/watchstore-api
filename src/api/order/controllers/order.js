const stripe = require("stripe")(process.env.STRIPE_KEY);

("use strict");

/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async create(ctx) {
    const { products, total, userId } = ctx.request.body;
    const lineItems = await Promise.all(
      products.map(async (product) => {
        const item = await strapi
          .service("api::product.product")
          .findOne(product.id);
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: item.title,
            },
            unit_amount: item.price * 100,
          },
          quantity: product.quantity,
        };
      })
    );
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        success_url: `${process.env.CLIENT_URL}?success=true`,
        cancel_url: `${process.env.CLIENT_URL}?canceled=true`,
        line_items: lineItems,
        payment_method_types: ["card"],
      });
      await strapi.service("api::order.order").create({
        data: {
          products,
          stripeId: session.id,
          amount: total,
          userId
        },
      });
      return { stripeSession: session };
    } catch (error) {
      ctx.response.status = 500;
      return error;
    }
  },
  async find(ctx) {
    const { userId } = ctx.query;
    const items = await strapi.db.query("api::order.order").findMany({
      fields: ["stripeId", "createdAt", "id", "userId", "amount"],
      where: { userId: userId },
    });
    try {
      const orders = await Promise.all(
        items.map(async (order) => ({
          id: order.stripeId,
          timestamp: order.createdAt,
          products: order.products,
          amount: order.amount
        }))
      );
      return {
        data: orders,
      };
    } catch (error) {
      ctx.response.status = 500;
      return error;
    }
  },
}));
