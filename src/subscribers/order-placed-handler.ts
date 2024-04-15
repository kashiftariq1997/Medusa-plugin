import {
  OrderService,
  type SubscriberConfig,
  type SubscriberArgs,
  LineItemService,
} from "@medusajs/medusa"
import ShopifyService from "../services/shopify"
import { UpdateOrderInput } from "@medusajs/medusa/dist/types/orders"

export default async function orderPlacedHandler({
  data, eventName, container, pluginOptions,
}: SubscriberArgs<Record<string, any>>) {
  const orderService: OrderService = container.resolve("orderService")
  const lineItemService: LineItemService = container.resolve("lineItemService")
  const shopifyService: ShopifyService = container.resolve("shopifyService")
  const { id } = data

  try {
    const order = await orderService.retrieve(id)
    const lineItems = await lineItemService.list({order_id: order.id})

    if(order){
      const shopifyOrder = await shopifyService.placeOrder(order, lineItems)

      if(shopifyOrder){
        const { id: external_Id } = shopifyOrder
        await orderService.update(id, { external_id: external_Id.toString()} as UpdateOrderInput)
        console.log("*** Order synced with shopify store ***")
      }
    }

  } catch (error) {
    console.log("********** Error in orderPlacedHandler ********")
    console.log(error)
  }
}

export const config: SubscriberConfig = {
  event: OrderService.Events.PLACED,
  context: {
    subscriberId: "order-placed-handler",
  },
}