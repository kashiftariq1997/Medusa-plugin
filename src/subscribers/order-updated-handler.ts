import {
  OrderService,
  type SubscriberConfig,
  type SubscriberArgs,
  LineItemService,
} from "@medusajs/medusa"
import ShopifyService from "../services/shopify";

export default async function orderUpdatedHandler({
  data, eventName, container, pluginOptions,
}: SubscriberArgs<Record<string, any>>) {
  const orderService: OrderService = container.resolve("orderService")
  const lineItemService: LineItemService = container.resolve("lineItemService")
  const shopifyService: ShopifyService = container.resolve("shopifyService")

  const { id, fields } = data || {}
  
  if(fields && fields.includes('external_id')) return;
  console.log(":::::::", data)
  try {
    const order = await orderService.retrieve(id)
    const lineItems = await lineItemService.list({order_id: order.id})

    console.log("Updated", lineItems)
    if(order){
      const shopifyOrder = await shopifyService.updateOrder(order, lineItems)

      if(shopifyOrder){
        console.log("*** Product synced with shopify store ***")
      }
    }
  } catch (error) {
    console.log("********** Error in productUpdateHandler ********")
    console.log(error)
  }
}


export const config: SubscriberConfig = {
  event: OrderService.Events.UPDATED,
  context: {
    subscriberId: "order-updated-handler",
  },
}