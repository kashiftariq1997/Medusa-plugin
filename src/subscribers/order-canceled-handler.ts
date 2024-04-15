import {
  OrderService,
  type SubscriberConfig,
  type SubscriberArgs,
} from "@medusajs/medusa"
import ShopifyService from "../services/shopify"

export default async function orderCanceledHandler({
  data, eventName, container, pluginOptions,
}: SubscriberArgs<Record<string, any>>) {
  const orderService: OrderService = container.resolve("orderService")
  const shopifyService: ShopifyService = container.resolve("shopifyService")
  const { id } = data

  try {
    const order = await orderService.retrieve(id)

    if (order) {
      const shopifyOrder = await shopifyService.cancelOrder(order)
      console.log("*** Cancelled Order synced with shopify store ***")
    }

  } catch (error) {
    console.log("********** Error in orderCancelHandler ********")
    console.log(error)
  }
}

export const config: SubscriberConfig = {
  event: OrderService.Events.CANCELED,
  context: {
    subscriberId: "order-canceled-handler",
  },
}