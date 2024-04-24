import {
  OrderService,
  type SubscriberConfig,
  type SubscriberArgs,
} from "@medusajs/medusa"
import ShopifyService from "../services/shopify"

export default async function orderCapturedPaymentHandler({
  data, eventName, container, pluginOptions,
}: SubscriberArgs<Record<string, any>>) {
  const orderService: OrderService = container.resolve("orderService")
  const shopifyService: ShopifyService = container.resolve("shopifyService")
  const { id } = data

  try {
    const order = await orderService.retrieve(id)

    if (order) {
      await shopifyService.capturedOrderPayment(order)
      console.log("*** Order payment synced with shopify store ***")
    }

  } catch (error) {
    console.log("********** Error in orderCapturedPaymentHandler ********")
    console.log(error)
  }
}

export const config: SubscriberConfig = {
  event: OrderService.Events.COMPLETED,
  context: {
    subscriberId: "order-captured-payment-handler",
  },
}