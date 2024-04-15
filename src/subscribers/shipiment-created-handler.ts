import {
  OrderService,
  type SubscriberConfig,
  type SubscriberArgs,
  FulfillmentService,
  TrackingLink,
} from "@medusajs/medusa"
import { UpdateOrderInput } from "@medusajs/medusa/dist/types/orders"
import ShopifyService from "../services/shopify"
import { EntityManager } from "typeorm"

export default async function shipmentCreatedHandler({
  data, eventName, container, pluginOptions,
}: SubscriberArgs<Record<string, any>>) {
  const manager: EntityManager = container.resolve("manager")
  const TrackingLinkRepository = manager.getRepository(TrackingLink)

  const orderService: OrderService = container.resolve("orderService")
  const fulfillmentService: FulfillmentService = container.resolve("fulfillmentService")
  const shopifyService: ShopifyService = container.resolve("shopifyService")
  const { id, fulfillment_id } = data
  try {
    const order = await orderService.retrieve(id, { relations: ['fulfillments'] })
    const tracking = await TrackingLinkRepository.find({ where: { fulfillment_id: order.fulfillments[0].id } })

    if (order && tracking && tracking.length > 0) {
      const shopifyOrder = await shopifyService.addFulfilmentAndTracking(order.external_id as unknown as number, tracking[0])

      if (shopifyOrder) {
        const { id: external_Id } = shopifyOrder
        await orderService.update(id, { external_id: external_Id.toString() } as UpdateOrderInput)
        console.log("*** Order fulfillment synced with shopify store ***")
      }
    }

  } catch (error) {
    console.log("********** Error in orderCreatedFulfillmentHandler ********")
    console.log(error)
  }
}

export const config: SubscriberConfig = {
  event: OrderService.Events.SHIPMENT_CREATED,
  context: {
    subscriberId: "order-completed-handler",
  },
}