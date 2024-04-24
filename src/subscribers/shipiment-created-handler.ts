import {
  OrderService,
  type SubscriberConfig,
  type SubscriberArgs,
  TrackingLink,
} from "@medusajs/medusa"
import ShopifyService from "../services/shopify"
import { EntityManager } from "typeorm"

export default async function shipmentCreatedHandler({
  data, eventName, container, pluginOptions,
}: SubscriberArgs<Record<string, any>>) {
  const manager: EntityManager = container.resolve("manager")
  const TrackingLinkRepository = manager.getRepository(TrackingLink)

  const orderService: OrderService = container.resolve("orderService")
  const shopifyService: ShopifyService = container.resolve("shopifyService")
  const { id } = data

  try {
    const order = await orderService.retrieve(id, { relations: ['fulfillments'] })
    const tracking = await TrackingLinkRepository.find({ where: { fulfillment_id: order.fulfillments[0].id } })

    if (order && tracking && tracking.length > 0) {
      const shopifyOrder = await shopifyService.getOrder(order.external_id)
      const shopifyFulfillments = await shopifyService.getFulfillments(order.external_id)
      if (shopifyOrder) {
        await shopifyService.updateOrderTracking(shopifyFulfillments[0].id, tracking[0].tracking_number)

        console.log("*** Order tracking synced with shopify store ***")
      }
    }

  } catch (error) {
    console.log("********** Error in shipmentCreatedHandler ********")
    console.log(error)
  }
}

export const config: SubscriberConfig = {
  event: OrderService.Events.SHIPMENT_CREATED,
  context: {
    subscriberId: "order-completed-handler",
  },
}