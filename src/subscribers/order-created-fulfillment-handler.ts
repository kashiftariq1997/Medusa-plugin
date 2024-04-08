import {
  OrderService,
  type SubscriberConfig,
  type SubscriberArgs,
  LineItemService,
  FulfillmentService,
} from "@medusajs/medusa"
import ShopifyService from "../services/shopify"
import { UpdateOrderInput } from "@medusajs/medusa/dist/types/orders"

export default async function orderCreatedFulfillmentHandler({
  data, eventName, container, pluginOptions,
}: SubscriberArgs<Record<string, any>>) {
  const orderService: OrderService = container.resolve("orderService")
  const fulfillmentService: FulfillmentService = container.resolve("fulfillmentService")
  const shopifyService: ShopifyService = container.resolve("shopifyService")
  const { id } = data

  try {
    const order = await orderService.retrieve(id)
    
    if(order){
      const shopifyOrder = await shopifyService.addFulfilment(order.external_id as unknown as number)

      if(shopifyOrder){
        const { id: external_Id } = shopifyOrder
        await orderService.update(id, { external_id: external_Id.toString()} as UpdateOrderInput)
        console.log("*** Order fulfillment synced with shopify store ***")
      }
    }

  } catch (error) {
    console.log("********** Error in orderCreatedFulfillmentHandler ********")
    console.log(error)
  }
}

export const config: SubscriberConfig = {
  event: OrderService.Events.FULFILLMENT_CREATED,
  context: {
    subscriberId: "order-created-fulfillment-handler",
  },
}