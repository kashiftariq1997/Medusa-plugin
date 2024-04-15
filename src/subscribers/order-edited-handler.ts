import {
  OrderService,
  type SubscriberConfig,
  type SubscriberArgs,
  LineItemService,
  OrderEditService,
} from "@medusajs/medusa"
import ShopifyService from "../services/shopify";

export default async function orderEdittedHandler({
  data, eventName, container, pluginOptions,
}: SubscriberArgs<Record<string, any>>) {
  const orderService: OrderService = container.resolve("orderService")
  const orderEditService: OrderEditService = container.resolve("orderEditService")
  const lineItemService: LineItemService = container.resolve("lineItemService")
  const shopifyService: ShopifyService = container.resolve("shopifyService")

  const { id, fields } = data || {}
  
  if(fields && fields.includes('external_id')) return;

  try {
    const orderEdit = await orderEditService.retrieve(id)

    if(!orderEdit) return;

    const order = await orderService.retrieve(orderEdit.order_id)
    const lineItems = await lineItemService.list({order_id: order.id})

    console.log("Edit", lineItems)
    if(order){
      const shopifyOrder = await shopifyService.updateOrder(order, lineItems)

      if(shopifyOrder){
        console.log("*** Updated Order synced with shopify store ***")
      }
    }
  } catch (error) {
    console.log("********** Error in productEditHandler ********")
    console.log(error)
  }
}


export const config: SubscriberConfig = {
  event: OrderEditService.Events.UPDATED,
  context: {
    subscriberId: "order-editted-handler",
  },
}